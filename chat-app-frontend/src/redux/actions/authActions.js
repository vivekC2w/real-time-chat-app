import { signIn, signUp } from "../../utils/api";

export const login = (formData) => async (dispatch) => {
    try {
        const { data } = await signIn(formData);
        localStorage.setItem("token", data.token);
        dispatch({ type: "LOGIN", payload: data });
    } catch (error) {
        console.error("Login Failed", error);
    }
};

export const register = (formData) => async (dispatch) => {
    try {
        const { data } = await signUp(formData);
        localStorage.setItem("token", data.token);
        dispatch({ type: "SIGNUP", payload: data });
        return { success: true };
    } catch (error) {
        console.error("Registration Failed", error);
        return { success: false };
    }
};

export const logout = () => (dispatch) => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
}
