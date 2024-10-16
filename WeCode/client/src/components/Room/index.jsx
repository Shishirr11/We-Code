import React, { useEffect, useState } from "react";
import { CustEditor } from "../Editor";
import QuestionDisplay from "../QuestionDisplay";
import Split from "react-split-grid";
import "./styles.css";
import { loader } from "@monaco-editor/react";
import ChatWindow from "../ChatWindow";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../services/socket";

const Room = () => {
  const problems = useSelector((state) => state.room.allProblems);
  const problemsLoading = useSelector((state) => state.room.isLoading);
  const currentProblem = useSelector((state) => state.room.currentProblem);
  const dispatch = useDispatch();

  const [problemSlug, setProblemSlug] = useState("");
  const [language, setLanguage] = useState({
    id: 71,
    name: "Python3",
    label: "Python 3",
    value: "python",
    leetcode_value: "python3",
  });
  const [theme, setTheme] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const username = useSelector((state) => state.user.username);

  useEffect(() => {
    if (problems.length !== 0) setProblemSlug(problems[currentProblem]);
  }, [currentProblem, problems]);

  const loadTheme = async () => {
    // loads custom-theme theme
    loader.init().then(async (monaco) => {
      const themeData = await import(`../../constants/customTheme.json`);
      monaco.editor.defineTheme("custom-theme", themeData);
      setTheme("custom-theme");
    });
  };
  loadTheme();

  if (problemsLoading)
    return (
      <CircularProgress color="inherit" />
    );

  return (
    <div className="w-full h-full">
      <Split
        render={({ getGridProps, getGutterProps }) => {
          return (
            <div
              className="room-grid h-[100%] pt-2"
              style={{ ...getGridProps().style, gridTemplateRows: "1fr 10px" }}
            >
              <QuestionDisplay
                problemSlug={problemSlug}
                problems={problems}
                setProblemSlug={setProblemSlug}
                questionLoading={questionLoading}
                setQuestionLoading={setQuestionLoading}
              />
              <div
                className="gutter flex justify-center items-center gutter-vertical"
                {...getGutterProps("column", 1)}
              >
                <img
                  src="https://split.js.org/vertical.png"
                  style={{ pointerEvents: "none" }}
                />
              </div>
              <CustEditor
                problemSlug={problemSlug}
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                questionLoading={questionLoading}
                setQuestionLoading={setQuestionLoading}
              />
              <div
                className="gutter flex justify-center items-center gutter-vertical"
                {...getGutterProps("column", 3)}
              >
                <img
                  src="https://split.js.org/vertical.png"
                  style={{ pointerEvents: "none" }}
                />
              </div>
              <ChatWindow username={username} socket={socket} />
              <div />
            </div>
          );
        }}
      />
    </div>
  );
};

export default Room;
