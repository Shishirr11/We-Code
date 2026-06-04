import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { socket } from "../../services/socket";

const DIFF_COLORS = { Easy: "#00b8a3", Medium: "#ffc01e", Hard: "#ff375f" };
const AVATAR_PALETTE = [
  "#8bc2e8","#ffafca","#89c7f4","#f97772",
  "#f2bf6d","#8d79e0","#f7bfa8","#c9bafc","#a085e5","#a6a1ed",
];
const getAvatarColor = (u) => AVATAR_PALETTE[(u?.length ?? 0) % AVATAR_PALETTE.length];

export default function RoomBrowser({ onClose }) {
  const username = useSelector((s) => s.user.username);
  const navigate = useNavigate();

  const [rooms,     setRooms]     = useState([]);
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);
  const [requested, setRequested] = useState(new Set());
  const [status,    setStatus]    = useState({});

  useEffect(() => {
    socket.emit("get_rooms");
    socket.on("rooms_list",    setRooms);
    socket.on("rooms_updated", setRooms);

    socket.on("join_requested", ({ roomId }) => {
      setRequested((p) => new Set(p).add(roomId));
      setStatus((p) => ({ ...p, [roomId]: "pending" }));
    });
    socket.on("join_approved", ({ roomId }) => {
      setStatus((p) => ({ ...p, [roomId]: "approved" }));
      setTimeout(() => { navigate(`/${username}/room/${roomId}`); onClose(); }, 800);
    });
    socket.on("join_rejected", ({ roomId }) => {
      setStatus((p) => ({ ...p, [roomId]: "rejected" }));
      setRequested((p) => { const s = new Set(p); s.delete(roomId); return s; });
    });

    return () => {
      socket.off("rooms_list");
      socket.off("rooms_updated");
      socket.off("join_requested");
      socket.off("join_approved");
      socket.off("join_rejected");
    };
  }, [username]); 

  const handleRequest = useCallback((roomId) => {
    socket.emit("join_request", { roomId, username });
  }, [username]);

  const filtered = rooms.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.host.toLowerCase().includes(q) ||
      r.topics.some((t) => t.toLowerCase().includes(q)) ||
      r.members?.some((m) => m.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60"
           style={{ backdropFilter: "blur(4px)" }} onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-2xl max-h-[85vh] bg-[#1a1a1a] border border-[#2a2a2a]
                        rounded-2xl flex flex-col overflow-hidden pointer-events-auto"
             onClick={(e) => e.stopPropagation()}>

          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#222]">
            <div>
              <h2 className="font-semibold text-base text-white">Browse Rooms</h2>
              <p className="text-xs text-gray-600 mt-0.5">{filtered.length} public rooms</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         text-gray-600 hover:text-gray-300 hover:bg-[#222] text-lg">
              ×
            </button>
          </div>

          <div className="flex-shrink-0 px-4 py-3 border-b border-[#222]">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, host, topic, or member…"
              className="w-full px-3 py-2 bg-[#222] border border-[#2a2a2a] rounded-lg
                         text-sm focus:outline-none focus:border-[#3a3a3a] transition-colors
                         placeholder-gray-700" autoFocus />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 scrollbar-thin
                          scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
            {filtered.length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-sm text-gray-600">
                  {rooms.length === 0 ? "No public rooms right now." : "Nothing matches your search."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    currentUser={username}
                    status={status[room.id]}
                    requested={requested.has(room.id)}
                    onRequest={() => handleRequest(room.id)}
                    onDetails={() => setSelected(room)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <RoomDetail
          room={selected}
          currentUser={username}
          status={status[selected.id]}
          requested={requested.has(selected.id)}
          onRequest={() => handleRequest(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}


function RoomCard({ room, currentUser, status, requested, onRequest, onDetails }) {
  const slots  = room.maxMembers - room.memberCount;
  const isFull = slots <= 0;

  return (
    <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-4 flex flex-col gap-3
                    hover:border-[#333] transition-all cursor-pointer"
         onClick={onDetails}>

      <div>
        <p className="text-sm font-semibold text-white truncate">{room.name}</p>
        <p className="text-xs text-gray-600 mt-0.5">by {room.host}</p>
      </div>

      <div className="flex items-center gap-1.5">
        {(room.members ?? []).slice(0, 5).map((m, i) => (
          <div key={i} title={m}
            className="w-6 h-6 rounded-full flex items-center justify-center
                       text-[10px] font-bold text-gray-900 flex-shrink-0"
            style={{ backgroundColor: getAvatarColor(m) }}>
            {m[0].toUpperCase()}
          </div>
        ))}
        {slots > 0 && Array.from({ length: Math.min(slots, 5 - (room.members?.length ?? 0)) }).map((_, i) => (
          <div key={`empty-${i}`}
            className="w-6 h-6 rounded-full border border-dashed border-[#2a2a2a]
                       flex items-center justify-center text-[10px] text-gray-700">
            +
          </div>
        ))}
        <span className="text-[10px] text-gray-600 ml-1">{room.memberCount}/{room.maxMembers}</span>
      </div>

      {room.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {room.topics.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2a2a] text-gray-500 border border-[#333]">
              {t}
            </span>
          ))}
          {room.topics.length > 3 && (
            <span className="text-[10px] text-gray-700">+{room.topics.length - 3}</span>
          )}
        </div>
      )}

      <button
        disabled={isFull || requested || room.host === currentUser}
        onClick={(e) => { e.stopPropagation(); onRequest(); }}
        className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
          status === "approved" ? "bg-[#1e4030] text-[#2CBB5D]"
            : status === "rejected" ? "bg-[#3d1e1e] text-[#ff375f]"
            : requested ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
            : room.host === currentUser ? "bg-[#1f1f1f] text-gray-700 cursor-not-allowed"
            : isFull ? "bg-[#1f1f1f] text-gray-700 cursor-not-allowed"
            : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] hover:text-white"
        }`}>
        {status === "approved" ? "Approved ✓"
          : status === "rejected" ? "Rejected"
          : requested ? "Request sent…"
          : room.host === currentUser ? "Your room"
          : isFull ? "Full"
          : "Request to join"}
      </button>
    </div>
  );
}


function RoomDetail({ room, currentUser, status, requested, onRequest, onClose }) {
  const slots  = room.maxMembers - room.memberCount;
  const isFull = slots <= 0;

  return (
    <>
      <div className="fixed inset-0 z-60 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6
                        flex flex-col gap-5 pointer-events-auto"
             onClick={(e) => e.stopPropagation()}>

          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-white text-base">{room.name}</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Hosted by <span className="text-gray-400">{room.host}</span>
              </p>
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-xl leading-none">×</button>
          </div>

          <div>
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mb-2">
              Members ({room.memberCount}/{room.maxMembers})
            </p>
            <div className="flex flex-wrap gap-2">
              {(room.members ?? []).map((m) => (
                <div key={m} className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center
                                  text-xs font-bold text-gray-900"
                       style={{ backgroundColor: getAvatarColor(m) }}>
                    {m[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-400">
                    {m}
                    {m === room.host && (
                      <span className="text-[#fa971f] ml-1 text-[9px]">host</span>
                    )}
                  </span>
                </div>
              ))}
              {slots > 0 && (
                <p className="text-[10px] text-gray-700 w-full mt-1">
                  {slots} open slot{slots !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {room.topics.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mb-2">Topics</p>
              <div className="flex flex-wrap gap-1">
                {room.topics.map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#fa971f]/10
                                           text-[#fa971f] border border-[#fa971f]/20">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mb-2">Difficulty mix</p>
            <div className="flex gap-1.5">
              {(room.difficultyMix ?? ["Easy","Medium","Medium","Hard"]).map((d, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#222] border border-[#2a2a2a]"
                      style={{ color: DIFF_COLORS[d] ?? "#aaa" }}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          <button
            disabled={isFull || requested || room.host === currentUser}
            onClick={onRequest}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
              status === "approved" ? "bg-[#1e4030] text-[#2CBB5D]"
                : status === "rejected" ? "bg-[#3d1e1e] text-[#ff375f]"
                : requested ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
                : room.host === currentUser ? "bg-[#1f1f1f] text-gray-700 cursor-not-allowed"
                : isFull ? "bg-[#1f1f1f] text-gray-700 cursor-not-allowed"
                : "bg-[#fa971f] text-black hover:bg-[#e8870e]"
            }`}>
            {status === "approved" ? "Approved — joining…"
              : status === "rejected" ? "Request rejected"
              : requested ? "Request sent…"
              : room.host === currentUser ? "Your room"
              : isFull ? "Room is full"
              : "Request to join"}
          </button>
        </div>
      </div>
    </>
  );
}