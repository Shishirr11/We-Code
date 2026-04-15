import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchProblems } from "./store/slices/roomSlice";
import ConnectLeetCode from "./pages/ConnectLeetCode";
import Room from "./components/Room";
import UsernameValidationWrapper from "./components/UsernameValidationWrapper";
import "./App.css";

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
        <Route
          path="/:username"
          element={
            <UsernameValidationWrapper>
              <Room />
            </UsernameValidationWrapper>
          }
        />
      </Routes>
    </div>
  );
}

export default App;