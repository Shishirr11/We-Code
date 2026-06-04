import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DIFF_COLOR = { Easy: "#00b8a3", Medium: "#ffc01e", Hard: "#ff375f" };

const PROBLEMS = [
  {
    id: "P1", num: 217, title: "Contains Duplicate", difficulty: "Easy",
    desc: "Given an integer array nums, return true if any value appears at least twice in the array, and false if every element is distinct.",
    example: "Input:  nums = [1, 2, 3, 1]\nOutput: true",
    code: `def containsDuplicate(self, nums: List[int]) -> bool:
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False`,
    tags: ["Array", "Hash Table"],
  },
  {
    id: "P2", num: 1, title: "Two Sum", difficulty: "Easy",
    desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    example: "Input:  nums = [2,7,11,15], target = 9\nOutput: [0, 1]",
    code: `def twoSum(self, nums: List[int], target: int) -> List[int]:
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i`,
    tags: ["Array", "Hash Table"],
  },
  {
    id: "P3", num: 3, title: "Longest Substring", difficulty: "Medium",
    desc: "Given a string s, find the length of the longest substring without repeating characters.",
    example: "Input:  s = \"abcabcbb\"\nOutput: 3",
    code: `def lengthOfLongestSubstring(self, s: str) -> int:
    seen, left, res = {}, 0, 0
    for right, c in enumerate(s):
        if c in seen and seen[c] >= left:
            left = seen[c] + 1
        seen[c] = right
        res = max(res, right - left + 1)
    return res`,
    tags: ["String", "Sliding Window"],
  },
  {
    id: "P4", num: 322, title: "Coin Change", difficulty: "Medium",
    desc: "Given coins of different denominations and an amount, return the fewest number of coins needed to make up that amount.",
    example: "Input:  coins = [1,5,10], amount = 11\nOutput: 2",
    code: `def coinChange(self, coins: List[int], amount: int) -> int:
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] = min(dp[i], dp[i - coin] + 1)
    return -1 if dp[amount] == float('inf') else dp[amount]`,
    tags: ["Dynamic Programming"],
  },
];

const CHAT = [
  { u: "alice",   msg: "got P1! used a hashset",            own: false, bot: false },
  { u: "chatBot", msg: "alice solved Contains Duplicate 🎉", own: false, bot: true  },
  { u: "bob",     msg: "nice! sliding window for P3?",       own: false, bot: false },
  { u: "you",     msg: "yeah that's what I'm trying",        own: true,  bot: false },
  { u: "alice",   msg: "two pointer works too btw",          own: false, bot: false },
  { u: "chatBot", msg: "bob solved Two Sum 🎉",              own: false, bot: true  },
];

const PEOPLE = [
  { u: "alice", color: "#8bc2e8", p: 1 },
  { u: "bob",   color: "#ffafca", p: 2 },
  { u: "you",   color: "#f2bf6d", p: 3 },
];

const FEATURES = [
  { icon: "🏚️", title: "Private rooms",     desc: "Create a room, share the code, control who joins. Up to 5 people." },
  { icon: "🗂️", title: "Topic filtering",   desc: "Pick Arrays, DP, Graphs - any problems are fetched live from your choices." },
  { icon: "💬", title: "Built-in chat",     desc: "Discuss without switching tabs. See which problem everyone is on." },
  { icon: "🧑🏻‍💻", title: "Real submissions",  desc: "Run and submit directly to LeetCode using your own account." },
];

const KW  = new Set(["def","for","if","else","in","return","True","False","not","self","while","and","or","class"]);
const STR = /^["']/;
const NUM = /^\d+$/;
const CMT = /^#/;

function tokenize(line) {
  const tokens = [];
  const re = /(\b(?:def|for|if|else|in|return|True|False|not|self|while|and|or|class)\b|"[^"]*"|'[^']*'|#.*$|\d+(?:\.\d+)?|[^\s\w"'#]+|\w+|\s+)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const tok = m[0];
    let color = "inherit";
    if (KW.has(tok))      color = "#c586c0";
    else if (STR.test(tok)) color = "#ce9178";
    else if (CMT.test(tok)) color = "#6a9955";
    else if (NUM.test(tok)) color = "#b5cea8";
    tokens.push({ tok, color });
  }
  return tokens;
}

function CodeView({ code }) {
  return (
    <pre className="text-xs font-mono leading-relaxed text-gray-300 whitespace-pre p-4 overflow-auto h-full">
      {code.split("\n").map((line, li) => (
        <div key={li}>
          {tokenize(line).map(({ tok, color }, ti) => (
            <span key={ti} style={{ color }}>{tok}</span>
          ))}
          {"\n"}
        </div>
      ))}
    </pre>
  );
}

