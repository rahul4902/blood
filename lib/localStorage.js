// ============================================
// LocalStorage Keys
// ============================================
export const STORAGE_KEYS = {
  SELECTED_SLOT: "selectedSlot",
  SELECTED_ADDRESS_ID: "selectedAddressId",
  SELECTED_PATIENT_ID: "selectedPatientId",
  BOOKING_DATA: "bookingData",
  USER_PREFERENCES: "userPreferences",
};

// ============================================
// Selected Slot Management
// ============================================
export const slotStorage = {
  setSelectedSlot: (slotData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_SLOT, JSON.stringify(slotData));
      console.log("✅ Slot saved to localStorage:", slotData);
      return true;
    } catch (error) {
      console.error("❌ Failed to save slot to localStorage:", error);
      return false;
    }
  },

  getSelectedSlot: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SELECTED_SLOT);
      if (data) {
        const slot = JSON.parse(data);
        console.log("✅ Slot retrieved from localStorage:", slot);
        return slot;
      }
      return null;
    } catch (error) {
      console.error("❌ Failed to retrieve slot from localStorage:", error);
      return null;
    }
  },

  clearSelectedSlot: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_SLOT);
      console.log("✅ Slot cleared from localStorage");
      return true;
    } catch (error) {
      console.error("❌ Failed to clear slot from localStorage:", error);
      return false;
    }
  },

  hasSelectedSlot: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_SLOT) !== null;
    } catch (error) {
      console.error("❌ Failed to check slot in localStorage:", error);
      return false;
    }
  },

  updateSelectedSlot: (updates) => {
    try {
      const existing = slotStorage.getSelectedSlot() || {};
      const merged = { ...existing, ...updates };
      slotStorage.setSelectedSlot(merged);
      return true;
    } catch (error) {
      console.error("❌ Failed to update slot:", error);
      return false;
    }
  },
};

// ============================================
// Address Management
// ============================================
export const addressStorage = {
  setSelectedAddressId: (addressId) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_ADDRESS_ID, addressId);
      console.log("✅ Address ID saved to localStorage:", addressId);
      return true;
    } catch (error) {
      console.error("❌ Failed to save address ID to localStorage:", error);
      return false;
    }
  },

  getSelectedAddressId: () => {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.SELECTED_ADDRESS_ID);
      if (id) {
        console.log("✅ Address ID retrieved from localStorage:", id);
        return id;
      }
      return null;
    } catch (error) {
      console.error("❌ Failed to retrieve address ID from localStorage:", error);
      return null;
    }
  },

  clearSelectedAddressId: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ADDRESS_ID);
      console.log("✅ Address ID cleared from localStorage");
      return true;
    } catch (error) {
      console.error("❌ Failed to clear address ID from localStorage:", error);
      return false;
    }
  },

  hasSelectedAddressId: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_ADDRESS_ID) !== null;
    } catch (error) {
      console.error("❌ Failed to check address ID in localStorage:", error);
      return false;
    }
  },
};

// ============================================
// Patient Management (NEW)
// ============================================
export const patientStorage = {
  // Save selected patient ID
  setSelectedPatientId: (patientId) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PATIENT_ID, patientId);
      console.log("✅ Patient ID saved to localStorage:", patientId);
      return true;
    } catch (error) {
      console.error("❌ Failed to save patient ID to localStorage:", error);
      return false;
    }
  },

  // Get selected patient ID
  getSelectedPatientId: () => {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.SELECTED_PATIENT_ID);
      if (id) {
        console.log("✅ Patient ID retrieved from localStorage:", id);
        return id;
      }
      return null;
    } catch (error) {
      console.error("❌ Failed to retrieve patient ID from localStorage:", error);
      return null;
    }
  },

  // Clear selected patient ID
  clearSelectedPatientId: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_PATIENT_ID);
      console.log("✅ Patient ID cleared from localStorage");
      return true;
    } catch (error) {
      console.error("❌ Failed to clear patient ID from localStorage:", error);
      return false;
    }
  },

  // Check if patient ID exists
  hasSelectedPatientId: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_PATIENT_ID) !== null;
    } catch (error) {
      console.error("❌ Failed to check patient ID in localStorage:", error);
      return false;
    }
  },
};

// ============================================
// Booking Data Management
// ============================================
export const bookingStorage = {
  setBookingData: (data) => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKING_DATA, JSON.stringify(data));
      console.log("✅ Booking data saved to localStorage");
      return true;
    } catch (error) {
      console.error("❌ Failed to save booking data to localStorage:", error);
      return false;
    }
  },

  getBookingData: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKING_DATA);
      if (data) {
        console.log("✅ Booking data retrieved from localStorage");
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error("❌ Failed to retrieve booking data from localStorage:", error);
      return null;
    }
  },

  updateBookingData: (updates) => {
    try {
      const existing = bookingStorage.getBookingData() || {};
      const merged = { ...existing, ...updates };
      bookingStorage.setBookingData(merged);
      console.log("✅ Booking data updated in localStorage");
      return true;
    } catch (error) {
      console.error("❌ Failed to update booking data:", error);
      return false;
    }
  },

  clearBookingData: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.BOOKING_DATA);
      console.log("✅ Booking data cleared from localStorage");
      return true;
    } catch (error) {
      console.error("❌ Failed to clear booking data:", error);
      return false;
    }
  },
};

// ============================================
// User Preferences Management
// ============================================
export const preferencesStorage = {
  setPreferences: (preferences) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      console.log("✅ Preferences saved to localStorage");
      return true;
    } catch (error) {
      console.error("❌ Failed to save preferences:", error);
      return false;
    }
  },

  getPreferences: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("❌ Failed to retrieve preferences:", error);
      return null;
    }
  },

  clearPreferences: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
      console.log("✅ Preferences cleared from localStorage");
      return true;
    } catch (error) {
      console.error("❌ Failed to clear preferences:", error);
      return false;
    }
  },
};

// ============================================
// Clear All Booking Data
// ============================================
export const clearAllBookingData = () => {
  try {
    slotStorage.clearSelectedSlot();
    addressStorage.clearSelectedAddressId();
    patientStorage.clearSelectedPatientId();
    bookingStorage.clearBookingData();
    console.log("✅ All booking data cleared from localStorage");
    return true;
  } catch (error) {
    console.error("❌ Failed to clear all booking data:", error);
    return false;
  }
};
