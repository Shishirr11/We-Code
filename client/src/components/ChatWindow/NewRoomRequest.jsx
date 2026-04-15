import React, { useEffect, useState } from "react";
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
    const interval = setInterval(() => {
      if (Date.now() > maxResponseTime) {
        clearInterval(interval);
        setDisabled(true);
        setProgress(0);
      } else {
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
      </Box>
    </div>
  );
};

export default NewRoomRequest;