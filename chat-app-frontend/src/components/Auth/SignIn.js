import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/actions/authActions";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "../../../src/index.css";

const SignIn = () => {
    const [form, setForm] = useState({ email: "", password: ""});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await dispatch(login(form)); 
            if (response?.success) {
                toast.success("Login successful! Redirecting...");
                setTimeout(() => navigate("/chat"), 2000); 
            }
        } catch (error) {
            toast.error("Login failed. Please try again.");
        }
    };

    useEffect(() => {
        if (user) navigate("/chat");
    }, [user, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl">
                <ToastContainer />
                <h2 className="text-2xl font-semibold text-center text-gray-700">Sign In</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Email" 
                            onChange={handleChange} 
                            required 
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Password" 
                            onChange={handleChange} 
                            required 
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        Login
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Don't have an account? 
                    <a href="/signup" className="text-blue-500 hover:underline"> Sign up</a>
                </p>
            </div>
        </div>
    )
}

export default SignIn;