import React, { useEffect, useState, memo } from "react";
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

export default QuestionDisplay;
