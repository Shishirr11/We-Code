import React from "react";
import { useSelector } from "react-redux";
import { Tooltip } from "@mui/material";

const AVATAR_COLORS = [
  "#8bc2e8","#ffafca","#89c7f4","#f97772",
  "#f2bf6d","#8d79e0","#f7bfa8","#c9bafc","#a085e5","#a6a1ed",
];
const difficultyColor = { Easy: "#00b8a3", Medium: "#ffc01e", Hard: "#ff375f" };

const getColor = (username) => AVATAR_COLORS[(username?.length ?? 0) % AVATAR_COLORS.length];

const PeopleList = () => {
  const people = useSelector((state) => state.room.people);
  const problems = useSelector((state) => state.room.allProblems);

  return (
    <div className="flex ml-1 gap-3 flex-wrap">
      {people.map((person, i) => {
        const problemIndex = person.currentProblem ?? 0;
        const problem = problems[problemIndex];
        const diff = problem?.difficulty ?? "Easy";
        return (
          <Tooltip
            key={i}
            title={`${person.username} — Problem ${problemIndex + 1}${problem?.title ? `: ${problem.title}` : ""}`}
            arrow
            placement="bottom"
          >
            <div className="relative flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-gray-900"
                style={{ backgroundColor: getColor(person.username) }}
              >
                {person.username?.[0]?.toUpperCase() ?? "U"}
              </div>
              {/* Problem indicator badge */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border border-[#1a1a1a]"
                style={{ backgroundColor: difficultyColor[diff], color: "#000" }}
              >
                {problemIndex + 1}
              </div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default PeopleList;
