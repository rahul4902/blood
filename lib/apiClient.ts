"use client";

// apiClient.ts (or wherever you want to place this - import and use in your components)
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { baseURL } from "./utils";

// Create Axios instance
const apiClient = axios.create({
    baseURL: "/api", // Adjust to your API base URL
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Important for sending cookies (e.g., refresh token)
});

// Request Interceptor: Auto-refresh token if expired (for authenticated requests)
apiClient.interceptors.request.use(
    async (config) => {
        // Skip auth logic if specified in config (for public APIs)
        if (config?.skipAuth) {
            return config;
        }

        let token = localStorage.getItem("accessToken");
        const expiry = parseInt(localStorage.getItem("accessTokenExpiry") || "0");

        // Check if token is expired (with 5-second buffer)
        if (token && Date.now() >= expiry - 5000) {
            try {
                // Call refresh endpoint
                const refreshResponse = await axios.post(baseURL + "auth/refresh", null, { withCredentials: true });
                const { accessToken: newToken, expiresIn } = refreshResponse.data;

                // Update localStorage
                localStorage.setItem("accessToken", newToken);
                localStorage.setItem("accessTokenExpiry", (Date.now() + expiresIn * 1000).toString());

                token = newToken;
            } catch (error) {
                console.error("Token refresh failed:", error);
                // Optional: Handle logout or redirect
                localStorage.removeItem("accessToken");
                localStorage.removeItem("accessTokenExpiry");
                throw new Error("Session expired");
            }
        }

        // Attach token if available
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally (e.g., 401 for unauthorized)
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Optional: Trigger refresh or logout logic here if needed
            console.error("Unauthorized - Consider refreshing token or logging out");
        }
        return Promise.reject(error);
    }
);

// Export a function to make requests (allows custom headers and skipAuth)
export const apiRequest = async (
    method: "get" | "post" | "put" | "delete" | "patch",
    url: string,
    data?: any,
    customHeaders?: Record<string, string>,
    skipAuth: boolean = false
) => {
    return apiClient({
        method,
        url,
        data,
        headers: customHeaders,
        skipAuth, // Pass flag to skip auth (for public APIs)
    });
};
