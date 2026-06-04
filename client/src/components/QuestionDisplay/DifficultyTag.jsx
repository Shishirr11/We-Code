import React from "react";


const configs = {
  Easy:   { bg: "#223d3a", color: "#00b8a3" },
  Medium: { bg: "#483f26", color: "#ffc01e" },
  Hard:   { bg: "#482a30", color: "#ff375f" },
};

const DifficultyTag = ({ difficulty }) => {
  const { bg, color } = configs[difficulty] ?? configs.Easy;
  return (
    <span
      style={{ background: bg, color, borderRadius: 21, padding: "4px 10px", fontWeight: 600, fontSize: 13 }}
    >
      {difficulty}
    </span>
  );
};

export default DifficultyTag;
