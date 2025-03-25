import { jwtDecode } from "jwt-decode";

const getToken = () => {
    const token = localStorage.getItem("token");
    try {
        return token ? jwtDecode(token) : null;
    } catch (error) {
        console.error("Invalid Token:", error);
        localStorage.removeItem("token");
        return null;
    }
}

const initialState = {
    user: getToken(),
    token: localStorage.getItem("token") || null
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case "LOGIN":
            localStorage.setItem("token", action.payload.token);
            return { ...state, user: getToken(), token: action.payload.token };
        case "SIGNUP":
            localStorage.setItem("token", action.payload.token);
            return { ...state, user: getToken(), token: action.payload.token}
        case "LOGOUT":
            localStorage.removeItem("token");
            return { ...state, user: null, token: null };
        default:
            return state;
    }
};

export default authReducer;