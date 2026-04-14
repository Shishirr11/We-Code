<<<<<<< HEAD
import React, { useState } from "react";
import { useSelector } from "react-redux";

const statusConfig = {
  "Accepted":        { color: "text-green-400",  bg: "bg-green-400",  label: "Accepted" },
  "Testcases Passed":{ color: "text-green-400",  bg: "bg-green-400",  label: "Testcases Passed" },
  "Wrong Answer":    { color: "text-red-400",    bg: "bg-red-500",    label: "Wrong Answer" },
  "Testcases Failed":{ color: "text-red-400",    bg: "bg-red-500",    label: "Testcases Failed" },
  "Runtime Error":   { color: "text-orange-400", bg: "bg-orange-400", label: "Runtime Error" },
  "Compile Error":   { color: "text-orange-400", bg: "bg-orange-400", label: "Compile Error" },
  "Time Limit Exceeded": { color: "text-yellow-400", bg: "bg-yellow-400", label: "Time Limit Exceeded" },
};

const StatusBanner = ({ status, runtime, memory }) => {
  const cfg = statusConfig[status] ?? { color: "text-gray-400", bg: "bg-gray-400", label: status };
  return (
    <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-[#1e1e1e] border border-[#333]">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-6 rounded-full ${cfg.bg}`} />
        <span className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</span>
      </div>
      {(runtime || memory) && (
        <div className="flex gap-3 text-xs text-gray-400">
          {runtime && <span>Runtime: <span className="text-white">{runtime}</span></span>}
          {memory  && <span>Memory: <span className="text-white">{memory}</span></span>}
        </div>
      )}
    </div>
  );
};

const OutputBlock = ({ label, content, mono = true }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
    <pre className={`w-full bg-[#1a1a1a] border border-[#333] p-2.5 rounded-lg text-xs whitespace-pre-wrap break-words ${mono ? "font-mono" : ""}`}>
      {content}
    </pre>
  </div>
);

const Testcases = ({ testcaseData, setTestcaseData, status, userOutput, stdOutput, expectedOutput, runError, wrongTestCase, runtime, memory }) => {
  const exampleTestCases = useSelector((state) => state.room.exampleTestCases);
  const [activeTab, setActiveTab] = useState("input");

  const hasResults = status || userOutput || expectedOutput || stdOutput || runError || wrongTestCase;

  return (
    <div className="flex flex-col gap-3 p-3">
      {status && <StatusBanner status={status} runtime={runtime} memory={memory} />}

      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-[#333] pb-2">
        <button
          onClick={() => setActiveTab("input")}
          className={`text-xs px-3 py-1 rounded transition-colors ${activeTab === "input" ? "bg-[#3a3a3a] text-white" : "text-gray-400 hover:text-white"}`}
        >
          Test input
        </button>
        {hasResults && (
          <button
            onClick={() => setActiveTab("output")}
            className={`text-xs px-3 py-1 rounded transition-colors ${activeTab === "output" ? "bg-[#3a3a3a] text-white" : "text-gray-400 hover:text-white"}`}
          >
            Results
          </button>
        )}
        <button
          className="ml-auto text-xs text-blue-400 hover:text-blue-300 transition-colors"
          onClick={() => {
            const tc = exampleTestCases;
            setTestcaseData(Array.isArray(tc) ? tc.join("\n") : tc);
            setActiveTab("input");
          }}
        >
          Use examples
        </button>
      </div>

      {activeTab === "input" && (
        <textarea
          value={testcaseData}
          rows={4}
          onChange={(e) => setTestcaseData(e.target.value)}
          placeholder="Enter test cases here, one per line..."
          className="w-full bg-[#1a1a1a] border border-[#333] p-2.5 rounded-lg text-xs font-mono focus:outline-none focus:border-[#666] resize-none"
        />
      )}

      {activeTab === "output" && (
        <div className="flex flex-col gap-3">
          {wrongTestCase && <OutputBlock label="Failed on input" content={wrongTestCase} />}
          {expectedOutput && <OutputBlock label="Expected output" content={expectedOutput} />}
          {userOutput    && <OutputBlock label="Your output"     content={userOutput} />}
          {stdOutput     && <OutputBlock label="Stdout"          content={stdOutput} />}
          {runError      && <OutputBlock label="Error"           content={runError} />}
=======
import React from "react";
import { useSelector } from "react-redux";

const statusBanner = (status) => {
  switch (status) {
    case "Accepted":
      return (
        <div className="w-full h-10 flex gap-2 items-center rounded-[50px]">
          <div className="h-[100%] w-2 bg-green-400 rounded-l-lg"> </div>
          <p className="text-lg">Status: Accepted</p>
        </div>
      );
    case "Testcases Passed":
      return (
        <div className="w-full h-10 flex gap-2 items-center rounded-[50px]">
          <div className="h-[100%] w-2 bg-green-400 rounded-l-lg"> </div>
          <p className="text-lg">Status: Testcases Passed</p>
        </div>
      );
    case "Wrong Answer":
      return (
        <div className="w-full h-10 flex gap-2 items-center rounded-[50px]">
          <div className="h-[100%] w-2 bg-red-500 rounded-l-lg"> </div>
          <p className="text-lg">Status: Wrong Answer</p>
        </div>
      );
    case "Testcases failed":
      return (
        <div className="w-full h-10 flex gap-2 items-center rounded-[50px]">
          <div className="h-[100%] w-2 bg-red-500 rounded-l-lg"> </div>
          <p className="text-lg">Status: Testcases failed</p>
        </div>
      );
    default:
      return (
        <div className="w-full h-10 flex gap-2 items-center rounded-[50px]">
          <div className="h-[100%] w-2 bg-gray-400 rounded-l-lg"> </div>
          <p className="text-lg">Status: {status}</p>
        </div>
      );
  }
};

const Testcases = ({
  testcaseData = "test",
  setTestcaseData,
  status = "",
  setStatus,
  userOutput,
  stdOutput,
  expectedOutput,
  runError,
  wrongTestCase,
}) => {
  const exampleTestCases = useSelector((state) => state.room.exampleTestCases);
  return (
    <div className="p-2 flex flex-col gap-2 justify-between">
      {status !== "" && statusBanner(status)}
      <div className="test-cases-row flex justify-between">
        <p className="text-lg font-semibold ">Test Cases:</p>

        <span
          className="text-blue-500 underline cursor-pointer"
          onClick={() => {
            setTestcaseData(exampleTestCases?.join("\n"));
          }}
        >
          use example testcases
        </span>
      </div>
      <textarea
        value={testcaseData}
        rows={4}
        onChange={(e) => setTestcaseData(e.target.value)}
        className="test-cases w-full bg-primary p-2 border-[1px] border-[#525252] rounded-md focus:outline-none"
        style={{ resize: "none" }}
      />
      {stdOutput !== "" && (
        <div className="flex flex-col gap-2 py-1">
          <p className="text-lg font-medium">Stdout:</p>
          <pre className="w-full bg-primary p-2 border-[1px] border-[#525252] rounded-md whitespace-pre-wrap">
            {stdOutput}
          </pre>
        </div>
      )}
      {wrongTestCase !== "" && (
        <div className="flex flex-col gap-2 py-1">
          <p className="text-lg font-medium">Wrong Answer for:</p>
          <pre className="w-full bg-primary p-2 border-[1px] border-[#525252] rounded-md whitespace-pre-wrap">
            {wrongTestCase}
          </pre>
        </div>
      )}
      {expectedOutput !== "" && (
        <div className="flex flex-col gap-2 py-1">
          <p className="text-lg font-medium">Expected Output</p>
          <pre className="w-full bg-primary p-2 border-[1px] border-[#525252] rounded-md whitespace-pre-wrap">
            {expectedOutput}
          </pre>
        </div>
      )}
      {userOutput !== "" && (
        <div className="flex flex-col gap-2 py-1">
          <p className="text-lg font-medium">Your Output</p>
          <pre className="w-full bg-primary p-2 border-[1px] border-[#525252] rounded-md whitespace-pre-wrap">
            {userOutput}
          </pre>
        </div>
      )}
      {runError !== "" && (
        <div className="flex flex-col gap-2 py-1">
          <p className="text-lg font-medium">Error:</p>
          <pre className="w-full bg-primary p-2 border-[1px] border-[#525252] rounded-md whitespace-pre-wrap">
            {runError}
          </pre>
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
        </div>
      )}
    </div>
  );
};

export default Testcases;
