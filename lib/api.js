// lib/api.js
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // Important for httpOnly cookies
});

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Request Interceptor - Add JWT token to all requests
apiClient.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor - Handle token expiration and errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 403 Forbidden (Token Expired) or 401 Unauthorized
        if ((error.response?.status === 403 || error.response?.status === 401) &&
            !originalRequest._retry) {

            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call refresh endpoint
                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    {
                        withCredentials: true,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                if (response.data.accessToken) {
                    const newToken = response.data.accessToken;

                    // Store new token
                    localStorage.setItem('accessToken', newToken);

                    // Update default header
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                    // Update original request header
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                    // Process queued requests
                    processQueue(null, newToken);

                    // Retry original request
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - logout user
                processQueue(refreshError, null);

                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('tokenExpiry');

                    const currentPath = window.location.pathname + window.location.search;
                    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
                    console.log('redirectUrl', redirectUrl)
                    // window.location.href = redirectUrl;
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other errors
        return Promise.reject(error);
    }
);

export const testAPI = {
    // Search
    search: async (query, pageTests = 1, pagePackages = 1, limitTests = 10, limitPackages = 10) => {
        const response = await apiClient.get("/search", {
            params: {
                q: query,
                pageTests,
                pagePackages,
                limitTests,
                limitPackages
            }
        });
        return response.data;
    },

    getMostSearched: async () => {
        const response = await apiClient.get("/search/most-searched");
        return response.data;
    },

    // Single unified endpoint for all test types
    getTests: async (params = {}) => {
        try {
            const response = await apiClient.get("/tests/getTests", { params });
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            return {
                success: false,
                data: [],
                pagination: { total: 0, page: 1, limit: 10, totalPages: 0, hasMore: false }
            };
        }
    },

    // Convenience methods using getTests
    getAllTests: async (limit = 10, page = 1) => {
        return testAPI.getTests({ type: "all", limit, page });
    },

    getPopularTests: async (limit = 10, page = 1) => {
        return testAPI.getTests({ type: "popular", limit, page });
    },

    getFeaturedTests: async (limit = 10, page = 1) => {
        return testAPI.getTests({ type: "featured", limit, page });
    },

    getSpecialOffers: async (limit = 10, page = 1) => {
        return testAPI.getTests({ type: "special-offers", limit, page });
    },

    getTestsByCategory: async (categorySlug, limit = 10, page = 1) => {
        return testAPI.getTests({ category: categorySlug, limit, page });
    },

    // Get specific test
    getTestById: async (id) => {
        const response = await apiClient.get(`/tests/${id}`);
        return response.data;
    },

    getTestBySlug: async (slug) => {
        const response = await apiClient.get(`/tests/slug/${slug}`);
        return response?.data?.data;
    },

    // Get package by ID
    getPackageById: async (id) => {
        const response = await apiClient.get(`/packages/${id}`);
        return response.data;
    },

    // Get related packages
    getRelatedPackages: async (testSlug, limit = 3) => {
        const response = await apiClient.get(`/tests/slug/${testSlug}/related-packages`, {
            params: { limit }
        });
        return response.data;
    },

    // Increment search count
    incrementSearch: async (slug) => {
        const response = await apiClient.post(`/tests/increment-search/${slug}`);
        return response.data;
    },

    // Categories
    getCategories: async (params = {}) => {
        try {
            const response = await apiClient.get("/categories/front/get", { params });
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            return {
                success: false,
                data: [],
                pagination: { total: 0, page: 1, limit: 20, totalPages: 0, hasMore: false }
            };
        }
    },

    // Get featured categories for home page
    getFeaturedCategories: async (limit = 8) => {
        return testAPI.getCategories({ featured: true, limit });
    },

    // Get popular packages (separate endpoint if needed)
    getPopularPackages: async (limit = 10, page = 1) => {
        const response = await apiClient.get("/tests/popular/packages", {
            params: { limit, page }
        });
        return response.data;
    }
};

// Address API
export const addressAPI = {
    // Get all addresses for logged-in user
    getAddresses: async () => {
        try {
            const response = await apiClient.get("/addresses");
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error.response?.data || { message: error.message };
        }
    },

    // Add new address
    addAddress: async (addressData) => {
        try {
            const response = await apiClient.post("/addresses", addressData);
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error.response?.data || { message: error.message };
        }
    },

    // Update address
    updateAddress: async (id, addressData) => {
        try {
            const response = await apiClient.put(`/addresses/${id}`, addressData);
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error.response?.data || { message: error.message };
        }
    },

    // Delete address
    deleteAddress: async (id) => {
        try {
            const response = await apiClient.delete(`/addresses/${id}`);
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error.response?.data || { message: error.message };
        }
    },

    // Get address by ID
    getAddressById: async (id) => {
        try {
            const response = await apiClient.get(`/addresses/${id}`);
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error.response?.data || { message: error.message };
        }
    },

    // Set address as default
    setAsDefault: async (id) => {
        try {
            const response = await apiClient.put(`/addresses/${id}`, {
                isDefault: true
            });
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error.response?.data || { message: error.message };
        }
    }
};

// Auth API
export const authAPI = {
    // User Login
    login: async (credentials) => {
        try {
            const response = await apiClient.post("/auth/login", credentials);

            // Store accessToken (not token!)
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('tokenExpiry', response.data.expiryDate);
            }

            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error.response?.data || { message: error.message };
        }
    },

    // Register
    register: async (userData) => {
        try {
            const response = await apiClient.post("/auth/register", userData);

            // Store accessToken (not token!)
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('tokenExpiry', response.data.expiryDate);
            }

            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error.response?.data || { message: error.message };
        }
    },

    // Logout
    logout: async () => {
        try {
            await apiClient.post("/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('tokenExpiry');

            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            const response = await apiClient.get("/auth/me");
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error.response?.data || { message: error.message };
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        if (typeof window === 'undefined') return false;

        const token = localStorage.getItem('accessToken');
        const expiry = localStorage.getItem('tokenExpiry');

        if (!token) return false;

        // Check if token is expired
        if (expiry && new Date(expiry) < new Date()) {
            return false;
        }

        return true;
    },
    fetchMonthAvailability: async (year, month) => {
        try {
            const response = await apiClient.get('/api/slots', {
                params: {
                    year,
                    month
                }
            })

            if (response.data.success) {
                return response.data.data
            } else {
                throw new Error('Failed to fetch availability')
            }
        } catch (error) {
            console.error('API Error:', error.message)
            throw error
        }
    },
    bookSlot: async (bookingData) => {
        try {
            const response = await apiClient.post('/api/bookings', bookingData)
            return response.data
        } catch (error) {
            console.error('Booking Error:', error.message)
            throw error
        }
    }

};

export default apiClient;
