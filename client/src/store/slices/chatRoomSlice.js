import { createSlice, current } from "@reduxjs/toolkit";
import { addPeople } from "./roomSlice";

const initialState = {
  people: [],
  currentProblem: 0,
  roomName: "room",
  isLoading: false,
};

export const chatRoomSlice = createSlice({
  name: "chatRoom",
  initialState,
  reducers: {
    updatePeople: (state, action) => {
      state.people = action.payload;
    },
  },
  extraReducers: {},
});

export const {updatePeople} = chatRoomSlice.actions;

export default chatRoomSlice.reducer;
