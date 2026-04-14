import React from "react";

<<<<<<< HEAD
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
=======
const DifficultyTag = ({ difficulty }) => {
  const styles = {
    borderRadius: "21px",
    padding: "4px 10px",
    fontWeight: "bold",
    height: "30px",
    margin: "auto",
    // margin: "5px"
  };
  if (difficulty === "Easy") {
    return (
      <p
        style={{
          ...styles,
          background: "#223d3a",
          color: "#00b8e3",
        }}
      >
        Easy
      </p>
    );
  } else if (difficulty === "Medium") {
    return (
      <p
        style={{
          ...styles,
          background: "#483f26",
          color: "ffc01e",
        }}
      >
        Medium
      </p>
    );
  } else {
    return (
      <p
        style={{
          ...styles,
          background: "#482a30",
          color: "#ff375f",
        }}
      >
        Hard
      </p>
    );
  }
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
};

export default DifficultyTag;
