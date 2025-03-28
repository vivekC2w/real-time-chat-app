import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchMessages, fetchUsers, sendMessage, uploadFile } from "../../utils/api";
import io from "socket.io-client";
import { logout } from "../../redux/actions/authActions";
import UserList from "./UserList";
import "../../../src/index.css";

const ChatPage = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [user, setUser] = useState(null);
    const [file, setFile] = useState(null);
    const dispatch = useDispatch();
    const socketRef = useRef(null);

    useEffect(() => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
          setUser(JSON.parse(loggedInUser));
        }
      }, []);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io("http://localhost:5001", {
              query: { userId: user?.userId }
          });

            socketRef.current.on("receiveMessage", (msg) => {
              setMessages((prev) => [...prev, msg]);
            });

            if (user) socketRef.current.emit("online", user.id);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user]);

    useEffect(() => {
        const fetchUserList = async() => {
            const userList = await fetchUsers();
            setUsers(userList?.data);
        };
        fetchUserList();
    }, []);

    useEffect(() => {
        const loadMessages = async () => {
            if (selectedUser) {
                const response = await fetchMessages(user.userId, selectedUser.id);
                setMessages(response?.data?.data);
            }
        };
        loadMessages();
    }, [selectedUser]);

    useEffect(() => {
      const handleReconnect = () => {
        if (socketRef.current && user) {
          socketRef.current.emit("resendOfflineMessages", user.userId);
          const offlineMessages = JSON.parse(localStorage.getItem("offlineMessages") || "[]");
            if (offlineMessages.length > 0) {
                offlineMessages.forEach((msg) => {
                    socketRef.current.emit("sendMessage", msg);
                });
                localStorage.removeItem("offlineMessages");
            }
        }
      };
      window.addEventListener("online", handleReconnect);
      return () => {
        window.removeEventListener("online", handleReconnect);
      };
    }, [user]);

    const handleSend = async () => {
        if ((!message.trim() && !file) || !selectedUser) return;

        let fileUrl = "";
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            try {
              const uploadResponse = await uploadFile(formData);
                if (uploadResponse?.data?.url) {
                    fileUrl = uploadResponse.data.url;
                } else {
                    console.error("File upload failed: No fileUrl returned");
                    return;
                }
              } catch (error) {
                  console.error("File upload error:", error);
                  return;
              }
        }
        const newMessage = { 
            senderId: user.userId, 
            receiverId: selectedUser.id, 
            content: file ? fileUrl : message, 
            type: file?.type ?? "text",
            timestamp: Date.now() 
        };

        if (navigator.onLine) {
          console.log("Is Online message?");
          socketRef.current.emit("sendMessage", newMessage);
          try {
              await sendMessage(newMessage);
          } catch (error) {
              console.error("Error sending message:", error);
          }
        } else {
            console.log("Offline message:", newMessage);
            console.log("Storing in local storage");
            const offlineMessages = JSON.parse(localStorage.getItem("offlineMessages") || "[]");
            offlineMessages.push(newMessage);
            console.log("Setting message in local storage");
            localStorage.setItem("offlineMessages", JSON.stringify(offlineMessages));
        }
        setMessages((prev) => [...prev, newMessage]);
        setMessage("");
        setFile(null);
    };

    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };

    const handleLogout = () => {
        dispatch(logout());
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };

    if (!user) {
      return (
          <div className="flex items-center justify-center h-screen">
              <p className="text-gray-600 text-lg">Please log in to access the chat</p>
          </div>
      );
  }

    return (
      <div className="flex h-screen">
        <div className="w-1/4 bg-gray-900 text-white p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                src={user?.profilePicture}
                alt="avatar"
                className="w-10 h-10 rounded-full mr-2"
              />
              <span className="font-semibold">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded-md text-sm hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          <UserList
            users={users}
            loggedInUserId={user?.userId}
            onSelectUser={setSelectedUser}
            selectedUser={selectedUser}
          />
        </div>

        <div className="w-3/4 flex flex-col bg-gray-100">
          {selectedUser ? (
            <>
              <div className="flex items-center bg-white shadow-md p-4">
                <img
                  src={selectedUser?.profilePicture}
                  alt="avatar"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <h3 className="text-lg font-semibold">{selectedUser?.name}</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.senderId === user.userId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-xs ${
                        msg.senderId === user?.userId
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-black"
                      }`}
                    >
                      <strong>
                        {msg.senderId === user?.userId
                          ? "Me"
                          : selectedUser?.name}
                        :
                      </strong>
                      {msg.type === "text" ? (
                        <p>{msg?.content}</p>
                      ) : msg.type.includes("image") ? (
                        <img
                          src={msg.content}
                          alt="Sent image"
                          className="max-w-full rounded-md mt-2"
                        />
                      ) : (
                        <a
                          href={msg.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 underline mt-2 block"
                        >
                          View File
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white flex items-center">
                <input
                  type="text"
                  id="messageInput"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  autoComplete="off"
                  className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <input
                  type="file"
                  id="fileInput"
                  name="file"
                  onChange={handleFileChange}
                  className="ml-2"
                />
                <button
                  onClick={handleSend}
                  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600 text-lg">
                Select a user to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    );
};

export default ChatPage;
