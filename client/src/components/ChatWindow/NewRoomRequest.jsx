import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { LinearProgress, Box } from "@mui/material";

const DIFFICULTY_MIXES = [
  { label: "Balanced (E·M·M·H)", value: ["Easy","Medium","Medium","Hard"] },
  { label: "Easy focus (E·E·M·M)",  value: ["Easy","Easy","Medium","Medium"] },
  { label: "Hard focus (M·M·H·H)",  value: ["Medium","Medium","Hard","Hard"] },
  { label: "All Medium",            value: ["Medium","Medium","Medium","Medium"] },
];

const NewRoomRequest = ({ sendNewQuestionsResponse, maxResponseTime, username, requestorUsername, proposedMix }) => {
  const [disabled, setDisabled] = useState(username === requestorUsername);
  const [progress, setProgress] = useState(100);
  const mixLabel = DIFFICULTY_MIXES.find((m) => JSON.stringify(m.value) === JSON.stringify(proposedMix))?.label ?? "Balanced (E·M·M·H)";

  useEffect(() => {
    if (username === requestorUsername) setDisabled(true);
  }, [username, requestorUsername]);

  useEffect(() => {
=======
import ProgressBar from "../ProgressBar";
import { LinearProgress, Box } from "@mui/material";

const NewRoomRequest = ({
  sendNewQuestionsResponse,
  maxResponseTime,
  username,
  requestorUsername,
}) => {
  const [disabled, setDisabled] = useState(false);
  const [progress, setProgress] = useState(100);

  useState(() => {
    if (username === requestorUsername) setDisabled(true);
  });

  const handleResponse = (status) => {
    if (Date.now() <= maxResponseTime) {
      sendNewQuestionsResponse({ status });
    }
    setDisabled(true);
  };

  const handleTimer = async () => {
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
    const interval = setInterval(() => {
      if (Date.now() > maxResponseTime) {
        clearInterval(interval);
        setDisabled(true);
        setProgress(0);
      } else {
<<<<<<< HEAD
        setProgress(Math.max(0, Math.min(Math.round((maxResponseTime - Date.now()) / 100), 100)));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [maxResponseTime]);

  const handleResponse = (status) => {
    if (Date.now() <= maxResponseTime) sendNewQuestionsResponse({ status });
    setDisabled(true);
  };

  return (
    <div className="mx-auto w-[85%] max-w-xs bg-[#2a2a2a] border border-[#3a3a3a] my-1 rounded-xl overflow-hidden">
      <div className="flex flex-col p-3 gap-2 items-center">
        <p className="text-xs text-gray-300 text-center">
          <span className="text-white font-medium">{requestorUsername}</span> wants new questions
        </p>
        {proposedMix && (
          <div className="text-[10px] text-gray-400 bg-[#1a1a1a] px-2 py-1 rounded-lg w-full text-center">
            Mix: <span className="text-gray-200">{mixLabel}</span>
          </div>
        )}
        <div className="flex gap-2 w-full">
          <button
            disabled={disabled}
            onClick={() => handleResponse("accept")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              disabled ? "bg-[#1e4030] text-gray-500 cursor-not-allowed" : "bg-[#2CBB5D] hover:bg-[#4cc575] text-white"
            }`}
          >
            Accept
          </button>
          <button
            disabled={disabled}
            onClick={() => handleResponse("reject")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              disabled ? "bg-[#401e1e] text-gray-500 cursor-not-allowed" : "bg-[#ff2a2a] hover:bg-[#fc4848] text-white"
            }`}
          >
            Reject
          </button>
        </div>
      </div>
      <Box sx={{ width: "100%" }}>
        <LinearProgress color="inherit" variant="determinate" value={progress} sx={{ borderRadius: "0 0 12px 12px", height: 3 }} />
=======
        setProgress(
          Math.max(
            0,
            Math.min(Math.round((maxResponseTime - Date.now()) / 100), 100)
          )
        );
      }
    }, 100);
  };

  useEffect(() => {
    handleTimer();
  }, []);
  return (
    <div className="mx-auto w-[40%] min-w-fit min-h-fit bg-tertiary m-1 rounded-lg">
      <div className="flex flex-col p-4 gap-2 items-center min-h-fit">
        {username} requested new room
        <div className="flex gap-2 justify-around w-full">
          <button
            className={
              "bg-[#2CBB5D] hover:bg-[#4cc575] rounded-lg p-2 px-4 " +
              (disabled && "bg-[#69a37d] hover:bg-[#69a37d]")
            }
            disabled={disabled}
            onClick={() => handleResponse("accept")}
          >
            accept
          </button>
          <button
            className={
              " rounded-lg p-1 px-4 " +
              (disabled
                ? " bg-[#ff807f] hover:bg-[#ff807f]"
                : "bg-[#ff2a2a] hover:bg-[#fc4848]")
            }
            disabled={disabled}
            onClick={() => handleResponse("reject")}
          >
            reject
          </button>
        </div>
      </div>
      {/* <ProgressBar totalTime={maxResponseTime - Date.now()} /> */}
      <Box sx={{ width: "100%", borderRadius: "7px" }}>
        <LinearProgress
          color="inherit"
          variant="determinate"
          value={progress}
          sx={{borderRadius: "0 0 7px 7px" }}
        />
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
      </Box>
    </div>
  );
};

export default NewRoomRequest;
