import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { register } from "../../redux/actions/authActions";
import "../../../src/index.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "", profileImage: "" });
    const [file, setFile] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("http://localhost:5001/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setForm({ ...form, profileImage: res.data.url });
        } catch (error) {
            toast.error("Image upload failed. Please try again.");
            console.error("File upload failed:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (file) await handleUpload();
        try {
            const response = await dispatch(register(form)); 
            if (response?.success) {
                toast.success("Signup successful! Redirecting...");
                setTimeout(() => navigate("/chat"), 2000); 
            }
        } catch (error) {
            toast.error("Signup failed. Please try again.");
            console.error(error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                <ToastContainer />
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign Up</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        Register
                    </button>
                </form>
                <p className="text-sm text-gray-600 mt-4 text-center">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-blue-500 hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
