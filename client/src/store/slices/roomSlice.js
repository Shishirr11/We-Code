import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRoomProblems } from "../../api/leetcode";

export const fetchProblems = createAsyncThunk(
  "room/fetchProblems",
  async (room) => getRoomProblems(room),
);

const roomSlice = createSlice({
  name: "room",
  initialState: {
    currentProblem: 0,
    allProblems: [],
    exampleTestCases: "",
    isLoading: false,
    roomId: null,
    roomName: null,
    roomMeta: null,
    isHost: false,
    joinRequests: [],
    people: [],
  },
  reducers: {
    nextProblem: (state) => {
      if (state.currentProblem + 1 < state.allProblems.length)
        state.currentProblem += 1;
    },
    prevProblem: (state) => {
      if (state.currentProblem > 0) state.currentProblem -= 1;
    },

    setCurrentProblem: (state, action) => {
      const idx = Number(action.payload);
      if (idx >= 0 && idx < state.allProblems.length)
        state.currentProblem = idx;
    },

    updateAllProblems: (state, action) => {
      state.allProblems = action.payload;
      state.currentProblem = 0;
    },
    updateExampleTestcases: (state, action) => {
      state.exampleTestCases = action.payload;
    },
    updatePeople: (state, action) => {
      state.people = action.payload;
    },
    setRoomData: (state, action) => {
      const { roomId, roomMeta, isHost } = action.payload;
      state.roomId = roomId;
      state.roomName = roomMeta?.name ?? roomId;
      state.roomMeta = roomMeta;
      state.isHost = isHost ?? false;
    },
    clearRoom: (state) => {
      state.roomId = null;
      state.roomName = null;
      state.roomMeta = null;
      state.isHost = false;
      state.joinRequests = [];
      state.allProblems = [];
      state.currentProblem = 0;
      state.people = [];
    },
    updateRoomMeta: (state, action) => {
      state.roomMeta = { ...state.roomMeta, ...action.payload };
    },
    addJoinRequest: (state, action) => {
      if (
        !state.joinRequests.find((r) => r.username === action.payload.username)
      )
        state.joinRequests.push(action.payload);
    },
    removeJoinRequest: (state, action) => {
      state.joinRequests = state.joinRequests.filter(
        (r) => r.username !== action.payload,
      );
    },
    clearJoinRequests: (state) => {
      state.joinRequests = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.allProblems = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchProblems.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  nextProblem,
  prevProblem,
  setCurrentProblem,
  updateAllProblems,
  updateExampleTestcases,
  updatePeople,
  setRoomData,
  clearRoom,
  updateRoomMeta,
  addJoinRequest,
  removeJoinRequest,
  clearJoinRequests,
} = roomSlice.actions;

export default roomSlice.reducer;
