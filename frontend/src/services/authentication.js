// Server side user authentication 

import { usersApi } from "./api";

// Manages user JWT access token
export const authentication = {
    // Login and save token
    async login(data) {
        const response = await usersApi.login(data);

        localStorage.setItem("access_token", response.access_token);

    return response;
  },

    // Remove token
    logout() {
        localStorage.removeItem("access_token");
    },

    // Get token
    getToken() {
        return localStorage.getItem("access_token");
    },

    // Check if user is logged in -returns True or False
    statusToken() {
        return !!this.getToken();
    }
};