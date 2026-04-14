<<<<<<< HEAD
import { configureStore } from "@reduxjs/toolkit";
import roomReducer from "./slices/roomSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    room: roomReducer,
    user: userReducer,
  },
});
=======
import {configureStore} from "@reduxjs/toolkit"
import roomReducer from "./slices/roomSlice"
import chatRoomSlice from "./slices/chatRoomSlice"
import userSlice from "./slices/userSlice"

export const store = configureStore({
    reducer: {
        room: roomReducer,
        chatRoom: chatRoomSlice,
        user: userSlice,
    }
})
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
