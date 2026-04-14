<<<<<<< HEAD
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRoomProblems } from "../../api/leetcode";

export const fetchProblems = createAsyncThunk("room/fetchProblems", async (room = "room") => {
  return getRoomProblems(room);
});

const roomSlice = createSlice({
  name: "room",
  initialState: {
    currentProblem: 0,
    allProblems: [],       // now [{ slug, title, difficulty }]
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
=======
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

>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
    updateAllProblems: (state, action) => {
      state.allProblems = action.payload;
      state.currentProblem = 0;
    },
<<<<<<< HEAD
    updateExampleTestcases: (state, action) => {
      state.exampleTestCases = action.payload;
    },
    updatePeople: (state, action) => {
      state.people = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProblems.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.allProblems = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchProblems.rejected, (state) => { state.isLoading = false; });
  },
});

export const { nextProblem, prevProblem, updateAllProblems, updateExampleTestcases, updatePeople } = roomSlice.actions;
=======

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

>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
export default roomSlice.reducer;
