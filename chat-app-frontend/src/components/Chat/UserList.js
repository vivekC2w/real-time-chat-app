import React from "react";

const UserList = ({ users, loggedInUserId, onSelectUser, selectedUser }) => {
    const filteredUsers = users.filter((usr) => usr.id !== loggedInUserId);

    return (
        <div className="flex flex-col space-y-2">
            {filteredUsers.map((usr) => (
                <div
                    key={usr.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedUser?.id === usr.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    }`}
                    onClick={() => onSelectUser(usr)}
                >
                    <img
                        src={usr.profilePicture}
                        alt="avatar"
                        className="w-10 h-10 rounded-full mr-3 border-2 border-gray-300"
                    />
                    <span className="font-semibold">{usr.name}</span>
                </div>
            ))}
        </div>
    );
};

export default UserList;
