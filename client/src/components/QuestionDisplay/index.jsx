import React, { useEffect, useState, memo } from "react";
import parse from "html-react-parser";
import { useDispatch } from "react-redux";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import {
  nextProblem,
  prevProblem,
  updateExampleTestcases,
} from "../../store/slices/roomSlice";
import { getProblemDetails } from "../../api/leetcode";
import DifficultyTag from "./DifficultyTag";
import DisplayTags from "./displayTags";
import "./styles.css";

const DIFF_COLOR = { Easy: "#00b8a3", Medium: "#ffc01e", Hard: "#ff375f" };

const getProblemSlug  = (p) => (typeof p === "string" ? p : p?.slug ?? "");
const getProblemDiff  = (p) => (typeof p === "string" ? null : p?.difficulty ?? null);
const getProblemTitle = (p, i) => {
  if (typeof p === "string") return `P${i + 1}`;
  return p?.title ? `${i + 1}. ${p.title}` : `P${i + 1}`;
};

const QuestionDisplay = memo(({
  problemSlug,
  problems,
  currentProblem,
  questionLoading,
  setQuestionLoading,
}) => {
  const dispatch = useDispatch();
  const [display,    setDisplay]    = useState("");
  const [tags,       setTags]       = useState([]);
  const [title,      setTitle]      = useState("");
  const [difficulty, setDifficulty] = useState("Easy");

  useEffect(() => {
    if (!problemSlug) return;
    const load = async () => {
      setQuestionLoading(true);
      const data = await getProblemDetails(problemSlug);
      setTags(data.tags ?? []);
      setDisplay(data.content ?? "");
      setTitle(`${data.id}. ${data.title}`);
      setDifficulty(data.difficulty ?? "Easy");
      dispatch(updateExampleTestcases(data.exampleTestcases ?? ""));
      setQuestionLoading(false);
    };
    load();
  }, [problemSlug]); 

  const goToProblem = (idx) => {
    const delta = idx - currentProblem;
    const action = delta > 0 ? nextProblem : prevProblem;
    for (let i = 0; i < Math.abs(delta); i++) dispatch(action());
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      <div className="flex-shrink-0 h-[42px] flex items-center justify-between
                      px-2 border-b border-[#222] bg-secondary gap-1">

        <div className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto scrollbar-none">
          {problems.map((p, i) => {
            const diff     = getProblemDiff(p) ?? difficulty;
            const isActive = i === currentProblem;
            return (
              <button
                key={i}
                onClick={() => goToProblem(i)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm
                            whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                  isActive
                    ? "bg-[#2a2a2a] text-white font-medium"
                    : "text-gray-600 hover:text-gray-300 hover:bg-[#1f1f1f]"
                }`}
              >
                <span
                  style={{ color: DIFF_COLOR[diff] ?? DIFF_COLOR.Easy, fontSize: 6 }}
                >
                  ●
                </span>
                {getProblemTitle(p, i)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <NavBtn
            disabled={currentProblem === 0}
            onClick={() => dispatch(prevProblem())}
            label="Previous problem"
          >
            <FaAngleLeft size={10} />
          </NavBtn>
          <NavBtn
            disabled={currentProblem === problems.length - 1}
            onClick={() => dispatch(nextProblem())}
            label="Next problem"
          >
            <FaAngleRight size={10} />
          </NavBtn>
        </div>
      </div>

      <div className="flex-1 relative bg-secondary">
        <div className="absolute inset-0 overflow-y-auto p-5
                        scrollbar-thin scrollbar-thumb-[#2a2a2a]
                        scrollbar-track-transparent scrollbar-thumb-rounded-full">
          {questionLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs text-gray-600">Loading…</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <p className="font-semibold text-[15px] text-white leading-snug">
                  {title}
                </p>
                <DifficultyTag difficulty={difficulty} />
              </div>
              <div className="problem text-sm leading-relaxed text-gray-300">
                {parse(display)}
              </div>
              <DisplayTags tags={tags} />
            </>
          )}
        </div>
      </div>
    </div>
  );
});

const NavBtn = ({ disabled, onClick, label, children }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    aria-label={label}
    className="w-7 h-7 flex items-center justify-center rounded-md
               text-gray-600 hover:text-gray-300 hover:bg-[#2a2a2a]
               disabled:opacity-20 disabled:cursor-default
               transition-all duration-150"
  >
    {children}
  </button>
);

export default QuestionDisplay;