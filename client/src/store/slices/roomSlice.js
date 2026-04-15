import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRoomProblems } from "../../api/leetcode";

export const fetchProblems = createAsyncThunk(
  "room/fetchProblems",
  async (room = "room") => {
    return getRoomProblems(room);
  },
);

const roomSlice = createSlice({
  name: "room",
  initialState: {
    currentProblem: 0,
    allProblems: [],
    exampleTestCases: "",
    isLoading: false,
    people: [],
    roomName: "room",
  },
  reducers: {
    nextProblem: (state) => {
      if (state.currentProblem + 1 < state.allProblems.length)
        state.currentProblem += 1;
    },
    prevProblem: (state) => {
      if (state.currentProblem > 0) state.currentProblem -= 1;
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
  updateAllProblems,
  updateExampleTestcases,
  updatePeople,
} = roomSlice.actions;
export default roomSlice.reducer;
