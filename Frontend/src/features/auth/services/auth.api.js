import axios from "axios";

// FIXED: Changed baseUrl to baseURL
const api = axios.create({
    baseURL: 'http://localhost:3000', 
    withCredentials: true
});

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        });
        return response.data;
    } catch (err) {
        console.log(err);
        throw err; // Important: Rethrow the error so your UI knows login failed!
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post('/api/auth/login', {
            email, password
        });
        return response.data;
    } catch (err) {
        console.log(err);
        throw err; 
    }
}

export async function logout() {
    try {
        const response = await api.get('/api/auth/logout');
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export async function getMe() {
    try {
        // FIXED: Added 'await' before api.get
        const response = await api.get('/api/auth/get-me');
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
}