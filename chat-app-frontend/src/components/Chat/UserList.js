import React from "react";

const UserList = ({ users, loggedInUserId, onSelectUser, selectedUser }) => {
    const filteredUsers = users.filter((usr) => usr.id !== loggedInUserId);

    return (
        <div className="user-list">
            {filteredUsers.map((usr) => (
                <div key={usr.id} className={`user-item ${selectedUser?.id === usr.id ? 'active' : ''}`} onClick={() => onSelectUser(usr)}>
                    <img src={usr.profilePic} alt="avatar" className="avatar" />
                    <span>{usr.name}</span>
                </div>
            ))}
        </div>
    );
};

export default UserList;
