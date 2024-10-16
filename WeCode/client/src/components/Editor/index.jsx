import Editor from "@monaco-editor/react";
import React, { useEffect, useState } from "react";
import EditorNav from "./editorNav";
import { monacoThemes } from "../../constants";
// import { defineTheme } from "../../lib/defineThemes";
import { loader } from "@monaco-editor/react";
import Testcases from "./Testcases";
import "./styles.css";
import { useSelector } from "react-redux";
import { BACKEND_URL } from "../../config";
import Button from "@girishsawant999/react-loading-button";
import {
  getSnippets,
  runCode,
  submitCode,
} from "../../functions/leetcodeFunctions";
import ConfettiExplosion from "react-confetti-explosion";

// import data from "./customTheme.json";

const CustEditor = ({
  problemSlug,
  language,
  setLanguage,
  theme,
  questionLoading = false,
  setQuestionLoading,
}) => {
  const [code, setCode] = useState("");
  const [editorLoad, setEditorLoad] = useState(false);
  const [testcaseData, setTestcaseData] = useState("");
  const [status, setStatus] = useState("");
  const [userOutput, setUserOutput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [stdOutput, setStdOutput] = useState("");
  const [runError, setRunError] = useState("");
  const [codeRunning, setCodeRunning] = useState(false);
  const [wrongTestCase, setWrongTestCase] = useState("");
  const [loadButton, setLoadButton] = useState("");
  const username = useSelector((state) => state.user.username);

  useEffect(() => {
    setTestcaseData("");
    setStatus("");
    setUserOutput("");
    setExpectedOutput("");
    setStdOutput("");
    setRunError("");
    setCodeRunning("");
    setWrongTestCase("");
  }, [problemSlug]);

  useEffect(() => {
    if (problemSlug !== "") {
      // console.log("reload");
      const snippets = JSON.parse(
        localStorage.getItem(`${problemSlug}_snippets`)
      );
      // console.log("prev", snippets, snippets === null);
      if (snippets === null) {
        fetchAndSetSnippets();
      } else {
        setOldCode();
      }
    }
  }, []);

  useEffect(() => {
    if (problemSlug !== "") {
      try {
        setOldCode();
      } catch (err) {
        console.log(err);
      }
    }
  }, [language, problemSlug]);

  const fetchAndSetSnippets = async () => {
    setEditorLoad(true);
    const response = await getSnippets(problemSlug);
    const newSnippets = {};
    response.snippets.map(
      (snippet) => (newSnippets[snippet.lang] = snippet.code)
    );
    localStorage.setItem(
      `${problemSlug}_snippets`,
      JSON.stringify(newSnippets)
    );
    if (code === "") setCode(newSnippets[language.name]);
    setEditorLoad(false);
  };

  const setOldCode = async () => {
    let snippets = JSON.parse(localStorage.getItem(`${problemSlug}_snippets`));
    if (snippets === null) await fetchAndSetSnippets();
    snippets = JSON.parse(localStorage.getItem(`${problemSlug}_snippets`));
    const oldCode = localStorage.getItem(`${problemSlug}_${language.name}`);
    if (oldCode !== null && oldCode !== "undefined") {
      setCode(oldCode);
    } else {
      localStorage.setItem(
        `${problemSlug}_${language.name}`,
        snippets[language.name]
      );
      setCode(snippets[language.name]);
    }
  };

  const handleSubmit = async (curLanguage, curCode, curInput) => {
    setCodeRunning(true);
    setUserOutput("");
    setExpectedOutput("");
    setStdOutput("");
    setRunError("");
    setStatus("");
    setWrongTestCase("");
    setLoadButton("submit");
    const data = {
      code: curCode,
      input: curInput,
      language: curLanguage.leetcode_value,
      slug: problemSlug,
      username: username,
    };
    try {
      const response = await submitCode(data);
      if (response.status_msg) setStatus(response.status_msg);
      else if (response.error) {
        setStatus("User not authenticated, please login from extension");
      }
      setWrongTestCase(
        response.input_formatted ? response.input_formatted : ""
      );
      setUserOutput(response.code_output ? response.code_output : "");
      setExpectedOutput(
        response.expected_output ? response.expected_output : ""
      );
      if (response.status_msg === "Runtime Error")
        setRunError(
          response?.runtime_error !== "" ? response.runtime_error : ""
        );
      if (response.status_msg === "Compile Error")
        setRunError(
          response?.compile_error !== "" ? response.compile_error : ""
        );
    } catch (err) {
      console.log("run error", err);
    }
    setCodeRunning(false);
    setLoadButton("");
  };

  const handleRunCode = async (curLanguage, curCode, curInput) => {
    setCodeRunning(true);
    // curInput = "[2,7,11,15]\n9\n[3,2,4]\n6\n[3,3]\n6\n[2,7,11,15,16]\n9";
    const data = {
      code: curCode,
      input: curInput,
      language: curLanguage.leetcode_value,
      slug: problemSlug,
      username: username,
    };
    // console.log(data);
    setLoadButton("run");
    setUserOutput("");
    setExpectedOutput("");
    setStdOutput("");
    setRunError("");
    setStatus("");
    setWrongTestCase("");
    try {
      const response = await runCode(data);
      if (response.status_msg === "Accepted") {
        if (response.correct_answer) setStatus("Testcases Passed");
        else setStatus("Testcases failed");
      } else if (response.error) {
        setStatus("User not authenticated, please login from extension");
      } else setStatus(response.status_msg);
      let outputStr = "";
      response.code_answer?.map((ans) => (outputStr += ans + "\n"));
      setUserOutput(outputStr);
      outputStr = "";
      response.expected_code_answer?.map((ans) => (outputStr += ans + "\n"));
      setExpectedOutput(outputStr);
      outputStr = "";
      response.code_output?.map((ans) => (outputStr += ans + "\n"));
      setStdOutput(outputStr);
      if (response.status_msg === "Runtime Error")
        setRunError(
          response?.runtime_error !== "" ? response.runtime_error : ""
        );
      if (response.status_msg === "Compile Error")
        setRunError(
          response?.compile_error !== "" ? response.compile_error : ""
        );
    } catch (err) {
      console.log("run error", err);
    }
    setCodeRunning(false);
    setLoadButton("");
  };

  return (
    <>
      <div className="flex flex-col h-full w-[100%] min-w-[400px] overflow-hidden">
        <div className="py-[4px] h-[42px]">
          <EditorNav
            language={language}
            setLanguage={setLanguage}
            loading={questionLoading || editorLoad}
          />
        </div>
        {questionLoading || editorLoad ? (
          <div className="w-full h-full flex justify-center items-center font-semibold">
            Loading...
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col min-h-0 max-h-[100%] overflow-hidden">
            <div className="felx h-[92%] w-full overflow-y-auto scrollbar-thin pr-[1px] scrollbar-track-[#262626] scrollbar-thumb-[#525252] scrollbar-thumb-rounded-3xl scrollbar-track-rounded-3xl">
              <Editor
                width="100%"
                height="80%"
                className="relative overflow-hidden"
                language={language.value}
                theme={theme}
                value={code}
                onChange={(newCode) => {
                  localStorage.setItem(
                    `${problemSlug}_${language.name}`,
                    newCode
                  );
                  setCode(newCode);
                }}
                options={{
                  minimap: { enabled: false },
                  scrollbar: {
                    alwaysConsumeMouseWheel: false,
                    // verticalScrollbarSize: 0, // Set vertical scrollbar size to 0
                    // vertical: "hidden",
                    // horizontal: "hidden",
                    // handleMouseWheel: false,
                  },
                }}
              />
              <div className=" p-0 bg-secondary min-h-[21%]">
                <Testcases
                  testcaseData={testcaseData}
                  setTestcaseData={setTestcaseData}
                  status={status}
                  setStatus={setStatus}
                  expectedOutput={expectedOutput}
                  userOutput={userOutput}
                  stdOutput={stdOutput}
                  runError={runError}
                  wrongTestCase={wrongTestCase}
                />
              </div>
            </div>
            <div className="mt-[1px] h-[8%] flex-none py-[10px] px-[20px] flex w-[100%] gap-3 justify-end bg-secondary">
              <div className="flex gap-2 ">
                <Button
                  disabled={questionLoading || codeRunning}
                  className={`px-4 py-2 hover:bg-[#464646] rounded-[8px] 
                    ${
                      questionLoading || codeRunning
                        ? "bg-[#707070]"
                        : "bg-[#3d3d3d]"
                    }`}
                  onClick={() => handleRunCode(language, code, testcaseData)}
                  loading={loadButton === "run"}
                  buttonType="#3d3d3d"
                >
                  Run
                </Button>
                <Button
                  disabled={questionLoading || codeRunning}
                  className={`py-2 px-4 hover:bg-[#4cc575] text-white rounded-md 
                    ${
                      questionLoading || codeRunning
                        ? "bg-[#69a37d]"
                        : "bg-[#2CBB5D]"
                    }`}
                  onClick={() => handleSubmit(language, code, testcaseData)}
                  loading={loadButton === "submit"}
                  buttonType="#69a37d"
                >
                  Submit
                  {status === "Accepted" && <ConfettiExplosion />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const MemoizedCustEditor = React.memo(CustEditor);
export { MemoizedCustEditor as CustEditor };
