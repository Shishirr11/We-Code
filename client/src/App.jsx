<<<<<<< HEAD
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchProblems } from "./store/slices/roomSlice";
import ConnectLeetCode from "./pages/ConnectLeetCode";
import Room from "./components/Room";
import UsernameValidationWrapper from "./components/UsernameValidationWrapper";
import "./App.css";

console.log("My API URL:", import.meta.env.VITE_API_URL);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProblems("room"));
  }, []);

  return (
    <div className="App flex flex-col w-full h-full bg-primary">
      <Routes>
        <Route path="/" element={<ConnectLeetCode />} />
        <Route path="/connect" element={<ConnectLeetCode />} />
=======
import "./App.css";
import Room from "./components/Room";
import { useSelector, useDispatch } from "react-redux";
import { addPeople, fetchProblems } from "./store/slices/roomSlice";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage";
import UsernameValidationWrapper from "./components/UsernameValidationWrapper";
import RedirectFromExtension from "./components/RedirectFromExtension";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchProblems("room"));
  }, []);
  return (
    <div className="App flex flex-col justify-center items-center gap-0 w-[100%] bg-primary">
      <Routes>
        <Route path="/" element={<LandingPage />} />
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
        <Route
          path="/:username"
          element={
            <UsernameValidationWrapper>
              <Room />
            </UsernameValidationWrapper>
          }
        />
<<<<<<< HEAD
=======
        <Route path="/:username/:sessionToken" element={<RedirectFromExtension />} />
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
      </Routes>
    </div>
  );
}

export default App;
