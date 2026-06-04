import * as React from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

export default function ProgressBar({ totalTime = 10000 }) {
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    const steps = 100; // Number of steps
    const stepSize = 100 / steps;
    const intervalDuration = totalTime / steps;

    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress <= 0) {
          clearInterval(timer);
          return 0;
        }

        return Math.max(oldProgress - stepSize, 0);
      });
    }, intervalDuration);

    return () => clearInterval(timer);
  }, [totalTime]);

  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgress color="inherit" variant="determinate" value={progress} />
    </Box>
  );
}
