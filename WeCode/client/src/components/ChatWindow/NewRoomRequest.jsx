import React, { useEffect, useState } from "react";
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
    const interval = setInterval(() => {
      if (Date.now() > maxResponseTime) {
        clearInterval(interval);
        setDisabled(true);
        setProgress(0);
      } else {
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
      </Box>
    </div>
  );
};

export default NewRoomRequest;
