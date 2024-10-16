import { createAsyncThunk, createSlice, current } from "@reduxjs/toolkit";
import { BACKEND_URL } from "../../config";

const initialState = {
  currentProblem: 0,
  allProblems: [],
  exampleTestCases: "",
  isLoading: false, //whole problems and editor window loads
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const fetchProblems = createAsyncThunk(
  "content/fetchProblems",
  async (roomName = "room") => {
    const res = await fetch(
      `${BACKEND_URL}/leetcode/roomProblems/${roomName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "ngrok-skip-browser-warning": "69420",
        },
      }
    );
    const response = await res.json();
    return response;
  }
);

export const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    nextProblem: (state) => {
      if (state.currentProblem + 1 < state.allProblems.length) {
        return { ...state, currentProblem: state.currentProblem + 1 };
      }
      return state;
    },

    prevProblem: (state) => {
      if (state.currentProblem > 0) {
        return { ...state, currentProblem: state.currentProblem - 1 };
      }
    },

    changeProblem: (state, action) => {
      const index = action.payload;
      if (index < allProblems.length && index >= 0) {
        state.currentProblem = index;
      }
    },

    updateAllProblems: (state, action) => {
      state.allProblems = action.payload;
      state.currentProblem = 0;
    },

    updateExampleTestcases: (state, action) => {
      state.exampleTestCases = action.payload;
    },
  },
  extraReducers: {
    [fetchProblems.pending]: (state) => {
      state.isLoading = true;
    },
    [fetchProblems.fulfilled]: (state, action) => {
      state.allProblems = action.payload;
      state.isLoading = false;
    },
    [fetchProblems.rejected]: (state) => {
      state.isLoading = false;
    },
  },
});

export const {
  addPeople,
  nextProblem,
  prevProblem,
  updateAllProblems,
  updateExampleTestcases,
} = roomSlice.actions;

export default roomSlice.reducer;
