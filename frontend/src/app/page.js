"use client";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import CodeEditor, { SelectionText } from "@uiw/react-textarea-code-editor";
import Typewriter from "typewriter-effect";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
// import {loadJsonFile} from 'load-json-file';

export default function Home() {
  const [active, setActive] = useState("schema");
  const [prompts, setPrompts] = useState([]);
  const [prompt, setPrompt] = useState("");
  const textRef = useRef();
  const [code, setCode] = useState(``);
  const [generatedCode, setGeneratedCode] = useState([""]);
  const [schemaFile, setSchemaFile] = useState(null);
  const [schemaString, setSchemaString] = useState("");
  const [inputJSONFile, setInputJSONFile] = useState(null);
  const [inputJSONString, setInputJSONString] = useState("");
  const [outputJSONFile, setOutputJSONFile] = useState(null);
  const [outputJSONString, setOutputJSONString] = useState("");
  const [text, setText] = useState(["Hey! Welcome to Gemini."]);
  const [copied, setCopied] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [selectedDraft, setSelectedDraft] = useState(0);

  const handleStringChange = (file, type) => {
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          const formattedJsonString = JSON.stringify(jsonData, null, 2);
          console.log("formattedJsonString:", formattedJsonString);
          if (type === "schema") {
            setSchemaString(formattedJsonString);
          } else if (type === "input") {
            setInputJSONString(formattedJsonString);
          } else if (type === "output") {
            setOutputJSONString(formattedJsonString);
          }
          // setJsonString(formattedJsonString);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          // setJsonString('Error parsing JSON');
        }
      };

      reader.readAsText(file);
    }
  };

  function handleFile(files, type) {
    // alert("Number of files: " + files.length);
    if (type === "schema") {
      setSchemaFile(files[0]);
      alert("Number of files: " + files.length);
      handleStringChange(files[0], "schema");
    } else if (type === "input") {
      alert("Number of files: " + files.length);
      setInputJSONFile(files[0]);
      handleStringChange(files[0], "input");
    } else if (type === "output") {
      setOutputJSONFile(files[0]);
      handleStringChange(files[0], "output");
    }
  }

  const [dragActive, setDragActive] = React.useState(false);
  // ref
  const inputRef = React.useRef(null);
  const inputRef3 = React.useRef(null);
  const inputRef2 = React.useRef(null);

  // handle drag events
  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // triggers when file is dropped
  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files);
    }
  };

  // triggers when file is selected with click
  const handleChange = function (e, type) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files, type);
    }
  };

  // triggers the input when the button is clicked
  const onButtonClick = () => {
    inputRef.current.click();
  };

  const onButtonClick2 = () => {
    inputRef2.current.click();
  };

  const onButtonClick3 = () => {
    inputRef3.current.click();
  };

  const [model, setModel] = useState("Gemini");
  const [columns, setColumns] = useState(null);
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateCodeVanna = async (prompt) => {
    setLoading(true);
    try {
      setPrompts((item) => [...item, prompt]);
      setPrompt("");
      setText(["Generating code..."]);

      const formData = new FormData();
      formData.append("prompt", prompt);

      console.log("data:", formData);

      const res = await fetch("http://10.120.96.187:8000/vanna", {
        method: "POST",
        body: formData,
      });

      const generated = await res.json();
      console.log("generated:", generated);
      setGeneratedCode((item) => [...item, generated.code]);
      setColumns(Object.keys(generated.result));
      console.log("columns:", Object.keys(generated.result));
      let rows = [];
      const data = generated.result;

      if (columns?.length > 0 && data) {
        const columnKeys = Object.keys(data);
        const firstColumnValues = Object.values(data[columnKeys[0]]);

        firstColumnValues.forEach((_, index) => {
          const rowData = columnKeys.map((col) => data[col][index]);
          rows.push(rowData);
        });
      }

      setRows(rows);
      console.log("rows:", rows);
    } catch (error) {
      console.error("Error generating code:", error);
      setText(["Error generating code !!!"]);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async (prompt) => {
    setLoading(true);
    try {
      setPrompts((item) => [...item, prompt]);
      setPrompt("");
      setText(["Generating code..."]);
      const data = {
        prompt: prompt,
        schemas: code,
        inputJson: inputJSONString,
        outputJson: outputJSONString,
      };

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("schemas", code);
      formData.append("inputJson", inputJSONString);
      formData.append("outputJson", outputJSONString);

      console.log("data:", data);

      const res = await fetch("http://10.120.96.187:8000/plain_gemini", {
        method: "POST",
        body: formData,
      });
      const generated = await res.json();
      console.log("generated:", generated);
      //break text from \n
      const text = generated.code;

      setGeneratedCode((item) => [...item, text]);

      console.log("text:", text.split("\n"));

      setText(text.split("\n"));
    } catch (error) {
      console.error("Error generating code:", error);
      setText(["Error generating code !!!"]);
    } finally {
      setLoading(false);
    }
  };

  const [selectedCodeExplain, setSelectedCodeExplain] = useState(null);
  const getExplanation = async (idx) => {
    setSelectedCode(idx);
    setSelectedCodeExplain("Getting explanation...");
    const data = new FormData();
    console.log("generatedCode:", generatedCode[idx]);
    console.log("prompts:", prompts[idx - 1]);
    data.append("code", generatedCode[idx]);
    data.append("prompt", prompts[idx]);
    try {
      const res = await fetch("http://10.120.96.187:8000/explain", {
        method: "POST",
        body: data,
      });
      const explanation = await res.json();
      console.log("explanation:", explanation);
      setSelectedCodeExplain(explanation?.explanation);
    } catch (error) {
      console.error("Error getting explanation:", error);
      // selectedCodeExplain("Error getting explanation !!!");
    }
  };

  const [selectedCodeDraft, setSelectedCodeDraft] = useState(null);
  const [draftComments, setDraftComments] = useState(null);
  const [selectedDraftIdx, setSelectedDraftIdx] = useState(null);
  const [draftLoading, setDraftLoading] = useState(false);

  const getDrafts = async (idx) => {
    setDraftComments("Getting drafts...");
    setSelectedCodeDraft(null);
    setSelectedDraftIdx(idx);
    setDraftLoading(true);
    try {
      const data = new FormData();
      data.append("prompt", prompts[idx - 1]);
      data.append("schemas", code);
      data.append("code", generatedCode[idx]);
      data.append("inputJson", inputJSONString);
      data.append("outputJson", outputJSONString);
      const res = await fetch("http://10.120.96.187:8000/drafts", {
        method: "POST",
        body: data,
      });
      const drafts = await res.json();
      console.log("drafts:", drafts);
      setSelectedCodeDraft(drafts);
    } catch (error) {
      console.error("Error getting drafts:", error);
      setDraftComments("Error getting drafts !!!");
    } finally {
      setDraftLoading(false);
    }
  };

  useEffect(() => {
    if (textRef.current) {
      const obj = new SelectionText(textRef.current);
      console.log("obj:", obj);
    }
  }, []);
  return (
    <div className="flex flex-col items-center px-4">
      <div className="ml-2 w-full h-16 px-0 py-2.5 flex items-center">
        <div className="bg-[#333333] h-10 my-2 rounded-md flex justify-between min-w-[10rem]">
          {["Gemini", "Vanna"].map((item, idx) => {
            return (
              <button
                onClick={() => {
                  setPrompts([]);
                  setPrompt("");
                  setGeneratedCode([""]);
                  setModel(item);
                  setRows(null);
                  setColumns(null);
                }}
                className={`py-2 px-6 rounded-md ${
                  model === item ? "bg-[#434343]" : "opacity-35"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex  max-w-full px-0">
        <div className="w-[49.4vw] max-h-[88vh] bg-[#333333] rounded-md">
          <div className="h-12 px-[7px] flex justify-between items-center group transition-all duration-3 ease-in-out">
            {model === "Gemini" ? (
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setActive("schema");
                  }}
                  className={`py-[4px] px-5 rounded-md hover:bg-[#434343] flex justify-between items-center ${
                    active === "schema" ? "" : "opacity-35"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4 mr-2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m7.875 14.25 1.214 1.942a2.25 2.25 0 0 0 1.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 0 1 1.872 1.002l.164.246a2.25 2.25 0 0 0 1.872 1.002h2.092a2.25 2.25 0 0 0 1.872-1.002l.164-.246A2.25 2.25 0 0 1 16.954 9h4.636M2.41 9a2.25 2.25 0 0 0-.16.832V12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 12V9.832c0-.287-.055-.57-.16-.832M2.41 9a2.25 2.25 0 0 1 .382-.632l3.285-3.832a2.25 2.25 0 0 1 1.708-.786h8.43c.657 0 1.281.287 1.709.786l3.284 3.832c.163.19.291.404.382.632M4.5 20.25h15A2.25 2.25 0 0 0 21.75 18v-2.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125V18a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                  <div>Schema description</div>
                </button>
                <button
                  onClick={() => {
                    setActive("io");
                  }}
                  className={`py-[4px] rounded-md hover:bg-[#434343] flex justify-between items-center ${
                    active === "io" ? "" : "opacity-35"
                  }`}
                >
                  <div className="h-5 mr-5 border-[1.5px] border-[#434343] rounded-md group-hover:opacity-0"></div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5 mr-2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                    />
                  </svg>

                  <div>Input / Output</div>
                  <div className="h-5 ml-5 border-[1.5px] border-[#434343] rounded-md group-hover:opacity-0"></div>
                </button>
                <button
                  onClick={() => {
                    setActive("prompts");
                  }}
                  className={`py-[4px] px-5 rounded-md hover:bg-[#434343] flex justify-between items-center ${
                    active === "prompts" ? "" : "opacity-35"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4 mr-2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                    />
                  </svg>
                  <div>Prompt</div>
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setActive("schema");
                  }}
                  className={`py-[4px] px-5 rounded-md hover:bg-[#434343] flex justify-between items-center ${
                    active === "schema" ? "" : "opacity-35"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4 mr-2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m7.875 14.25 1.214 1.942a2.25 2.25 0 0 0 1.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 0 1 1.872 1.002l.164.246a2.25 2.25 0 0 0 1.872 1.002h2.092a2.25 2.25 0 0 0 1.872-1.002l.164-.246A2.25 2.25 0 0 1 16.954 9h4.636M2.41 9a2.25 2.25 0 0 0-.16.832V12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 12V9.832c0-.287-.055-.57-.16-.832M2.41 9a2.25 2.25 0 0 1 .382-.632l3.285-3.832a2.25 2.25 0 0 1 1.708-.786h8.43c.657 0 1.281.287 1.709.786l3.284 3.832c.163.19.291.404.382.632M4.5 20.25h15A2.25 2.25 0 0 0 21.75 18v-2.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125V18a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                  <div>Schema description</div>
                </button>
                <button
                  onClick={() => {
                    setActive("prompts");
                  }}
                  className={`py-[4px] px-5 rounded-md hover:bg-[#434343] flex justify-between items-center ${
                    active === "prompts" ? "" : "opacity-35"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4 mr-2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                    />
                  </svg>
                  <div>Prompt</div>
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setPrompts([]);
                setPrompt("");
                setGeneratedCode([""]);
                setRows(null);
                setColumns(null);
              }}
              className="py-1.5 px-4 rounded-md hover:bg-[#393939] opacity-75 hover:opacity-100 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              <h1 className="ml-2 text-sm">Restart</h1>
            </button>
          </div>
          <div
            className={`${
              active === "prompts" ? "h-[69%]" : "h-[92.9%] rounded-b-md"
            } w-full bg-[#1f1f1f] px-5 pt-2 overflow-y-scroll noScroll`}
          >
            <div className="w-full">
              {active === "prompts" ? (
                <>
                  {prompts.map((item, idx) => {
                    return (
                      <>
                        <div className="w-full py-2.5 px-4 my-5 rounded-t-lg rounded-r-lg bg-[#3C3C3C]">
                          {item}
                        </div>
                      </>
                    );
                  })}
                </>
              ) : active === "schema" ? (
                <>
                  {model === "Vanna" ? (
                    <div className="w-full p-2.5 my-5 rounded-lg bg-[#3C3C3C]">
                      <Image
                        src="/schema.jpeg"
                        width={500}
                        height={500}
                        className="h-full w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="w-full p-2.5 my-5 rounded-lg bg-[#3C3C3C]">
                        <CodeEditor
                          value={code}
                          ref={textRef}
                          language="js"
                          placeholder="Please enter JS code for Schema description..."
                          onChange={(evn) => setCode(evn.target.value)}
                          padding={15}
                          style={{
                            fontFamily:
                              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                            fontSize: 12,
                          }}
                        />
                      </div>
                      {schemaFile ? (
                        <div
                          className="w-full p-10 mt-10 rounded-lg bg-[#3C3C3C] flex justify-center items-center"
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="w-12 h-12 mr-4"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                            />
                          </svg>

                          <div className="flex">
                            <h1 className="text-xl font-[500]">
                              {schemaFile?.name}
                            </h1>
                            <button
                              onClick={() => {
                                setSchemaFile(null);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="2"
                                stroke="currentColor"
                                class="w-6 h-6 ml-4"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M6 18 18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="w-full p-10 mt-10 rounded-lg bg-[#3C3C3C] flex justify-center items-center"
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="w-12 h-12 mr-4"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                            />
                          </svg>
                          <div className="flex flex-col">
                            <h1 className="text-xl font-[500]">
                              Drop anywhere to import
                            </h1>
                            <button
                              onClick={onButtonClick}
                              className="text-sm text-white/75 mt-2 hover:underline"
                            >
                              Or select a Schema description JS file
                            </button>
                          </div>
                        </div>
                      )}
                      <input
                        ref={inputRef}
                        type="file"
                        id="input-file-upload"
                        multiple={false}
                        onChange={(e) => handleChange(e, "schema")}
                        className="hidden"
                      />
                    </>
                  )}
                </>
              ) : (
                <>
                  <h1 className="mt-10 text-lg">Input JSON:</h1>
                  {inputJSONFile ? (
                    <div
                      className="w-full p-10 rounded-lg bg-[#3C3C3C] flex justify-center items-center"
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-12 h-12 mr-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>

                      <div className="flex">
                        <h1 className="text-xl font-[500]">
                          {inputJSONFile?.name}
                        </h1>
                        <button
                          onClick={() => {
                            setInputJSONFile(null);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                            class="w-6 h-6 ml-4"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M6 18 18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-full p-10 mt-10 rounded-lg bg-[#3C3C3C] flex justify-center items-center"
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-12 h-12 mr-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                        />
                      </svg>
                      <div className="flex flex-col">
                        <h1 className="text-xl font-[500]">
                          Drop anywhere to import
                        </h1>
                        <button
                          onClick={onButtonClick3}
                          className="text-sm text-white/75 mt-2 hover:underline"
                        >
                          Or select a input JSON file
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={inputRef3}
                    type="file"
                    id="input-file-upload3"
                    multiple={false}
                    onChange={(e) => {
                      console.log("e:", e.target.files[0]);
                      handleChange(e, "input");
                    }}
                    className="hidden"
                  />
                  <h1 className="mt-10 text-lg">Output JSON:</h1>
                  {outputJSONFile ? (
                    <div
                      className="w-full p-10 mt-10 rounded-lg bg-[#3C3C3C] flex justify-center items-center"
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-12 h-12 mr-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>

                      <div className="flex">
                        <h1 className="text-xl font-[500]">
                          {outputJSONFile?.name}
                        </h1>
                        <button
                          onClick={() => {
                            setOutputJSONFile(null);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                            class="w-6 h-6 ml-4"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M6 18 18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-full p-10 mt-10 rounded-lg bg-[#3C3C3C] flex justify-center items-center"
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-12 h-12 mr-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                        />
                      </svg>
                      <div className="flex flex-col">
                        <h1 className="text-xl font-[500]">
                          Drop anywhere to import
                        </h1>
                        <button
                          onClick={onButtonClick2}
                          className="text-sm text-white/75 mt-2 hover:underline"
                        >
                          Or select a output JSON file
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={inputRef2}
                    type="file"
                    id="input-file-upload2"
                    multiple={false}
                    onChange={(e) => handleChange(e, "output")}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>
          {active === "prompts" && (
            <div className="h-[10rem] w-full rounded-b-md p-4 relative flex">
              <textarea
                className="h-full w-full bg-black/50 rounded-md focus:none outline-none py-3 px-4 mr-3 resize-none noScroll"
                placeholder="Enter prompt here..."
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                }}
              ></textarea>
              <button
                onClick={() => {
                  // generateCode(prompt);
                  if (model === "Vanna") {
                    generateCodeVanna(prompt);
                  } else {
                    generateCode(prompt);
                  }
                }}
                disabled={prompt.length === 0}
                className="h-full flex flex-col justify-end"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class={`w-10 h-10 ${
                    prompt.length > 0 ? "text-[#29C244]" : "text-white/25"
                  }`}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="h-[90vh] mx-2"></div>
        <div className="w-[49.4vw] h-[84.5vh] flex flex-col">
          <div
            className={`${
              model === "Vanna" ? "h-[50vh]" : "h-full"
            }  w-full bg-[#333333] rounded-md mb-4`}
          >
            <div className="flex items-center w-full px-4 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6 mr-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                />
              </svg>

              <h1 className="text-lg">Code Generations</h1>
            </div>
            <div className="h-full w-full bg-[#262626] overflow-y-scroll noScroll rounded-b-md relative">
              {/* <div className="bg-[#3C3C3C] p-4 mx-4 my-4 rounded-md relative">
                <Typewriter
                  options={{
                    // add <pre></pre> and replace &gt; with >
                    strings: text
                      .map((item) => {
                        if (item.includes("=>")) {
                          return `${item.replace("=>", "=&gt;")}`;
                        }
                        return `<pre>${item.replace("=>", "=&gt;")}</pre>`;
                      })
                      .join(""),
                    autoStart: true,
                    loop: true,
                    speed: Infinity,
                    delay: 1,
                    deleteSpeed: Infinity,
                  }}
                />
                {text[0] === "Hey! Welcome to Gemini." ? (
                  <></>
                ) : (
                  <div className="absolute top-2 right-2 flex items-center">
                    <button className="rounded-md bg-[#262626] mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-8 h-8 p-1.5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setText(["Hey! Welcome to Gemini."]);
                      }}
                      className="rounded-md bg-[#262626]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-8 h-8 p-1.5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div> */}
              {
                <div
                  className={`loader absolute top-[50%] translate-x-[-50%] max-lg:scale-[90%] max-sm:scale-[65%] max-sm:fixed max-sm:top-[45%] left-[52%] ${
                    loading ? "" : "hidden"
                  }`}
                >
                  <div className="square" id="sq1"></div>
                  <div className="square" id="sq2"></div>
                  <div className="square" id="sq3"></div>
                  <div className="square" id="sq4"></div>
                  <div className="square" id="sq5"></div>
                  <div className="square" id="sq6"></div>
                  <div className="square" id="sq7"></div>
                  <div className="square" id="sq8"></div>
                  <div className="square" id="sq9"></div>
                </div>
              }
              {generatedCode?.map((item, idx) => {
                return (
                  item && (
                    <div className="bg-[#3C3C3C] p-2 mx-4 my-4 rounded-md noScroll relative">
                      <CodeMirror
                        className="noScroll"
                        value={
                          selectedDraft === 0
                            ? item
                            : selectedDraftIdx === idx
                            ? selectedCodeDraft[selectedDraft - 1]
                            : item
                        }
                        theme={vscodeDark}
                      />
                      {/* <div className="absolute top-5 right-3 flex items-center">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item);
                            setCopied(item);
                          }}
                          className="rounded-md bg-[#262626] mr-2 border"
                        >
                          {copied === item ? (
                            <>
                             
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-8 h-8 p-1.5"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                                />
                              </svg>
                            </>
                          )}
                        </button>
                      </div> */}
                      {
                        <div className="h-12 pl-2 px-[0px] flex items-center group transition-all duration-3 ease-in-out bg-[#333333]">
                          <button
                            onClick={() => {
                              // setActive("schema");

                              if (selectedCodeExplain) {
                                setSelectedCodeExplain("");
                                setSelectedCode(null);
                              } else {
                                getExplanation(idx);
                              }
                              if (activeTool === "explain") {
                                setActiveTool("");
                              } else {
                                setActiveTool("explain");
                              }
                            }}
                            className={`py-[4px] px-2 rounded-md hover:bg-[#434343] flex justify-between items-center`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="1.5"
                              stroke="currentColor"
                              class="w-4 h-4 mr-2"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                              />
                            </svg>

                            <div>
                              {selectedCodeExplain && activeTool === "explain"
                                ? "Stop"
                                : "Explain Code"}
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              if (activeTool === "drafts") {
                                setActiveTool("");
                                setSelectedDraft(0);
                              } else {
                                setActiveTool("drafts");
                              }
                              getDrafts(idx);
                            }}
                            className={`py-[4px] rounded-md hover:bg-[#434343] flex justify-between items-center`}
                          >
                            <div className="h-5 mr-5 border-[1.5px] border-[#434343] rounded-md group-hover:opacity-0"></div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="1.5"
                              stroke="currentColor"
                              class="w-5 h-5 mr-2"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                              />
                            </svg>

                            <div>
                              {activeTool === "drafts" &&
                              selectedDraftIdx === idx
                                ? "Close"
                                : "Drafts"}
                            </div>
                            <div className="h-5 ml-5 border-[1.5px] border-[#434343] rounded-md group-hover:opacity-0"></div>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                selectedDraft === 0
                                  ? item
                                  : selectedCodeDraft[selectedDraft - 1]
                              );
                              setCopied(
                                selectedDraft === 0
                                  ? item
                                  : selectedCodeDraft[selectedDraft - 1]
                              );
                            }}
                            className={`py-[4px] px-5 rounded-md hover:bg-[#434343] flex justify-between items-center`}
                          >
                            {copied ===
                            (selectedDraft === 0
                              ? item
                              : selectedCodeDraft[selectedDraft - 1]) ? (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke-width="1.5"
                                  stroke="currentColor"
                                  class="w-5 h-5 mr-1"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="m4.5 12.75 6 6 9-13.5"
                                  />
                                </svg>
                              </>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-4 h-4 mr-2"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                                />
                              </svg>
                            )}

                            <div>{copied === item ? "Copied" : "Copy"}</div>
                          </button>
                        </div>
                      }
                      {activeTool === "explain" && (
                        <div
                          style={{ overflow: "auto" }}
                          className="w-full py-3 px-4 bg-[#1E1E1E] break-words"
                        >
                          <Typewriter
                            options={{
                              strings: [
                                selectedCodeExplain
                                  ? `${selectedCodeExplain
                                      ?.split("\n")
                                      ?.map((item) => {
                                        return `<div>${item}</div>`;
                                      })
                                      .join("")}`
                                  : "",
                              ],
                              autoStart: true,
                              loop: true,
                              speed: Infinity,
                              delay: 1,
                              deleteSpeed: Infinity,
                            }}
                          />
                        </div>
                      )}
                      {activeTool === "drafts" && selectedDraftIdx === idx && (
                        <div className="w-full py-3 px-4 bg-[#1E1E1E] flex items-center relative">
                          <button
                            onClick={() => {
                              setSelectedDraft(0);
                            }}
                            className={`py-2 px-6 my-5 rounded-md bg-[#3C3C3C] mr-3  ${
                              selectedDraft === 0 ? "" : "opacity-50"
                            }`}
                          >
                            Original
                          </button>
                          {(
                            <div
                              className={`loader absolute top-[50%] scale-50 translate-x-[-50%] max-lg:scale-[90%] max-sm:scale-[65%] max-sm:fixed max-sm:top-[45%] left-[52%] ${
                                draftLoading ? "" : "hidden"
                              }`}
                            >
                              <div className="square" id="sq1"></div>
                              <div className="square" id="sq2"></div>
                              <div className="square" id="sq3"></div>
                              <div className="square" id="sq4"></div>
                              <div className="square" id="sq5"></div>
                              <div className="square" id="sq6"></div>
                              <div className="square" id="sq7"></div>
                              <div className="square" id="sq8"></div>
                              <div className="square" id="sq9"></div>
                            </div>
                          )}
                          {selectedCodeDraft?.map((item, idx) => {
                            return (
                              <button
                                onClick={() => {
                                  setSelectedDraft(idx + 1);
                                }}
                                className={`py-2 px-6 my-5 rounded-md bg-[#3C3C3C] mr-3 ${
                                  selectedDraft === idx + 1 ? "" : "opacity-50"
                                }`}
                              >
                                {`Draft ${idx + 1}`}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )
                );
              })}
            </div>
          </div>
          {model === "Vanna" && (
            <div className="h-[55%] w-full bg-[#333333] rounded-md mt-10">
              <div className="flex items-center w-full px-4 py-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6 mr-2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
                  />
                </svg>

                <h1 className="text-lg">Visualization</h1>
              </div>
              <div className="h-full w-full bg-[#262626] overflow-y-scroll noScroll rounded-b-md">
                {model === "Vanna" && (
                  <>
                    <table className="min-w-full bg-white border border-gray-300">
                      <thead>
                        <tr>
                          {columns?.map((col, index) => (
                            <th
                              key={index}
                              className="border border-gray-300 p-2 font-bold text-gray-700"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows?.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className={
                              rowIndex % 2 === 0 ? "bg-gray-100" : "bg-white"
                            }
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="border border-gray-300 p-2 text-black"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
