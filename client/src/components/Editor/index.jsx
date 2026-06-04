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

loader.init().then((monaco) =>
  monaco.editor.defineTheme("wecodes-dark", editorTheme)
);

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const SessionBanner = () => (
  <div className="flex items-center justify-between gap-3 px-4 py-2
                  bg-[#2e1a1a] border-b border-[#4a2020] flex-shrink-0">
    <p className="text-sm text-red-400/80">
      LeetCode session expired — run and submit are disabled.
    </p>
    <Link
      to="/connect"
      className="flex-shrink-0 px-3 py-1 bg-[#fa971f] text-black rounded-md
                 text-sm font-semibold hover:bg-[#e8870e] transition-colors"
    >
      Reconnect
    </Link>
  </div>
);

const CustEditor = ({
  problemSlug,
  language,
  setLanguage,
  questionLoading,
  problemIndex,
  totalProblems,
}) => {
  const username = useSelector((s) => s.user.username);

  const [code,           setCode]           = useState("");
  const [editorLoading,  setEditorLoading]  = useState(false);
  const [testcaseData,   setTestcaseData]   = useState("");
  const [status,         setStatus]         = useState("");
  const [userOutput,     setUserOutput]     = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [stdOutput,      setStdOutput]      = useState("");
  const [runError,       setRunError]       = useState("");
  const [wrongTestCase,  setWrongTestCase]  = useState("");
  const [running,        setRunning]        = useState(false);
  const [activeBtn,      setActiveBtn]      = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [runtime,        setRuntime]        = useState("");
  const [memory,         setMemory]         = useState("");
  const [elapsed,        setElapsed]        = useState(0);
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
    const map  = {};
    data.snippets?.forEach((s) => { map[s.lang] = s.code; });
    localStorage.setItem(`${problemSlug}_snippets`, JSON.stringify(map));
    setEditorLoading(false);
    return map;
  };

  const loadCode = async () => {
    let snippets = JSON.parse(localStorage.getItem(`${problemSlug}_snippets`));
    if (!snippets) snippets = await fetchSnippets();
    const saved = localStorage.getItem(`${problemSlug}_${language.name}`);
    if (saved && saved !== "undefined") {
      setCode(saved);
    } else {
      const defaultCode = snippets?.[language.name] ?? "";
      localStorage.setItem(`${problemSlug}_${language.name}`, defaultCode);
      setCode(defaultCode);
    }
  };

  const handleRun = async () => {
    setRunning(true); setActiveBtn("run"); resetOutputs();
    try {
      const res = await runCode({
        code, input: testcaseData,
        language: language.leetcode_value,
        slug: problemSlug, username,
      });
      if (res.sessionExpired) { setSessionExpired(true); setRunning(false); setActiveBtn(""); return; }
      if (res.status_msg === "Accepted")
        setStatus(res.correct_answer ? "Testcases Passed" : "Testcases Failed");
      else setStatus(res.status_msg ?? "");
      setUserOutput(res.code_answer?.join("\n") ?? "");
      setExpectedOutput(res.expected_code_answer?.join("\n") ?? "");
      setStdOutput(res.code_output?.join("\n") ?? "");
      if (res.status_msg === "Runtime Error") setRunError(res.runtime_error ?? "");
      if (res.status_msg === "Compile Error")  setRunError(res.compile_error ?? "");
    } catch (e) { console.error(e); }
    setRunning(false); setActiveBtn("");
  };

  const handleSubmit = async () => {
    setRunning(true); setActiveBtn("submit"); resetOutputs();
    try {
      const res = await submitCode({
        code, language: language.leetcode_value,
        slug: problemSlug, username,
      });
      if (res.sessionExpired) { setSessionExpired(true); setRunning(false); setActiveBtn(""); return; }
      setStatus(res.status_msg ?? "");
      setWrongTestCase(res.input_formatted ?? "");
      setUserOutput(res.code_output ?? "");
      setExpectedOutput(res.expected_output ?? "");
      if (res.status_msg === "Runtime Error") setRunError(res.runtime_error ?? "");
      if (res.status_msg === "Compile Error")  setRunError(res.compile_error ?? "");
      if (res.status_msg === "Accepted") {
        setRuntime(res.status_runtime ?? "");
        setMemory(res.status_memory ?? "");
      }
    } catch (e) { console.error(e); }
    setRunning(false); setActiveBtn("");
  };

  const isLoading = questionLoading || editorLoading;

  const timerColor =
    elapsed > 3600 ? "text-red-500" :
    elapsed > 1800 ? "text-amber-400" :
    "text-gray-600";

  return (
    <div className="flex flex-col h-full w-full min-w-[300px] overflow-hidden">

      {sessionExpired && <SessionBanner />}

      <div className="flex-shrink-0 h-[42px] flex items-center justify-between
                      px-3 border-b border-[#222] bg-secondary gap-2">
        <Dropdown
          options={LANGUAGES}
          placeholder={language}
          onChange={setLanguage}
          disabled={isLoading}
        />
        <div className="flex items-center gap-2">
          {totalProblems > 0 && (
            <span className="text-sm text-gray-700 tabular-nums select-none">
              {problemIndex + 1}/{totalProblems}
            </span>
          )}
          <button
            onClick={startTimer}
            title="Reset timer"
            className="text-gray-700 hover:text-gray-400 transition-colors text-sm leading-none"
          >
            ↺
          </button>
          <span className={`text-sm font-mono tabular-nums select-none ${timerColor}`}>
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-600">Loading…</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto
                          scrollbar-thin scrollbar-thumb-[#2a2a2a]
                          scrollbar-track-transparent scrollbar-thumb-rounded-full">
            <MonacoEditor
              width="100%"
              height="70%"
              language={language.value}
              theme="wecodes-dark"
              value={code}
              onChange={(val) => {
                const v = val ?? "";
                localStorage.setItem(`${problemSlug}_${language.name}`, v);
                setCode(v);
              }}
              options={{
                minimap: { enabled: false },
                scrollbar: { alwaysConsumeMouseWheel: false },
                fontSize: 13,
                lineHeight: 20,
                padding: { top: 8, bottom: 8 },
                renderLineHighlight: "none",
                overviewRulerLanes: 0,
              }}
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

          <div className="flex-shrink-0 h-[52px] flex items-center justify-end gap-2
                          px-4 bg-secondary border-t border-[#222]">
            {status === "Accepted" && <ConfettiExplosion />}
            <button
              disabled={isLoading || running}
              onClick={handleRun}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isLoading || running
                  ? "bg-[#2a2a2a] text-gray-600 cursor-not-allowed"
                  : "bg-[#2a2a2a] hover:bg-[#333] text-gray-300 hover:text-white"
              }`}
            >
              {activeBtn === "run" ? "Running…" : "Run"}
            </button>
            <button
              disabled={isLoading || running}
              onClick={handleSubmit}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isLoading || running
                  ? "bg-[#1e4030] text-[#2CBB5D]/50 cursor-not-allowed"
                  : "bg-[#1e4030] hover:bg-[#2CBB5D] text-[#2CBB5D] hover:text-white"
              }`}
            >
              {activeBtn === "submit" ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CustEditor);