import React, { useEffect, useState } from "react";
import { LinearProgress, Box } from "@mui/material";

const DIFFICULTY_MIXES = [
  { label: "Balanced · E M M H",  value: ["Easy", "Medium", "Medium", "Hard"]   },
  { label: "Easy focus · E E M M", value: ["Easy", "Easy",   "Medium", "Medium"] },
  { label: "Hard focus · M M H H", value: ["Medium", "Medium", "Hard",  "Hard"]  },
  { label: "All Medium",           value: ["Medium", "Medium", "Medium", "Medium"] },
];

const NewRoomRequest = ({
  sendNewQuestionsResponse,
  maxResponseTime,
  username,
  requestorUsername,
  proposedMix,
}) => {
  const isInitiator = username === requestorUsername;
  const [disabled,  setDisabled]  = useState(isInitiator);
  const [responded, setResponded] = useState(false);
  const [progress,  setProgress]  = useState(100);

  const mixLabel =
    DIFFICULTY_MIXES.find(
      (m) => JSON.stringify(m.value) === JSON.stringify(proposedMix)
    )?.label ?? "Balanced · E M M H";

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = maxResponseTime - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setDisabled(true);
        setProgress(0);
      } else {
        setProgress(Math.max(0, Math.min(100, (remaining / 10000) * 100)));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [maxResponseTime]);

  const handleResponse = (status) => {
    if (Date.now() > maxResponseTime || disabled || responded) return;
    sendNewQuestionsResponse({ status });
    setDisabled(true);
    setResponded(true);
  };

  return (
    <div className="mx-auto w-[88%] my-1.5 bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl overflow-hidden">
      <div className="px-3 pt-3 pb-2 flex flex-col gap-2">

        <p className="text-sm text-gray-400 text-center leading-snug">
          <span className="text-white font-medium">{requestorUsername}</span>
          {" "}wants new questions
        </p>

        {proposedMix && (
          <div className="text-xs text-gray-500 bg-[#181818] border border-[#2a2a2a]
                          px-2 py-1 rounded-lg text-center">
            Mix: <span className="text-gray-300">{mixLabel}</span>
          </div>
        )}

        {isInitiator && (
          <p className="text-xs text-gray-600 text-center italic">
            Waiting for others to respond…
          </p>
        )}

        {responded && (
          <p className="text-xs text-gray-600 text-center italic">
            Response sent ✓
          </p>
        )}

        {!isInitiator && !responded && (
          <div className="flex gap-1.5">
            <button
              disabled={disabled}
              onClick={() => handleResponse("accept")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                disabled
                  ? "bg-[#1e3028] text-gray-600 cursor-not-allowed"
                  : "bg-[#1e4030] hover:bg-[#2CBB5D] text-[#2CBB5D] hover:text-white"
              }`}
            >
              Accept
            </button>
            <button
              disabled={disabled}
              onClick={() => handleResponse("reject")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                disabled
                  ? "bg-[#301e1e] text-gray-600 cursor-not-allowed"
                  : "bg-[#3d1e1e] hover:bg-[#ff375f] text-[#ff375f] hover:text-white"
              }`}
            >
              Reject
            </button>
          </div>
        )}
      </div>

      <Box sx={{ width: "100%" }}>
        <LinearProgress
          color="inherit"
          variant="determinate"
          value={progress}
          sx={{ height: 2, borderRadius: 0, color: "#3a3a3a" }}
        />
      </Box>
    </div>
  );
};

export default NewRoomRequest;