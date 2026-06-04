import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ConnectLeetCode from "./pages/ConnectLeetCode";
import Lobby from "./pages/Lobby";
import Room from "./components/Room";
import UsernameValidationWrapper from "./components/UsernameValidationWrapper";
import "./App.css";

function App() {
  return (
    <div className="App flex flex-col w-full h-full bg-primary">
      <Routes>
        <Route path="/"        element={<LandingPage />} />

        <Route path="/connect" element={<ConnectLeetCode />} />

        <Route
          path="/:username"
          element={
            <UsernameValidationWrapper>
              <Lobby />
            </UsernameValidationWrapper>
          }
        />

        <Route
          path="/:username/room/:roomId"
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