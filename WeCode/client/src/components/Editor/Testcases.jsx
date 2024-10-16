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
        </div>
      )}
    </div>
  );
};

export default Testcases;
