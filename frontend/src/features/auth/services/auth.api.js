// import axios from "axios";
import api from '../../../lib/api.js';


/**
 * Registers a new user account.
 * @param {{ username: string, email: string, password: string }} params
 * @returns {Promise<{ message: string, user: object }>}
 */
export async function register({ username, email, password }) {
    const response = await api.post('/api/auth/register', { username, email, password });
    return response.data;
}

/**
 * Logs in with email and password.
 * @param {{ email: string, password: string }} params
 * @returns {Promise<{ message: string, user: object }>}
 */
export async function login({ email, password }) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
}

/**
 * Logs out the current user — clears the server-side cookie and blacklists the token.
 * @returns {Promise<{ message: string }>}
 */
export async function logout() {
    const response = await api.get('/api/auth/logout');
    return response.data;
}

/**
 * Returns the currently authenticated user's profile from the server.
 * Used on app load to restore session state.
 * @returns {Promise<{ message: string, user: object }>}
 */
export async function getMe() {
    const response = await api.get('/api/auth/get-me');
    return response.data;
}
