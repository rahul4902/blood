import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================
// Access Token Management (from AuthContext)
// ============================================
let accessTokenGetter = null;
let accessTokenSetter = null;
let csrfTokenGetter = null;
let refreshTokenFunction = null;

/**
 * Initialize API client with auth functions from AuthContext
 * Call this in your AuthProvider
 */
export const initializeApiClient = (authFunctions) => {
  accessTokenGetter = authFunctions.getAccessToken;
  accessTokenSetter = authFunctions.setAccessToken;
  csrfTokenGetter = authFunctions.getCsrfToken;
  refreshTokenFunction = authFunctions.refreshAccessToken;


  if (accessTokenGetter) {
    const token = accessTokenGetter();

  }
};

// ============================================
// Axios Instance
// ============================================
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ============================================
// Token-refresh queue management
// ============================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

// ============================================
// REQUEST INTERCEPTOR
// ============================================
apiClient.interceptors.request.use(
  (config) => {

    // Add access token from memory if available
    if (accessTokenGetter) {
      const token = accessTokenGetter();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;

      } else {
        console.log("   ⚠️ No token available");
      }
    } else {
      console.log("   ❌ accessTokenGetter not initialized");
    }

    // Add CSRF token for state-changing operations
    if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())) {
      let csrfToken = null;

      if (csrfTokenGetter) {
        csrfToken = csrfTokenGetter();
      }

      if (!csrfToken) {
        csrfToken = getCookie("csrf_token");
      }

      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
        console.log("   🛡️ CSRF token added");
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
apiClient.interceptors.response.use(
  (response) => {

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(
      `❌ ${originalRequest.method?.toUpperCase()} ${originalRequest.url
      } - ${error.response?.status}`
    );
    console.error(
      "   Error:",
      (error.response?.data)?.message || error.message
    );

    // Check if error response indicates token expiration
    const is401 = error.response?.status === 401;
    const isTokenExpired =
      (error.response?.data)?.code === "TOKEN_EXPIRED" ||
      (error.response?.data)?.message?.includes("expired") ||
      (error.response?.data)?.message?.includes("Invalid token");

    // Only attempt refresh for token expiration, not for other 401s
    if (is401 && isTokenExpired && !originalRequest._retry) {
      console.log("🔄 Token expired, attempting refresh...");

      if (isRefreshing) {
        console.log("   ⏳ Refresh already in progress, queueing request...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            console.log("   ♻️ Retrying queued request");
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use AuthContext's refresh function if available
        if (refreshTokenFunction) {
          console.log("   🔄 Using AuthContext refresh function");
          const success = await refreshTokenFunction();

          if (success) {
            console.log("   ✅ Token refresh successful (via AuthContext)");

            if (accessTokenGetter) {
              const newToken = accessTokenGetter();

              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                console.log(
                  "   🔑 New token applied:",
                  newToken.substring(0, 20) + "..."
                );
              } else {
                console.error("   ❌ New token is null after refresh!");
                throw new Error("Token refresh succeeded but token is null");
              }
            } else {
              console.error("   ❌ accessTokenGetter not available");
              throw new Error("Cannot get new token");
            }

            processQueue(null, null);
            console.log("   ♻️ Retrying original request");
            return apiClient(originalRequest);
          } else {
            console.error("   ❌ Refresh function returned false");
            throw new Error("Refresh failed");
          }
        } else {
          // Fallback: Direct API call
          console.log("   🔄 Using direct refresh API call (fallback)");
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              withCredentials: true,
              timeout: 5000,
            }
          );

          if (response.data.success) {
            console.log("   ✅ Token refresh successful (direct)");

            const newToken = response.data.accessToken;

            if (newToken) {
              // Update access token if setter available
              if (accessTokenSetter) {
                accessTokenSetter(newToken);
                console.log("   💾 Token stored in AuthContext");
              }

              // Update request header
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              console.log(
                "   🔑 New token applied:",
                newToken.substring(0, 20) + "..."
              );

              processQueue(null, newToken);
              return apiClient(originalRequest);
            } else {
              console.error("   ❌ Response has no accessToken");
              throw new Error("No access token in response");
            }
          } else {
            console.error("   ❌ Refresh response not successful");
            throw new Error("Refresh failed");
          }
        }
      } catch (refreshError) {
        console.error(
          "❌ Token refresh failed:",
          (refreshError).message
        );

        processQueue(refreshError, null);

        // Refresh failed → force logout
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");

          const currentPath =
            window.location.pathname + window.location.search;

          if (!window.location.pathname.includes("/login")) {
            const redirectUrl = `/login?redirect=${encodeURIComponent(
              currentPath
            )}`;
            console.log("🔐 Redirecting to login:", redirectUrl);
            window.location.href = redirectUrl;
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

// ============================================
// Helper Functions
// ============================================
function getCookie(name) {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

// ============================================
// Settings API
// ============================================
export const settingsAPI = {
  getAll: async (category = null) => {
    const params = category ? { category } : {};
    const { data } = await apiClient.get("/settings", { params });
    return data;
  },

  getByKey: async (key) => {
    const { data } = await apiClient.get(`/settings/${key}`);
    return data;
  },

  getPublic: async () => {
    const { data } = await apiClient.get("/settings/public");
    return data;
  },

  upsert: async (settingData) => {
    const { data } = await apiClient.post("/settings", settingData);
    return data;
  },

  bulkUpdate: async (settings) => {
    const { data } = await apiClient.put("/settings/bulk", { settings });
    return data;
  },

  delete: async (key) => {
    const { data } = await apiClient.delete(`/settings/${key}`);
    return data;
  },
};

// ============================================
// Time Slots API - UPDATED WITH NEW ROUTES
// ============================================
export const timeSlotsAPI = {
  /**
   * ==========================================
   * ADMIN ROUTES (Protected)
   * ==========================================
   */

  // Generate time slots for date range
  generateTimeSlots: async (startDate, endDate) => {
    const { data } = await apiClient.post("/timeslots/generate", {
      startDate,
      endDate,
    });
    return data;
  },

  // Get all slots by month (admin view)
  getByMonthAdmin: async (month, year) => {
    const { data } = await apiClient.get("/timeslots/month", {
      params: { month, year },
    });
    return data;
  },

  // Get slots by date (admin view)
  getByDateAdmin: async (date) => {
    const { data } = await apiClient.get(`/timeslots/date/${date}`);
    return data;
  },

  // Toggle slot availability (admin)
  toggleSlot: async (slotId, is_available) => {
    const { data } = await apiClient.patch(
      `/timeslots/${slotId}/toggle`,
      { is_available }
    );
    return data;
  },

  // Delete slots for date range (admin)
  deleteSlots: async (startDate, endDate) => {
    const { data } = await apiClient.delete("/timeslots/delete", {
      data: { startDate, endDate },
    });
    return data;
  },

  // Toggle date (disable/enable) (admin)
  toggleDate: async (date, reason = "") => {
    const { data } = await apiClient.post("/timeslots/toggle-date", {
      date,
      reason,
    });
    return data;
  },

  // Get disabled dates (admin)
  getDisabledDates: async () => {
    const { data } = await apiClient.get("/timeslots/disabled-dates");
    return data;
  },

  // Check date bookings (admin)
  checkDateBookingsAdmin: async (date) => {
    const { data } = await apiClient.get(
      `/timeslots/check-bookings/${date}`
    );
    return data;
  },

  // Check date range bookings (admin)
  checkDateRangeBookingsAdmin: async (startDate, endDate) => {
    const { data } = await apiClient.get(
      "/timeslots/check-range-bookings",
      {
        params: { startDate, endDate },
      }
    );
    return data;
  },

  // Check month bookings (admin)
  checkMonthBookingsAdmin: async (month, year) => {
    const { data } = await apiClient.get(
      "/timeslots/check-month-bookings",
      {
        params: { month, year },
      }
    );
    return data;
  },

  /**
   * ==========================================
   * PUBLIC ROUTES (For Booking)
   * ==========================================
   */

  // Get slots by month (public)
  getByMonth: async (month, year) => {
    const { data } = await apiClient.get("/timeslots/month", {
      params: { month, year },
    });
    return data;
  },

  // Get slots by date (public)
  getByDate: async (date) => {
    const { data } = await apiClient.get(`/timeslots/date/${date}`);
    return data;
  },

  // Get available slots by month (public)
  getAvailableByMonth: async (month, year) => {
    const { data } = await apiClient.get(
      "/timeslots/available-month",
      {
        params: { month, year },
      }
    );
    return data;
  },

  // Get booking settings (public)
  getPublicSettings: async () => {
    const { data } = await apiClient.get("/timeslots/settings");
    return data;
  },

  // Get next available dates (public)
  getNextAvailableDates: async (limit = 7) => {
    const { data } = await apiClient.get(
      "/timeslots/next-available",
      {
        params: { limit },
      }
    );
    return data;
  },

  // Check date availability (public)
  checkDateAvailability: async (date) => {
    const { data } = await apiClient.get(
      `/timeslots/check-availability/${date}`
    );
    return data;
  },

  // Check date bookings (public)
  checkDateBookings: async (date) => {
    const { data } = await apiClient.get(
      `/timeslots/check-bookings/${date}`
    );
    return data;
  },

  // Check date range bookings (public)
  checkDateRangeBookings: async (startDate, endDate) => {
    const { data } = await apiClient.get(
      "/timeslots/check-range-bookings",
      {
        params: { startDate, endDate },
      }
    );
    return data;
  },

  // Check month bookings (public)
  checkMonthBookings: async (month, year) => {
    const { data } = await apiClient.get(
      "/timeslots/check-month-bookings",
      {
        params: { month, year },
      }
    );
    return data;
  },
};

// ============================================
// Address API
// ============================================
export const addressAPI = {
  getAddresses: async () => {
    const { data } = await apiClient.get("/addresses");
    return data;
  },

  addAddress: async (addressData) => {
    const { data } = await apiClient.post("/addresses", addressData);
    return data;
  },

  updateAddress: async (id, addressData) => {
    const { data } = await apiClient.put(`/addresses/${id}`, addressData);
    return data;
  },

  deleteAddress: async (id) => {
    const { data } = await apiClient.delete(`/addresses/${id}`);
    return data;
  },

  getAddressById: async (id) => {
    const { data } = await apiClient.get(`/addresses/${id}`);
    return data;
  },

  setAsDefault: async (id) => {
    const { data } = await apiClient.put(`/addresses/${id}`, {
      isDefault: true,
    });
    return data;
  },
};

// ============================================
// Auth API
// ============================================
export const authAPI = {
  login: async (credentials) => {
    const { data } = await apiClient.post("/auth/login", credentials);
    return data;
  },

  register: async (userData) => {
    const { data } = await apiClient.post("/auth/register", userData);
    return data;
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
      console.log("✅ Logout successful");
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
  },

  refresh: async () => {
    const { data } = await apiClient.post("/auth/refresh");
    return data;
  },

  getProfile: async () => {
    const { data } = await apiClient.get("/auth/profile");
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await apiClient.put("/auth/profile", profileData);
    return data;
  },

  changePassword: async (passwordData) => {
    const { data } = await apiClient.post(
      "/auth/change-password",
      passwordData
    );
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await apiClient.post("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (resetData) => {
    const { data } = await apiClient.post("/auth/reset-password", resetData);
    return data;
  },

  isAuthenticated: async () => {
    if (typeof window === "undefined") return false;
    try {
      await apiClient.get("/auth/profile");
      return true;
    } catch (e) {
      return false;
    }
  },
};

// ============================================
// Test API
// ============================================
export const testAPI = {
  search: async (
    query,
    pageTests = 1,
    pagePackages = 1,
    limitTests = 10,
    limitPackages = 10
  ) => {
    const { data } = await apiClient.get("/search", {
      params: { q: query, pageTests, pagePackages, limitTests, limitPackages },
    });
    return data;
  },

  getMostSearched: async () => {
    const { data } = await apiClient.get("/search/most-searched");
    return data;
  },

  getTests: async (params = {}) => {
    try {
      const { data } = await apiClient.get("/tests/getTests", { params });
      return data;
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasMore: false,
        },
      };
    }
  },

  getAllTests: (limit = 10, page = 1) =>
    testAPI.getTests({ type: "all", limit, page }),
  getPopularTests: (limit = 10, page = 1) =>
    testAPI.getTests({ type: "popular", limit, page }),
  getFeaturedTests: (limit = 10, page = 1) =>
    testAPI.getTests({ type: "featured", limit, page }),
  getSpecialOffers: (limit = 10, page = 1) =>
    testAPI.getTests({ type: "special-offers", limit, page }),
  getTestsByCategory: (categorySlug, limit = 10, page = 1) =>
    testAPI.getTests({ category: categorySlug, limit, page }),

  getTestById: async (id) => {
    const { data } = await apiClient.get(`/tests/${id}`);
    return data;
  },

  getTestBySlug: async (slug) => {
    const { data } = await apiClient.get(`/tests/slug/${slug}`);
    return data?.data;
  },

  getPackageById: async (id) => {
    const { data } = await apiClient.get(`/packages/${id}`);
    return data;
  },

  getRelatedPackages: async (testSlug, limit = 3) => {
    const { data } = await apiClient.get(
      `/tests/slug/${testSlug}/related-packages`,
      { params: { limit } }
    );
    return data;
  },

  incrementSearch: async (slug) => {
    const { data } = await apiClient.post(`/tests/increment-search/${slug}`);
    return data;
  },

  getCategories: async (params = {}) => {
    try {
      const { data } = await apiClient.get("/categories/front/get", { params });
      return data;
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasMore: false,
        },
      };
    }
  },

  getFeaturedCategories: (limit = 8) =>
    testAPI.getCategories({ featured: true, limit }),

  getPopularPackages: async (limit = 10, page = 1) => {
    const { data } = await apiClient.get("/tests/popular/packages", {
      params: { limit, page },
    });
    return data;
  },
};

// ============================================
// Category API
// ============================================
export const categoryAPI = {
  getAll: async (params = {}) => {
    const { data } = await apiClient.get("/categories", { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await apiClient.get(`/categories/${id}`);
    return data;
  },

  create: async (categoryData) => {
    const { data } = await apiClient.post("/categories", categoryData);
    return data;
  },

  update: async (id, categoryData) => {
    const { data } = await apiClient.put(`/categories/${id}`, categoryData);
    return data;
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(`/categories/${id}`);
    return data;
  },
};

// ============================================
// Sample Type API
// ============================================
export const sampleTypeAPI = {
  getAll: async (params = {}) => {
    const { data } = await apiClient.get("/sample-types", { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await apiClient.get(`/sample-types/${id}`);
    return data;
  },

  create: async (sampleTypeData) => {
    const { data } = await apiClient.post("/sample-types", sampleTypeData);
    return data;
  },

  update: async (id, sampleTypeData) => {
    const { data } = await apiClient.put(
      `/sample-types/${id}`,
      sampleTypeData
    );
    return data;
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(`/sample-types/${id}`);
    return data;
  },
};

// ============================================
// Family Member API
// ============================================
export const familyMemberAPI = {
  /**
   * Get all family members with optional filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with family members and pagination
   */
  getAll: async (params = {}) => {
    const { data } = await apiClient.get("/family-members", { params });
    return data;
  },

  /**
   * Get single family member by ID
   * @param {string} id - Family member ID
   * @returns {Promise} Family member data
   */
  getById: async (id) => {
    const { data } = await apiClient.get(`/family-members/${id}`);
    return data;
  },


  create: async (memberData) => {
    const { data } = await apiClient.post("/family-members", memberData);
    return data;
  },

  update: async (id, memberData) => {
    const { data } = await apiClient.put(`/family-members/${id}`, memberData);
    return data;
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(`/family-members/${id}`);
    return data;
  },

  bulkDelete: async (ids) => {
    const { data } = await apiClient.post("/family-members/bulk-delete", {
      ids,
    });
    return data;
  },
  setDefault: async (id) => {
    const { data } = await apiClient.patch(
      `/family-members/${id}/set-default`
    );
    return data;
  },

  search: async (searchQuery, page = 1, limit = 10) => {
    const { data } = await apiClient.get("/family-members", {
      params: { search: searchQuery, page, limit },
    });
    return data;
  },

  /**
   * Get family members by relation
   * @param {string} relation - Relation type (Self, Spouse, etc.)
   * @param {Object} params - Additional query params
   * @returns {Promise} Filtered family members
   */
  getByRelation: async (relation, params = {}) => {
    const { data } = await apiClient.get("/family-members", {
      params: { relation, ...params },
    });
    return data;
  },

  /**
   * Get family members within age range
   * @param {number} minAge - Minimum age
   * @param {number} maxAge - Maximum age
   * @param {Object} params - Additional query params
   * @returns {Promise} Filtered family members
   */
  getByAgeRange: async (minAge, maxAge, params = {}) => {
    const { data } = await apiClient.get("/family-members", {
      params: { minAge, maxAge, ...params },
    });
    return data;
  },

  /**
   * Get family members by gender
   * @param {string} gender - Gender (Male, Female, Other)
   * @param {Object} params - Additional query params
   * @returns {Promise} Filtered family members
   */
  getByGender: async (gender, params = {}) => {
    const { data } = await apiClient.get("/family-members", {
      params: { gender, ...params },
    });
    return data;
  },

  /**
   * Get family members by blood group
   * @param {string} bloodGroup - Blood group (A+, A-, B+, etc.)
   * @param {Object} params - Additional query params
   * @returns {Promise} Filtered family members
   */
  getByBloodGroup: async (bloodGroup, params = {}) => {
    const { data } = await apiClient.get("/family-members", {
      params: { bloodGroup, ...params },
    });
    return data;
  },

  /**
   * Get default family member (usually 'Self')
   * @returns {Promise} Default family member or null
   */
  getDefault: async () => {
    try {
      const { data } = await apiClient.get("/family-members", {
        params: {
          relation: "Self",
          limit: 1,
        },
      });
      return data.data?.[0] || null;
    } catch (error) {
      console.error("Error fetching default family member:", error);
      return null;
    }
  },

  /**
   * Get paginated family members with sorting
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} sortBy - Sort field (name, age, relation, createdAt)
   * @param {string} sortBooking - Sort booking (asc, desc)
   * @returns {Promise} Paginated family members
   */
  getPaginated: async (
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc"
  ) => {
    const { data } = await apiClient.get("/family-members", {
      params: { page, limit, sortBy, sortOrder },
    });
    return data;
  },

  /**
   * Get family member statistics
   * Helper function to get count by relation
   * @returns {Promise} Statistics object
   */
  getStatistics: async () => {
    try {
      const { data } = await apiClient.get("/family-members", {
        params: { limit: 1000 }, // Get all members
      });

      const members = data.data || [];

      const stats = {
        total: members.length,
        byRelation: {},
        byGender: {},
        byBloodGroup: {},
        averageAge: 0,
      };

      members.forEach((member) => {
        // Count by relation
        stats.byRelation[member.relation] =
          (stats.byRelation[member.relation] || 0) + 1;

        // Count by gender
        stats.byGender[member.gender] =
          (stats.byGender[member.gender] || 0) + 1;

        // Count by blood group
        if (member.bloodGroup) {
          stats.byBloodGroup[member.bloodGroup] =
            (stats.byBloodGroup[member.bloodGroup] || 0) + 1;
        }
      });

      // Calculate average age
      if (members.length > 0) {
        const totalAge = members.reduce((sum, m) => sum + (m.age || 0), 0);
        stats.averageAge = Math.round(totalAge / members.length);
      }

      return stats;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return null;
    }
  },
};


// export const razorpayAPI = {
//   createOrder: async (bookingData) => {
//     const { data } = await apiClient.post("/razorpay/create-booking", bookingData);
//     return data;
//   },

//   verifyPayment: async (paymentData) => {
//     const { data } = await apiClient.post("/razorpay/verify-payment", paymentData);
//     return data;
//   },

//   getOrderDetails: async (bookingId) => {
//     const { data } = await apiClient.get(`/razorpay/bookings/${bookingId}`);
//     return data;
//   },

//   getUserOrders: async (params = {}) => {
//     const { data } = await apiClient.get("/razorpay/bookings", { params });
//     return data;
//   },

//   cancelOrder: async (bookingId) => {
//     const { data } = await apiClient.post(`/razorpay/bookings/${bookingId}/cancel`);
//     return data;
//   },

//   getPaymentStatus: async (paymentId) => {
//     const { data } = await apiClient.get(`/razorpay/payments/${paymentId}/status`);
//     return data;
//   },
// };

export const razorpayAPI = {
  // existing
  createBooking: async (bookingData) => {
    const { data } = await apiClient.post("/razorpay/create-booking", bookingData);
    return data;
  },

  verifyPayment: async (paymentData) => {
    const { data } = await apiClient.post("/razorpay/verify-payment", paymentData);
    return data;
  },

  getBookingDetails: async (bookingId) => {
    const { data } = await apiClient.get(`/razorpay/bookings/${bookingId}`);
    return data;
  },

  getUserBookings: async (params = {}) => {
    const { data } = await apiClient.get("/razorpay/bookings", { params });
    return data;
  },

  cancelBooking: async (bookingId, payload = {}) => {
    // optional payload: { reason?: string }
    const { data } = await apiClient.post(`/razorpay/bookings/${bookingId}/cancel`, payload);
    return data;
  },

  getPaymentStatus: async (paymentId) => {
    const { data } = await apiClient.get(`/razorpay/payments/${paymentId}/status`);
    return data;
  },

  updateAddressAndSlot: async (bookingId, payload) => {
    const { data } = await apiClient.patch(
      `/razorpay/bookings/${bookingId}/address-slot`,
      payload
    );
    return data;
  },

  updateItemsAndPricing: async (bookingId, payload) => {
    const { data } = await apiClient.patch(
      `/razorpay/bookings/${bookingId}/items-pricing`,
      payload
    );
    return data;
  },

  updatePatientInfo: async (bookingId, payload) => {
    const { data } = await apiClient.patch(
      `/razorpay/bookings/${bookingId}/patient`,
      payload
    );
    return data;
  },

  // NEW: admin operations
  updateBookingStatus: async (bookingId, payload) => {
    const { data } = await apiClient.patch(
      `/razorpay/admin/bookings/${bookingId}/status`,
      payload
    );
    return data;
  },
};

export const familyMemberService = familyMemberAPI;
export const razorpayService = razorpayAPI;

export default apiClient;
