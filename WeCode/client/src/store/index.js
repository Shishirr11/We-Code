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