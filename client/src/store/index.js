import { configureStore } from "@reduxjs/toolkit";
import roomReducer from "./slices/roomSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    room: roomReducer,
    user: userReducer,
  },
});
