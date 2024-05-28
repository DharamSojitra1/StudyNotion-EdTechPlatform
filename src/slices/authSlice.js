import { createSlice } from "@reduxjs/toolkit";

// Function to decode JWT payload
const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (error) {
        console.error("Error decoding token", error);
        return null;
    }
};

const getTokenFromLocalStorage = () => {
    try {
        const token = localStorage.getItem("token");
        return token ? token : null;
    } catch (error) {
        console.error("Error getting token from localStorage", error);
        return null;
    }
};

const initialState = {
    token: getTokenFromLocalStorage(),
    signupData: null,
    loading: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setSignupData(state, action) {
            state.signupData = action.payload;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setToken(state, action) {
            state.token = action.payload;
        }
    }
});

export const { setToken, setLoading, setSignupData } = authSlice.actions;
export default authSlice.reducer;
