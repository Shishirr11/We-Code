import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../../api/rooms";
import { setRoomData } from "../../store/slices/roomSlice";
import RoomBrowser from "../../components/RoomBrowser";

const TOPICS = [
  "Array", "String", "Hash Table", "Dynamic Programming",
  "Binary Search", "Two Pointers", "Sliding Window", "Greedy",
  "Tree", "Graph", "Backtracking", "Stack",
  "Linked List", "Math", "Bit Manipulation", "Heap",
];

const DIFFICULTY_MIXES = [
  { label: "Balanced  E·M·M·H",  value: ["Easy","Medium","Medium","Hard"]   },
  { label: "Easy focus  E·E·M·M", value: ["Easy","Easy","Medium","Medium"]   },
  { label: "Hard focus  M·M·H·H", value: ["Medium","Medium","Hard","Hard"]   },
  { label: "All Medium",          value: ["Medium","Medium","Medium","Medium"] },
];

export default function Lobby() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const username  = useSelector((s) => s.user.username);

  const [tab,          setTab]          = useState("create"); 
  const [roomName,     setRoomName]     = useState("");
  const [isPublic,     setIsPublic]     = useState(true);
  const [maxMembers,   setMaxMembers]   = useState(5);
  const [selectedMix,  setSelectedMix]  = useState(0);
  const [topics,       setTopics]       = useState([]);
  const [creating,     setCreating]     = useState(false);
  const [createError,  setCreateError]  = useState("");
  const [roomCode,     setRoomCode]     = useState("");
  const [joinError,    setJoinError]    = useState("");
  const [showBrowser,  setShowBrowser]  = useState(false);

  const toggleTopic = (t) =>
    setTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    try {
      const room = await createRoom({
        host:         username,
        name:         roomName.trim() || `${username}'s Room`,
        isPublic,
        topics,
        difficultyMix: DIFFICULTY_MIXES[selectedMix].value,
        maxMembers,
      });
      if (room.error) { setCreateError(room.error); setCreating(false); return; }

      dispatch(setRoomData({
        roomId:   room.id,
        roomMeta: room,
        isHost:   true,
      }));
      navigate(`/${username}/room/${room.id}`);
    } catch {
      setCreateError("Could not reach the server.");
      setCreating(false);
    }
  };

  const handleJoinByCode = () => {
    const code = roomCode.trim();
    if (!code) return;
    navigate(`/${username}/room/${code}`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-primary overflow-auto">

      <header className="flex-shrink-0 h-11 bg-secondary border-b border-[#222]
                         flex items-center justify-between px-5">
        <div className="flex items-center gap-1 font-bold text-sm select-none">
          <span>WE</span>
          <span className="px-1.5 py-0.5 text-sm rounded-md bg-[#fa971f] text-black">
            CODES
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{username}</span>
          <button
            onClick={() => setShowBrowser(true)}
            className="px-3 py-1 text-sm rounded-md bg-[#222] border border-[#2a2a2a]
                       text-gray-400 hover:text-white hover:border-[#3a3a3a]
                       transition-all duration-150"
          >
            Browse rooms
          </button>
          <button
            onClick={() => { localStorage.clear(); navigate("/connect"); }}
            className="px-3 py-1 text-sm rounded-md border border-[#2a2a2a]
                       text-gray-600 hover:border-red-900 hover:text-red-500
                       transition-all duration-150"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg flex flex-col gap-6">

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, {username}
            </h1>
            <p className="text-sm text-gray-600">
              Create a room or find one to join
            </p>
          </div>

          <div className="flex bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-1">
            <TabButton active={tab === "create"} onClick={() => setTab("create")}>
              Create a room
            </TabButton>
            <TabButton active={tab === "join"} onClick={() => setTab("join")}>
              Join by code
            </TabButton>
          </div>

          {tab === "create" && (
            <div className="flex flex-col gap-4 bg-secondary border border-[#2a2a2a]
                            rounded-2xl p-6">
              <Field label="Room name">
                <input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder={`${username}'s Room`}
                  className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg
                             text-sm focus:outline-none focus:border-[#3a3a3a] transition-colors"
                />
              </Field>

              <div className="flex gap-3">
                <Field label="Visibility" className="flex-1">
                  <div className="flex gap-1 p-1 bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg">
                    {["Public","Private"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setIsPublic(v === "Public")}
                        className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                          isPublic === (v === "Public")
                            ? "bg-[#2a2a2a] text-white"
                            : "text-gray-600 hover:text-gray-300"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label={`Max members (${maxMembers})`} className="flex-1">
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="range" min={2} max={5} value={maxMembers}
                      onChange={(e) => setMaxMembers(Number(e.target.value))}
                      className="flex-1 accent-[#fa971f]"
                    />
                    <span className="text-sm text-gray-400 w-4">{maxMembers}</span>
                  </div>
                </Field>
              </div>

              <Field label="Difficulty mix">
                <div className="grid grid-cols-2 gap-1">
                  {DIFFICULTY_MIXES.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedMix(i)}
                      className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${
                        selectedMix === i
                          ? "bg-[#2a2a2a] text-white border border-[#3a3a3a]"
                          : "text-gray-600 border border-[#222] hover:text-gray-300 hover:bg-[#222]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={`Topics ${topics.length > 0 ? `(${topics.length} selected)` : "— optional, filters problems"}`}>
                <div className="flex flex-wrap gap-1.5">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTopic(t)}
                      className={`px-2.5 py-1 rounded-full text-sm transition-all ${
                        topics.includes(t)
                          ? "bg-[#fa971f]/20 text-[#fa971f] border border-[#fa971f]/40"
                          : "bg-[#1f1f1f] text-gray-600 border border-[#2a2a2a] hover:text-gray-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              {createError && (
                <p className="text-sm text-red-500">{createError}</p>
              )}

              <button
                disabled={creating}
                onClick={handleCreate}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  creating
                    ? "bg-[#2a2a2a] text-gray-600 cursor-not-allowed"
                    : "bg-[#fa971f] text-black hover:bg-[#e8870e]"
                }`}
              >
                {creating ? "Creating…" : "Create Room"}
              </button>
            </div>
          )}

          {tab === "join" && (
            <div className="flex flex-col gap-4 bg-secondary border border-[#2a2a2a]
                            rounded-2xl p-6">
              <p className="text-sm text-gray-500">
                Enter the room code shared by your friend.
              </p>
              <Field label="Room code">
                <input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinByCode()}
                  placeholder="e.g. swift-tiger-1234"
                  className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg
                             text-sm font-mono focus:outline-none focus:border-[#3a3a3a]
                             transition-colors"
                />
              </Field>
              {joinError && <p className="text-sm text-red-500">{joinError}</p>}
              <button
                onClick={handleJoinByCode}
                disabled={!roomCode.trim()}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all
                           bg-[#2a2a2a] text-gray-300 hover:bg-[#333] hover:text-white
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Go to Room
              </button>
              <div className="text-center">
                <span className="text-sm text-gray-600">or </span>
                <button
                  onClick={() => setShowBrowser(true)}
                  className="text-sm text-blue-500/70 hover:text-blue-400 transition-colors"
                >
                  browse public rooms
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showBrowser && (
        <RoomBrowser onClose={() => setShowBrowser(false)} />
      )}
    </div>
  );
}

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-[#2a2a2a] text-white"
        : "text-gray-600 hover:text-gray-300"
    }`}
  >
    {children}
  </button>
);

const Field = ({ label, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm text-gray-600 font-medium">{label}</label>
    {children}
  </div>
);