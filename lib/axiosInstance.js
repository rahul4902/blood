import axios from 'axios';

// Create Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || '/ext-api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from secure storage (e.g., localStorage, or better: httpOnly cookie)
    const token = localStorage.getItem('accessToken');

    // Add Bearer token to headers if it exists
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Allow dynamic header modifications
    config.headers = {
      ...config.headers,
      // Add or override custom headers here
      'X-Custom-Header': 'CustomValue',
      // Example: Add timestamp for request tracking
      'X-Request-Timestamp': new Date().toISOString(),
    };

    return config;
  },
  (error) => {
    // Handle request errors
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Return response as is
    return response;
  },
  async (error) => {
    // Handle token refresh or unauthorized errors
    if (error.response?.status === 401) {
      // Optional: Implement token refresh logic
      try {
        // Example: Refresh token logic
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post('/refresh-token', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          // Retry original request with new token
          error.config.headers['Authorization'] = `Bearer ${data.accessToken}`;
          return axiosInstance(error.config);
        }
      } catch (refreshError) {
        // Handle refresh token failure (e.g., logout user)
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Optionally redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to update headers dynamically
export const updateAxiosHeaders = (newHeaders) => {
  Object.assign(axiosInstance.defaults.headers, newHeaders);
};

export default axiosInstance;