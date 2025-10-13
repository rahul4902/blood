// context/CartContext.js
'use client';

import { createContext, useContext, useReducer, useEffect, useState } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingIndex = state.items.findIndex(
        item => item.id === action.payload.id && item.type === action.payload.type
      );

      if (existingIndex > -1) {
        return state;
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => !(item.id === action.payload.id && item.type === action.payload.type))
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id && item.type === action.payload.type
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'APPLY_COUPON':
      return {
        ...state,
        coupon: action.payload,
        couponError: null
      };

    case 'REMOVE_COUPON':
      return {
        ...state,
        coupon: null,
        couponError: null
      };

    case 'SET_COUPON_ERROR':
      return {
        ...state,
        couponError: action.payload
      };

    case 'SET_QUICK_CHECKOUT':
      return {
        ...state,
        isQuickCheckout: action.payload
      };

    // Checkout Flow Actions
    case 'SET_SELECTED_ADDRESS':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          selectedAddress: action.payload
        }
      };

    case 'CLEAR_SELECTED_ADDRESS':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          selectedAddress: null
        }
      };

    case 'SET_PATIENT_INFO':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          patientInfo: action.payload
        }
      };

    case 'CLEAR_PATIENT_INFO':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          patientInfo: null
        }
      };

    case 'SET_SELECTED_TIME_SLOT':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          selectedTimeSlot: action.payload
        }
      };

    case 'CLEAR_SELECTED_TIME_SLOT':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          selectedTimeSlot: null
        }
      };

    case 'SET_PAYMENT_MODE':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          paymentMode: action.payload
        }
      };

    case 'CLEAR_PAYMENT_MODE':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          paymentMode: null
        }
      };

    case 'SET_CHECKOUT_STEP':
      return {
        ...state,
        checkout: {
          ...state.checkout,
          currentStep: action.payload
        }
      };

    case 'CLEAR_CHECKOUT':
      return {
        ...state,
        checkout: {
          selectedAddress: null,
          patientInfo: null,
          selectedTimeSlot: null,
          paymentMode: null,
          currentStep: 1
        }
      };

    case 'CLEAR_CART':
      return {
        items: [],
        coupon: null,
        couponError: null,
        isQuickCheckout: false,
        checkout: {
          selectedAddress: null,
          patientInfo: null,
          selectedTimeSlot: null,
          paymentMode: null,
          currentStep: 1
        }
      };

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
};

const initialState = {
  items: [],
  coupon: null,
  couponError: null,
  isQuickCheckout: false,
  checkout: {
    selectedAddress: null,
    patientInfo: null, // { type: 'self' | 'family', name, age, gender, relation, phone, email }
    selectedTimeSlot: null, // { date, timeSlot: { id, startTime, endTime, label } }
    paymentMode: null, // 'online' | 'cod' | 'wallet'
    currentStep: 1 // 1: address, 2: patient, 3: time slot, 4: payment, 5: review
  }
};

export const CartProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('cart', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [state, isLoaded]);

  const addToCart = (item) => {
    return new Promise((resolve) => {
      dispatch({ type: 'ADD_ITEM', payload: item });
      resolve();
    });
  };

  const removeFromCart = (id, type) => {
    return new Promise((resolve) => {
      dispatch({ type: 'REMOVE_ITEM', payload: { id, type } });
      resolve();
    });
  };

  const updateQuantity = (id, type, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, type);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, type, quantity } });
  };

  const setQuickCheckout = (value) => {
    dispatch({ type: 'SET_QUICK_CHECKOUT', payload: value });
  };

  // Checkout Flow Functions
  const setSelectedAddress = (address) => {
    dispatch({ type: 'SET_SELECTED_ADDRESS', payload: address });
  };

  const clearSelectedAddress = () => {
    dispatch({ type: 'CLEAR_SELECTED_ADDRESS' });
  };

  const setPatientInfo = (patientInfo) => {
    dispatch({ type: 'SET_PATIENT_INFO', payload: patientInfo });
  };

  const clearPatientInfo = () => {
    dispatch({ type: 'CLEAR_PATIENT_INFO' });
  };

  const setSelectedTimeSlot = (timeSlot) => {
    dispatch({ type: 'SET_SELECTED_TIME_SLOT', payload: timeSlot });
  };

  const clearSelectedTimeSlot = () => {
    dispatch({ type: 'CLEAR_SELECTED_TIME_SLOT' });
  };

  const setPaymentMode = (mode) => {
    dispatch({ type: 'SET_PAYMENT_MODE', payload: mode });
  };

  const clearPaymentMode = () => {
    dispatch({ type: 'CLEAR_PAYMENT_MODE' });
  };

  const setCheckoutStep = (step) => {
    dispatch({ type: 'SET_CHECKOUT_STEP', payload: step });
  };

  const clearCheckout = () => {
    dispatch({ type: 'CLEAR_CHECKOUT' });
  };

  // Validation helpers
  const isCheckoutValid = () => {
    const { selectedAddress, patientInfo, selectedTimeSlot, paymentMode } = state.checkout;
    return !!(selectedAddress && patientInfo && selectedTimeSlot && paymentMode);
  };

  const getCheckoutProgress = () => {
    const { selectedAddress, patientInfo, selectedTimeSlot, paymentMode } = state.checkout;
    let completed = 0;
    if (selectedAddress) completed++;
    if (patientInfo) completed++;
    if (selectedTimeSlot) completed++;
    if (paymentMode) completed++;
    return (completed / 4) * 100;
  };

  const applyCoupon = async (code) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          cartTotal: getSubtotal(),
          items: state.items 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch({ type: 'SET_COUPON_ERROR', payload: data.message });
        return false;
      }

      dispatch({ type: 'APPLY_COUPON', payload: data.coupon });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_COUPON_ERROR', payload: 'Failed to apply coupon' });
      return false;
    }
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  const getSubtotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscount = () => {
    if (!state.coupon) return 0;

    const subtotal = getSubtotal();
    
    if (state.coupon.type === 'percentage') {
      return Math.min((subtotal * state.coupon.value) / 100, state.coupon.maxDiscount || Infinity);
    }
    
    if (state.coupon.type === 'fixed') {
      return Math.min(state.coupon.value, subtotal);
    }

    return 0;
  };

  const getTax = () => {
    const taxRate = 0.18;
    const taxableAmount = getSubtotal() - getDiscount();
    return taxableAmount * taxRate;
  };

  const getTotal = () => {
    return getSubtotal() - getDiscount() + getTax();
  };

  const isItemInCart = (id) => {
    return state.items.some(item => item.id === id);
  };

  const getItemQuantity = (id, type) => {
    const item = state.items.find(item => item.id === id && item.type === type);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value = {
    // Cart state
    items: state.items,
    coupon: state.coupon,
    couponError: state.couponError,
    isQuickCheckout: state.isQuickCheckout,
    itemCount: state.items.length,
    
    // Checkout state
    checkout: state.checkout,
    
    // Cart actions
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    setQuickCheckout,
    clearCart,
    
    // Checkout actions
    setSelectedAddress,
    clearSelectedAddress,
    setPatientInfo,
    clearPatientInfo,
    setSelectedTimeSlot,
    clearSelectedTimeSlot,
    setPaymentMode,
    clearPaymentMode,
    setCheckoutStep,
    clearCheckout,
    
    // Calculation methods
    getSubtotal,
    getDiscount,
    getTax,
    getTotal,
    isItemInCart,
    getItemQuantity,
    
    // Validation methods
    isCheckoutValid,
    getCheckoutProgress,
  };

  // Don't render children until cart is loaded
  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
