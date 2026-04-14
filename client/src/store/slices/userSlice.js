<<<<<<< HEAD
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: { username: "" },
  reducers: {
    setUsername: (state, action) => { state.username = action.payload; },
    clearUsername: (state) => { state.username = ""; },
  },
});

export const { setUsername, clearUsername } = userSlice.actions;
=======
import { createSlice, current } from "@reduxjs/toolkit";

const initialState = {
    username: "",
    csrfToken: "",
    sessionToken: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserName: (state, action) => {
        state.username = action.payload;
    }
  },
  extraReducers: {}
});

export const { setUserName } = userSlice.actions;

>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
export default userSlice.reducer;
