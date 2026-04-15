import React, { useEffect, useRef, useState, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ConfettiExplosion from "react-confetti-explosion";
import Dropdown from "../Dropdown";
import Testcases from "./Testcases";
import { getProblemDetails, runCode, submitCode } from "../../api/leetcode";
import { LANGUAGES } from "../../constants";
import editorTheme from "../../constants/editorTheme.json";
import "./styles.css";

loader.init().then((monaco) => monaco.editor.defineTheme("wecodes-dark", editorTheme));

const SessionExpiredBanner = () => (
  <div className="flex items-center justify-between gap-3 px-4 py-2 bg-[#3d1f1f] border-b border-[#6b2f2f] flex-shrink-0">
    <p className="text-red-300 text-xs">Your LeetCode session expired — run and submit won't work.</p>
    <Link to="/connect" className="flex-shrink-0 px-3 py-1 bg-[#fa971f] text-black rounded-lg text-xs font-medium hover:bg-[#e8870e]">
      Reconnect
    </Link>
  </div>
);

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const CustEditor = ({ problemSlug, language, setLanguage, questionLoading, problemIndex, totalProblems }) => {
  const username = useSelector((state) => state.user.username);

  const [code, setCode] = useState("");
  const [editorLoading, setEditorLoading] = useState(false);
  const [testcaseData, setTestcaseData] = useState("");
  const [status, setStatus] = useState("");
  const [userOutput, setUserOutput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [stdOutput, setStdOutput] = useState("");
  const [runError, setRunError] = useState("");
  const [wrongTestCase, setWrongTestCase] = useState("");
  const [running, setRunning] = useState(false);
  const [activeButton, setActiveButton] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [runtime, setRuntime] = useState("");
  const [memory, setMemory] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    setElapsed(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [problemSlug]);

  const resetOutputs = () => {
    setStatus(""); setUserOutput(""); setExpectedOutput("");
    setStdOutput(""); setRunError(""); setWrongTestCase("");
    setRuntime(""); setMemory("");
  };

  useEffect(() => { resetOutputs(); }, [problemSlug]);

  useEffect(() => {
    if (problemSlug) loadCode();
  }, [language, problemSlug]);

  const fetchSnippets = async () => {
    setEditorLoading(true);
    const data = await getProblemDetails(problemSlug);
    const snippetMap = {};
    data.snippets?.forEach((s) => { snippetMap[s.lang] = s.code; });
    localStorage.setItem(`${problemSlug}_snippets`, JSON.stringify(snippetMap));
    setEditorLoading(false);
    return snippetMap;
  };

  const loadCode = async () => {
    let snippets = JSON.parse(localStorage.getItem(`${problemSlug}_snippets`));
    if (!snippets) snippets = await fetchSnippets();
    const saved = localStorage.getItem(`${problemSlug}_${language.name}`);
    if (saved && saved !== "undefined") setCode(saved);
    else {
      const defaultCode = snippets?.[language.name] ?? "";
      localStorage.setItem(`${problemSlug}_${language.name}`, defaultCode);
      setCode(defaultCode);
    }
  };

  const handleRun = async () => {
    setRunning(true); setActiveButton("run"); resetOutputs();
    try {
      const res = await runCode({ code, input: testcaseData, language: language.leetcode_value, slug: problemSlug, username });
      if (res.sessionExpired) { setSessionExpired(true); setRunning(false); setActiveButton(""); return; }
      if (res.status_msg === "Accepted") setStatus(res.correct_answer ? "Testcases Passed" : "Testcases Failed");
      else setStatus(res.status_msg ?? "");
      setUserOutput(res.code_answer?.join("\n") ?? "");
      setExpectedOutput(res.expected_code_answer?.join("\n") ?? "");
      setStdOutput(res.code_output?.join("\n") ?? "");
      if (res.status_msg === "Runtime Error") setRunError(res.runtime_error ?? "");
      if (res.status_msg === "Compile Error") setRunError(res.compile_error ?? "");
    } catch (e) { console.error(e); }
    setRunning(false); setActiveButton("");
  };

  const handleSubmit = async () => {
    setRunning(true); setActiveButton("submit"); resetOutputs();
    try {
      const res = await submitCode({ code, language: language.leetcode_value, slug: problemSlug, username });
      if (res.sessionExpired) { setSessionExpired(true); setRunning(false); setActiveButton(""); return; }
      setStatus(res.status_msg ?? "");
      setWrongTestCase(res.input_formatted ?? "");
      setUserOutput(res.code_output ?? "");
      setExpectedOutput(res.expected_output ?? "");
      if (res.status_msg === "Runtime Error") setRunError(res.runtime_error ?? "");
      if (res.status_msg === "Compile Error") setRunError(res.compile_error ?? "");
      if (res.status_msg === "Accepted") {
        setRuntime(res.status_runtime ?? "");
        setMemory(res.status_memory ?? "");
      }
    } catch (e) { console.error(e); }
    setRunning(false); setActiveButton("");
  };

  const isLoading = questionLoading || editorLoading;
  const timerColor = elapsed > 3600 ? "text-red-400" : elapsed > 1800 ? "text-yellow-400" : "text-gray-400";

  return (
    <div className="flex flex-col h-full w-full min-w-[400px] overflow-hidden">
      {sessionExpired && <SessionExpiredBanner />}
      <div className="flex-shrink-0 h-[42px] flex items-center justify-between px-3 border-b border-[#333] bg-secondary">
        <Dropdown options={LANGUAGES} placeholder={language} onChange={setLanguage} disabled={isLoading} />
        <div className="flex items-center gap-2">
          {totalProblems > 0 && (
            <span className="text-xs text-gray-500 font-mono">{problemIndex + 1}/{totalProblems}</span>
          )}
          <button onClick={startTimer} title="Reset timer" className="text-gray-500 hover:text-gray-300 transition-colors text-xs px-1">↺</button>
          <span className={`text-xs font-mono tabular-nums ${timerColor}`}>{formatTime(elapsed)}</span>
        </div>
      </div>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#525252] scrollbar-track-[#262626] scrollbar-thumb-rounded-full">
            <MonacoEditor
              width="100%" height="70%"
              language={language.value}
              theme="wecodes-dark"
              value={code}
              onChange={(val) => {
                localStorage.setItem(`${problemSlug}_${language.name}`, val ?? "");
                setCode(val ?? "");
              }}
              options={{ minimap: { enabled: false }, scrollbar: { alwaysConsumeMouseWheel: false } }}
            />
            <div className="bg-secondary min-h-[30%]">
              <Testcases
                testcaseData={testcaseData}
                setTestcaseData={setTestcaseData}
                status={status}
                userOutput={userOutput}
                expectedOutput={expectedOutput}
                stdOutput={stdOutput}
                runError={runError}
                wrongTestCase={wrongTestCase}
                runtime={runtime}
                memory={memory}
              />
            </div>
          </div>
          <div className="flex-shrink-0 h-[52px] flex items-center justify-end gap-2 px-5 bg-secondary border-t border-[#333]">
            <button
              disabled={isLoading || running}
              onClick={handleRun}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${isLoading || running ? "bg-[#707070] cursor-not-allowed" : "bg-[#3d3d3d] hover:bg-[#505050]"}`}
            >
              {activeButton === "run" ? "Running..." : "Run"}
            </button>
            <button
              disabled={isLoading || running}
              onClick={handleSubmit}
              className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors relative ${isLoading || running ? "bg-[#69a37d] cursor-not-allowed" : "bg-[#2CBB5D] hover:bg-[#4cc575]"}`}
            >
              {activeButton === "submit" ? "Submitting..." : "Submit"}
              {status === "Accepted" && <ConfettiExplosion />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CustEditor);