function DemoMsg({ msg }) {
  if (msg.bot) return (
    <div className="flex justify-center my-0.5">
      <p className="text-[10px] text-gray-600 px-2 py-0.5 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] select-none">
        {msg.msg}
      </p>
    </div>
  );
  return (
    <div className={`flex flex-col my-0.5 ${msg.own ? "items-end" : "items-start"}`}>
      {!msg.own && <p className="text-[10px] text-gray-600 mb-0.5 ml-1">{msg.u}</p>}
      <p className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-xs leading-snug ${
        msg.own
          ? "bg-[#2d3561] text-gray-100 rounded-tr-sm"
          : "bg-[#222] text-gray-300 rounded-tl-sm border border-[#2a2a2a]"
      }`}>
        {msg.msg}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const navigate   = useNavigate();
  const [pi, setPi]     = useState(0);
  const [tab, setTab]   = useState("code");
  const problem         = PROBLEMS[pi];

  return (
    <div className="w-full min-h-screen bg-[#111] text-white overflow-x-hidden">

      <nav className="sticky top-0 z-20 h-14 flex items-center justify-between
                      px-6 bg-[#161616]/90 border-b border-[#222]"
           style={{ backdropFilter: "blur(8px)" }}>
        <div className="flex items-center gap-1.5 font-bold select-none">
          <span className="text-xl tracking-tight">WE</span>
          <span className="px-2 py-1 text-sm rounded-lg bg-[#fa971f] text-black font-bold">
            CODES
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/connect")}
            className="px-5 py-2 rounded-lg border border-[#333] text-sm text-gray-400
                       hover:text-white hover:border-[#555] transition-all"
          >
            Sign in
          </button>
        </div>
      </nav>

      <section className="flex flex-col items-center text-center pt-20 pb-12 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                        bg-[#fa971f]/10 border border-[#fa971f]/25
                        text-[#fa971f] text-xs font-medium mb-6">
          LeetCode together
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] mb-5 max-w-2xl">
          Practice LeetCode<br/>
          <span className="text-[#fa971f]">with your crew.</span>
        </h1>
        <p className="text-gray-500 text-lg mb-10 max-w-lg leading-relaxed">
          Create a private room, pick your topics, and learn together.
          Built-in chat, code editor, live problem tracking.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/connect")}
            className="px-6 py-3 rounded-xl bg-[#fa971f] text-black text-base font-bold
                       hover:bg-[#e8870e] transition-all shadow-xl shadow-[#fa971f]/25"
          >
            Start coding
          </button>
          <button
            onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
            className="px-6 py-3 rounded-xl border border-[#333] text-gray-400
                       hover:text-white hover:border-[#555] text-base transition-all"
          >
            See demo
          </button>
        </div>
      </section>

      <section id="demo" className="max-w-6xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden
                        shadow-[0_0_80px_rgba(250,151,31,0.08)] bg-[#1a1a1a]">

          <div className="h-11 bg-[#161616] border-b border-[#222] flex items-center px-4 gap-3">
            <div className="flex items-center gap-1 font-bold text-sm select-none flex-shrink-0">
              <span>WE</span>
              <span className="px-1.5 py-0.5 text-xs rounded-md bg-[#fa971f] text-black">CODES</span>
            </div>
            <div className="w-px h-4 bg-[#2a2a2a]" />
            <div className="flex gap-0.5 overflow-x-auto scrollbar-none flex-1">
              {PROBLEMS.map((p, i) => (
                <button key={i} onClick={() => { setPi(i); setTab("code"); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs
                              font-medium transition-all flex-shrink-0 ${
                    i === pi ? "bg-[#2a2a2a] text-white" : "text-gray-600 hover:text-gray-300"
                  }`}>
                  <span style={{ color: DIFF_COLOR[p.difficulty], fontSize: 6 }}>●</span>
                  P{i + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {PEOPLE.map((p, i) => (
                <div key={i} title={p.u}
                  className="relative w-7 h-7 rounded-full flex items-center justify-center
                             text-xs font-bold text-gray-900 cursor-default"
                  style={{ backgroundColor: p.color }}>
                  {p.u[0].toUpperCase()}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full
                                  flex items-center justify-center text-[8px] font-bold
                                  border border-[#161616]"
                    style={{ backgroundColor: DIFF_COLOR[PROBLEMS[p.p - 1]?.difficulty ?? "Easy"], color: "#000" }}>
                    {p.p}
                  </div>
                </div>
              ))}
              <span className="text-xs text-gray-600 ml-1">3 online</span>
            </div>
          </div>

          <div className="grid overflow-hidden" style={{ gridTemplateColumns: "1fr 5px 1fr", height: 480 }}>

            <div className="flex flex-col overflow-hidden">
              <div className="flex-shrink-0 h-[42px] flex items-center gap-0.5 px-2
                              border-b border-[#222] bg-[#1e1e1e]">
                {PROBLEMS.map((p, i) => (
                  <button key={i} onClick={() => setPi(i)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs
                                whitespace-nowrap transition-all flex-shrink-0 ${
                      i === pi ? "bg-[#2a2a2a] text-white font-medium" : "text-gray-600 hover:text-gray-300"
                    }`}>
                    <span style={{ color: DIFF_COLOR[p.difficulty], fontSize: 5 }}>●</span>
                    {i + 1}. {p.title}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-5 scrollbar-thin
                              scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <p className="font-semibold text-[15px]">
                    {problem.num}. {problem.title}
                  </p>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{
                      color: DIFF_COLOR[problem.difficulty],
                      backgroundColor: `${DIFF_COLOR[problem.difficulty]}18`,
                    }}>
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{problem.desc}</p>
                <pre className="bg-[#181818] border border-[#2a2a2a] p-3 rounded-lg
                               text-xs font-mono text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {problem.example}
                </pre>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {problem.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full
                                             bg-[#fa971f]/10 text-[#fa971f] border border-[#fa971f]/20">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#222]" />

            <div className="flex flex-col overflow-hidden">
              <div className="flex-shrink-0 h-[42px] flex items-center gap-0.5 px-2
                              border-b border-[#222] bg-[#1e1e1e]">
                {["code","chat"].map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs
                                font-medium transition-all capitalize ${
                      tab === t ? "bg-[#2a2a2a] text-white" : "text-gray-600 hover:text-gray-300"
                    }`}>
                    {t === "chat"
                      ? <>Chat <span className="px-1 py-0.5 rounded-full bg-[#fa971f] text-black text-[9px] font-bold ml-0.5">3</span></>
                      : "Code"
                    }
                  </button>
                ))}
                {tab === "code" && (
                  <div className="ml-auto pr-1">
                    <span className="text-[10px] text-gray-700 font-mono">Python 3</span>
                  </div>
                )}
              </div>

              {tab === "code" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-auto bg-[#1a1a1a] scrollbar-thin
                                  scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
                    <CodeView code={problem.code} />
                  </div>
                  <div className="flex-shrink-0 border-t border-[#222] bg-[#1e1e1e] p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                        Test input
                      </span>
                    </div>
                    <div className="font-mono text-xs text-gray-600 bg-[#181818] border border-[#2a2a2a]
                                    rounded-lg px-3 py-2 mb-2">
                      {problem.id === "P1" ? "[1,2,3,1]"
                        : problem.id === "P2" ? "[2,7,11,15]\n9"
                        : problem.id === "P3" ? '"abcabcbb"'
                        : "[1,5,10]\n11"}
                    </div>
                  </div>
                  <div className="flex-shrink-0 h-[50px] flex items-center justify-end gap-2
                                  px-4 border-t border-[#222] bg-[#1e1e1e]">
                    <button className="px-5 py-2 rounded-lg text-xs font-medium bg-[#2a2a2a]
                                       text-gray-300 hover:bg-[#333] hover:text-white transition-all">
                      Run
                    </button>
                    <button className="px-5 py-2 rounded-lg text-xs font-semibold
                                       bg-[#1e4030] text-[#2CBB5D] hover:bg-[#2CBB5D]
                                       hover:text-white transition-all">
                      Submit
                    </button>
                  </div>
                </div>
              )}

              {tab === "chat" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-shrink-0 px-3 pt-2.5 pb-2 border-b border-[#222]">
                    <p className="text-[10px] text-gray-700 mb-2">3 online</p>
                    <div className="flex gap-2">
                      {PEOPLE.map((p, i) => (
                        <div key={i} className="relative w-7 h-7 rounded-full flex items-center
                                                justify-center text-xs font-bold text-gray-900"
                          style={{ backgroundColor: p.color }}>
                          {p.u[0].toUpperCase()}
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full
                                          flex items-center justify-center text-[8px] font-bold
                                          border border-[#1a1a1a]"
                            style={{ backgroundColor: DIFF_COLOR[PROBLEMS[p.p-1]?.difficulty ?? "Easy"], color: "#000" }}>
                            {p.p}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 flex flex-col gap-0.5
                                  scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
                    {CHAT.map((msg, i) => <DemoMsg key={i} msg={msg} />)}
                  </div>
                  <div className="flex-shrink-0 flex gap-2 p-3 border-t border-[#222]">
                    <div className="flex-1 px-3 py-1.5 bg-[#1f1f1f] border border-[#2a2a2a]
                                    rounded-md text-xs text-gray-700 cursor-not-allowed select-none">
                      Sign in to chat…
                    </div>
                    <button disabled
                      className="px-3 py-1.5 bg-[#1f1f1f] border border-[#2a2a2a] rounded-md
                                 text-xs text-gray-700 cursor-not-allowed">
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-[#161616] border border-[#222] rounded-2xl p-5
                                     flex flex-col gap-3 hover:border-[#333] transition-all">
              <span className="text-3xl">{f.icon}</span>
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#222] py-20 flex flex-col items-center gap-5 px-4">
        <h2 className="text-3xl font-bold text-center">
          Ready to grind with your team?
        </h2>
        <p className="text-gray-500 text-sm text-center max-w-sm">
          Connect your LeetCode account.
        </p>
        <p className="text-xs text-gray-700">Free · No account needed beyond LeetCode</p>
      </section>
    </div>
  );
}