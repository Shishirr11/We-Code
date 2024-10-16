import React from "react";

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
};

export default DifficultyTag;
