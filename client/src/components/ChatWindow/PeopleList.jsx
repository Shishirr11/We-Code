import React from "react";
import { useSelector } from "react-redux";
import { Tooltip } from "@mui/material";

const AVATAR_PALETTE = [
  "#8bc2e8", "#ffafca", "#89c7f4", "#f97772",
  "#f2bf6d", "#8d79e0", "#f7bfa8", "#c9bafc",
  "#a085e5", "#a6a1ed",
];

const DIFF_COLOR = { Easy: "#00b8a3", Medium: "#ffc01e", Hard: "#ff375f" };

const getAvatarColor = (username) =>
  AVATAR_PALETTE[(username?.length ?? 0) % AVATAR_PALETTE.length];

const PeopleList = () => {
  const people   = useSelector((s) => s.room.people);
  const problems = useSelector((s) => s.room.allProblems);

  if (!people.length) {
    return <p className="text-[10px] text-gray-700 italic">No one here yet</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {people.map((person, i) => {
        const pidx    = person.currentProblem ?? 0;
        const problem = problems[pidx];
        const diff    = problem?.difficulty ?? "Easy";
        const label   = `${person.username} — Problem ${pidx + 1}${problem?.title ? `: ${problem.title}` : ""}`;

        return (
          <Tooltip key={i} title={label} arrow placement="bottom">
            <div className="relative flex-shrink-0 cursor-default">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center
                           text-xs font-bold text-gray-900 select-none"
                style={{ backgroundColor: getAvatarColor(person.username) }}
              >
                {(person.username?.[0] ?? "?").toUpperCase()}
              </div>

              <div
                className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-full
                           flex items-center justify-center text-[8px] font-bold
                           border border-[#1a1a1a] select-none"
                style={{ backgroundColor: DIFF_COLOR[diff] ?? DIFF_COLOR.Easy, color: "#000" }}
              >
                {pidx + 1}
              </div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default PeopleList;