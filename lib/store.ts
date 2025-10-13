import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import Cookies from "js-cookie";

import searchReducer from "./features/search/searchSlice";
import bookingReducer from "./features/booking/bookingSlice";
import userReducer from "./features/user/userSlice";
import uiReducer from "./features/ui/uiSlice";
import cartReducer from "./features/cart/cartSlice";
import authReducer from "./features/auth/authSlice";

// Custom cookie storage to remove 'persist:' prefix
const cookieStorage = {
  getItem: (key: string): Promise<string | null> => {
    // Map persist:auth to auth, persist:cart to cart
    const cookieName = key.replace("persist:", "");
    console.log(`[cookieStorage] Getting cookie: ${cookieName}`);
    return Promise.resolve(Cookies.get(cookieName) || null);
  },
  setItem: (key: string, value: string): Promise<string> => {
    // Map persist:auth to auth, persist:cart to cart
    const cookieName = key.replace("persist:", "");
    console.log(`[cookieStorage] Setting cookie: ${cookieName} = ${value}`);
    Cookies.set(cookieName, value, { expires: 7, sameSite: "strict" });
    return Promise.resolve(value);
  },
  removeItem: (key: string): Promise<void> => {
    // Map persist:auth to auth, persist:cart to cart
    const cookieName = key.replace("persist:", "");
    console.log(`[cookieStorage] Removing cookie: ${cookieName}`);
    Cookies.remove(cookieName);
    return Promise.resolve();
  },
};

// Persist config for auth slice (cookie named 'auth')
const authPersistConfig = {
  key: "auth",
  storage: cookieStorage,
};

// Persist config for cart slice (cookie named 'cart')
const cartPersistConfig = {
  key: "cart",
  storage: cookieStorage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
// const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

export const store = configureStore({
  reducer: {
    search: searchReducer,
    booking: bookingReducer,
    user: userReducer,
    ui: uiReducer,
    cart: cartReducer,
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;