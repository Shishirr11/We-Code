import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import Split from "react-split-grid";
import { socket } from "../../services/socket";
import { nextProblem, prevProblem } from "../../store/slices/roomSlice";
import QuestionDisplay from "../QuestionDisplay";
import CustEditor from "../Editor";
import ChatWindow from "../ChatWindow";
import "./styles.css";

const LANGUAGES = [
  { id: 71, name: "Python3",    label: "Python 3",   value: "python",     leetcode_value: "python3"    },
  { id: 54, name: "C++",        label: "C++",        value: "cpp",        leetcode_value: "cpp"        },
  { id: 62, name: "Java",       label: "Java",       value: "java",       leetcode_value: "java"       },
  { id: 63, name: "JavaScript", label: "JavaScript", value: "javascript", leetcode_value: "javascript" },
];

const DIFFICULTY_COLOR = { Easy: "#00b8a3", Medium: "#ffc01e", Hard: "#ff375f" };
const getProblemSlug = (p) => (typeof p === "string" ? p : p?.slug ?? "");
const getProblemDifficulty = (p) => (typeof p === "string" ? "Easy" : p?.difficulty ?? "Easy");

const Room = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const problems = useSelector((state) => state.room.allProblems);
  const isLoading = useSelector((state) => state.room.isLoading);
  const currentProblem = useSelector((state) => state.room.currentProblem);
  const people = useSelector((state) => state.room.people);
  const username = useSelector((state) => state.user.username);
  const room = useSelector((state) => state.room.roomName);

  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [questionLoading, setQuestionLoading] = useState(false);

  const currentProblemObj = problems[currentProblem];
  const problemSlug = getProblemSlug(currentProblemObj);

  useEffect(() => {
    if (username && room) {
      socket.emit("problem_changed", { room, username, problemIndex: currentProblem });
    }
  }, [currentProblem, username]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/connect");
  };

  const goToProblem = (targetIndex) => {
    const delta = targetIndex - currentProblem;
    if (delta > 0) for (let j = 0; j < delta; j++) dispatch(nextProblem());
    else if (delta < 0) for (let j = 0; j < -delta; j++) dispatch(prevProblem());
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CircularProgress color="inherit" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Navbar */}
      <div className="flex-shrink-0 h-12 bg-secondary border-b border-[#333] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-1.5 font-bold text-base">
            <span>WE</span>
            <span className="px-1.5 py-0.5 text-xs rounded bg-[#fa971f] text-black">CODES</span>
          </div>

          {/* Problem pills — colored dot + number of people currently on that problem */}
          {problems.length > 0 && (
            <div className="flex items-center gap-1">
              {problems.map((p, i) => {
                const diff = getProblemDifficulty(p);
                const isActive = i === currentProblem;
                const peopleHere = people.filter((u) => (u.currentProblem ?? 0) === i).length;
                return (
                  <button
                    key={i}
                    onClick={() => goToProblem(i)}
                    title={`${peopleHere} person${peopleHere !== 1 ? "s" : ""} on problem ${i + 1}`}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                      isActive
                        ? "bg-[#2a2a2a] border-[#555] text-white"
                        : "border-transparent text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                    }`}
                  >
                    <span style={{ color: DIFFICULTY_COLOR[diff], fontSize: 8 }}>●</span>
                    {peopleHere > 0
                      ? <span className={isActive ? "text-white" : "text-gray-300"}>{peopleHere}</span>
                      : <span className="text-gray-600">0</span>
                    }
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{username}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs rounded-lg border border-[#525252] text-gray-400 hover:border-red-700 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 min-h-0">
        <Split
          render={({ getGridProps, getGutterProps }) => (
            <div className="room-grid h-full" style={getGridProps().style}>
              <QuestionDisplay
                problemSlug={problemSlug}
                problems={problems}
                currentProblem={currentProblem}
                questionLoading={questionLoading}
                setQuestionLoading={setQuestionLoading}
              />
              <div className="gutter gutter-vertical" {...getGutterProps("column", 1)}>
                <img src="https://split.js.org/vertical.png" style={{ pointerEvents: "none" }} alt="" />
=======
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
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
              </div>
              <CustEditor
                problemSlug={problemSlug}
                language={language}
                setLanguage={setLanguage}
<<<<<<< HEAD
                questionLoading={questionLoading}
                problemIndex={currentProblem}
                totalProblems={problems.length}
              />
              <div className="gutter gutter-vertical" {...getGutterProps("column", 3)}>
                <img src="https://split.js.org/vertical.png" style={{ pointerEvents: "none" }} alt="" />
              </div>
              <ChatWindow />
            </div>
          )}
        />
      </div>
=======
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
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
    </div>
  );
};

export default Room;
