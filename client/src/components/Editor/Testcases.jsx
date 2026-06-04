import React, { useState } from "react";
import { useSelector } from "react-redux";

const STATUS_CONFIG = {
  "Accepted":             { color: "text-[#2CBB5D]",  dot: "bg-[#2CBB5D]",  label: "Accepted"              },
  "Testcases Passed":     { color: "text-[#2CBB5D]",  dot: "bg-[#2CBB5D]",  label: "Testcases Passed"      },
  "Wrong Answer":         { color: "text-[#ff375f]",  dot: "bg-[#ff375f]",  label: "Wrong Answer"          },
  "Testcases Failed":     { color: "text-[#ff375f]",  dot: "bg-[#ff375f]",  label: "Testcases Failed"      },
  "Runtime Error":        { color: "text-amber-400",  dot: "bg-amber-400",  label: "Runtime Error"         },
  "Compile Error":        { color: "text-amber-400",  dot: "bg-amber-400",  label: "Compile Error"         },
  "Time Limit Exceeded":  { color: "text-yellow-400", dot: "bg-yellow-400", label: "Time Limit Exceeded"   },
};

const StatusBanner = ({ status, runtime, memory }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    color: "text-gray-400",
    dot:   "bg-gray-400",
    label: status,
  };
  return (
    <div className="flex items-center justify-between gap-2 py-2 px-3
                    bg-[#181818] rounded-lg border border-[#2a2a2a]">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className={`font-semibold text-xs ${cfg.color}`}>{cfg.label}</span>
      </div>
      {(runtime || memory) && (
        <div className="flex gap-3 text-[10px] text-gray-600">
          {runtime && (
            <span>Runtime: <span className="text-gray-300">{runtime}</span></span>
          )}
          {memory  && (
            <span>Memory: <span className="text-gray-300">{memory}</span></span>
          )}
        </div>
      )}
    </div>
  );
};

const OutputBlock = ({ label, content }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wider select-none">
      {label}
    </p>
    <pre className="w-full bg-[#181818] border border-[#2a2a2a] p-2.5 rounded-lg
                    text-xs font-mono text-gray-300 whitespace-pre-wrap break-words
                    leading-relaxed">
      {content}
    </pre>
  </div>
);

const Testcases = ({
  testcaseData, setTestcaseData,
  status, userOutput, stdOutput, expectedOutput,
  runError, wrongTestCase, runtime, memory,
}) => {
  const exampleTestCases = useSelector((s) => s.room.exampleTestCases);
  const [activeTab, setActiveTab] = useState("input");

  const hasResults = status || userOutput || expectedOutput || stdOutput || runError || wrongTestCase;

  return (
    <div className="flex flex-col gap-2.5 p-3">
      {status && (
        <StatusBanner status={status} runtime={runtime} memory={memory} />
      )}

      <div className="flex items-center gap-1 border-b border-[#222] pb-2">
        <TabPill
          active={activeTab === "input"}
          onClick={() => setActiveTab("input")}
        >
          Test input
        </TabPill>
        {hasResults && (
          <TabPill
            active={activeTab === "output"}
            onClick={() => setActiveTab("output")}
          >
            Results
          </TabPill>
        )}
        <button
          className="ml-auto text-[11px] text-blue-500/70 hover:text-blue-400
                     transition-colors duration-100"
          onClick={() => {
            const tc = exampleTestCases;
            setTestcaseData(Array.isArray(tc) ? tc.join("\n") : (tc ?? ""));
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
          placeholder="Enter test cases here…"
          className="w-full bg-[#181818] border border-[#2a2a2a] p-2.5 rounded-lg
                     text-xs font-mono text-gray-300 focus:outline-none
                     focus:border-[#3a3a3a] resize-none leading-relaxed
                     placeholder-gray-700 transition-colors"
        />
      )}

      {activeTab === "output" && (
        <div className="flex flex-col gap-2.5">
          {wrongTestCase  && <OutputBlock label="Failed on input"  content={wrongTestCase}  />}
          {expectedOutput && <OutputBlock label="Expected output"  content={expectedOutput} />}
          {userOutput     && <OutputBlock label="Your output"      content={userOutput}     />}
          {stdOutput      && <OutputBlock label="Stdout"           content={stdOutput}      />}
          {runError       && <OutputBlock label="Error"            content={runError}       />}
        </div>
      )}
    </div>
  );
};

const TabPill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`text-xs px-3 py-1 rounded-md transition-all duration-100 ${
      active
        ? "bg-[#2a2a2a] text-gray-200"
        : "text-gray-600 hover:text-gray-300 hover:bg-[#1f1f1f]"
    }`}
  >
    {children}
  </button>
);

export default Testcases;