import React, { useEffect, useState, memo } from "react";
<<<<<<< HEAD
import parse from "html-react-parser";
import { useDispatch } from "react-redux";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { nextProblem, prevProblem, updateExampleTestcases } from "../../store/slices/roomSlice";
import { getProblemDetails } from "../../api/leetcode";
import DifficultyTag from "./DifficultyTag";
import DisplayTags from "./DisplayTags";
import "./styles.css";

const DIFFICULTY_COLOR = { Easy: "#00b8a3", Medium: "#ffc01e", Hard: "#ff375f" };

const getProblemSlug = (p) => (typeof p === "string" ? p : p?.slug ?? "");
const getProblemDifficulty = (p) => (typeof p === "string" ? null : p?.difficulty ?? null);
const getProblemTitle = (p, i) => {
  if (typeof p === "string") return `Problem ${i + 1}`;
  return p?.title ? `${i + 1}. ${p.title}` : `Problem ${i + 1}`;
};

const QuestionDisplay = memo(({ problemSlug, problems, currentProblem, questionLoading, setQuestionLoading }) => {
  const dispatch = useDispatch();
  const [display, setDisplay] = useState("");
  const [tags, setTags] = useState([]);
  const [title, setTitle] = useState("");
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

  const goToProblem = (targetIndex) => {
    const delta = targetIndex - currentProblem;
    if (delta > 0) for (let j = 0; j < delta; j++) dispatch(nextProblem());
    else if (delta < 0) for (let j = 0; j < -delta; j++) dispatch(prevProblem());
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Problem tabs header */}
      <div className="flex-shrink-0 h-[42px] flex items-center justify-between px-2 border-b border-[#333] bg-secondary gap-1">
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none flex-1">
          {problems.map((p, i) => {
            const diff = getProblemDifficulty(p) ?? difficulty;
            const isActive = i === currentProblem;
            return (
              <button
                key={i}
                onClick={() => goToProblem(i)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors flex-shrink-0 ${
                  isActive ? "bg-[#3a3a3a] text-white font-medium" : "text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]"
                }`}
              >
                <span style={{ color: DIFFICULTY_COLOR[diff] ?? DIFFICULTY_COLOR.Easy, fontSize: 7 }}>●</span>
                {getProblemTitle(p, i)}
              </button>
            );
          })}
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          <button
            disabled={currentProblem === 0}
            onClick={() => dispatch(prevProblem())}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#3a3a3a] disabled:opacity-20 disabled:cursor-default transition-colors"
          >
            <FaAngleLeft size={11} />
          </button>
          <button
            disabled={currentProblem === problems.length - 1}
            onClick={() => dispatch(nextProblem())}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#3a3a3a] disabled:opacity-20 disabled:cursor-default transition-colors"
          >
            <FaAngleRight size={11} />
          </button>
        </div>
      </div>

      {/* Problem content */}
      <div className="flex-1 relative bg-secondary">
        <div className="absolute inset-0 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[#525252] scrollbar-track-secondary scrollbar-thumb-rounded-full">
          {questionLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <p className="font-semibold text-[16px]">{title}</p>
                <DifficultyTag difficulty={difficulty} />
              </div>
              <div className="problem">{parse(display)}</div>
              <DisplayTags tags={tags} />
            </>
          )}
        </div>
      </div>
    </div>
  );
});
=======
import "./styles.css";
import ReactHtmlParser from "react-html-parser";
import "./leetcode-display.css";
import DisplayTags from "./displayTags";
import Dropdown from "../Dropdown";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleLeft,
  faCircleRight,
} from "@fortawesome/free-regular-svg-icons";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import {
  nextProblem,
  prevProblem,
  updateExampleTestcases,
} from "../../store/slices/roomSlice";
import { BACKEND_URL } from "../../config";
import { getProblemDetails } from "../../functions/leetcodeFunctions";
import DifficultyTag from "./DifficultyTag";

const QuestionDisplay = memo(
  ({
    problemSlug,
    problems,
    setProblemSlug,
    questionLoading,
    setQuestionLoading,
  }) => {
    const [display, setDisplay] = useState("<strong>Loading...</strong>");
    // const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState([]);
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const dispatch = useDispatch();
    const currentProblem = useSelector((state) => state.room.currentProblem);
    // const [snippets, setSnippets] = useState({});
    useEffect(() => {
      const loadData = async () => {
        setQuestionLoading(true);
        const newDisplay = await getProblemDetails(problemSlug);
        setTags(newDisplay.tags);
        setDisplay(newDisplay.content);
        setTitle(newDisplay.id + ". " + newDisplay.title);
        setDifficulty(newDisplay.difficulty);
        dispatch(
          updateExampleTestcases(
            newDisplay.exampleTestcases ? newDisplay.exampleTestcases : ""
          )
        );
        setQuestionLoading(false);
      };
      loadData();
    }, [problemSlug]);

    return (
      <div className="flex flex-col gap-0">
        <div className="py-[4px] h-[42px]">
          <Dropdown
            options={problems}
            placeholder={problemSlug}
            onChange={(newProblem) => setProblemSlug(newProblem)}
            disabled={questionLoading}
          />
        </div>
        <div className="bg-secondary relative w-[100%] flex-1">
          <div
            className="absolute top-0 left-0 right-0 bottom-0 overflowy-scroll break-words p-4 scrollbar-thin scrollbar-thumb-[#525252] scrollbar-track-secondary scrollbar-track-rounded-full scrollbar-thumb-rounded-full"
            style={{ overflowY: "auto" }}
          >
            {questionLoading === false ? (
              <>
                <div className="flex w-full justify-between">
                  <div className="title-container pb-2 flex gap-3">
                    <p
                      style={{
                        fontWeight: "500",
                        fontSize: "17px",
                        lineHeight: "28px",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {title}
                    </p>
                    <DifficultyTag difficulty={difficulty} />
                  </div>
                  <div className="problems-navigate flex gap-2 pb-2 items-center ml-2">
                    <div
                      className={
                        "left-icon-container w-12 h-12 flex items-center justify-center rounded-[20px] cursor-pointer hover:bg-tertiary " +
                        (currentProblem === 0 &&
                          "opacity-20 hover:bg-inherit cursor-default")
                      }
                    >
                      <FaAngleLeft
                        className="h-[25px]"
                        onClick={() => {
                          dispatch(prevProblem());
                        }}
                      />
                    </div>
                    <div
                      className={
                        "right-icon-container w-12 h-12 flex items-center justify-center rounded-[20px] cursor-pointer hover:bg-tertiary " +
                        (currentProblem === 3 &&
                          "opacity-20 hover:bg-inherit cursor-default")
                      }
                    >
                      <FaAngleRight
                        className="h-[25px]"
                        onClick={() => {
                          dispatch(nextProblem());
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="problem">{ReactHtmlParser(display)}</div>
                <div>
                  <DisplayTags tags={tags} />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <strong className="">Loading...</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60

export default QuestionDisplay;
