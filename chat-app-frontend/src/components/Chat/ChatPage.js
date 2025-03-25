import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, fetchUsers, sendMessage } from "../../utils/api";
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
            socketRef.current = io("http://localhost:5001");

            socketRef.current.on("receiveMessage", (msg) => {
                setMessage((prev) => [...prev, msg]);
            });

            if (user) socketRef.current.emit("userOnline", user.id);
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
            console.log(userList);
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

    const handleSend = async () => {
        if (message.trim() === "" || !selectedUser) return;
        const newMessage = { 
            senderId: user.userId, 
            receiverId: selectedUser.id, 
            content: message, 
            type: "text" 
        };
  
        setMessages([...messages, newMessage]);
        socketRef.current.emit("sendMessage", newMessage);
        await sendMessage(newMessage);
        setMessage("");
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
                      <p>{msg?.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
