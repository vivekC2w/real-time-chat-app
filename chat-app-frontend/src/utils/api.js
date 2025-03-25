import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5001/api" });

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

export const signIn = (formData) => API.post("/auth/login", formData);
export const signUp = (formData) => API.post("/auth/signup", formData);
export const sendMessage = (messageData) => API.post("/chat/send", messageData);
export const messageAck = (msgId) => API.post("/chat/ack", { msgId });
export const fetchUsers = () => API.get("/auth/users");
export const fetchMessages = (senderId, receiverId) => 
    API.get(`/auth/messages`, { params: { senderId, receiverId } }); 
