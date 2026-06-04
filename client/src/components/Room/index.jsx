import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import Split from "react-split-grid";
import { socket } from "../../services/socket";
import {
  nextProblem, prevProblem, setCurrentProblem,
  fetchProblems, setRoomData, clearRoom,
  addJoinRequest, removeJoinRequest,
} from "../../store/slices/roomSlice";
import QuestionDisplay from "../QuestionDisplay";
import CustEditor from "../Editor";
import ChatWindow from "../ChatWindow";
import { getRoomById } from "../../api/rooms";
import "./styles.css";


const storageKey   = (rid) => `wecodes_problem_${rid}`;
const saveProgress  = (rid, idx) => sessionStorage.setItem(storageKey(rid), String(idx));
const loadProgress  = (rid)      => sessionStorage.getItem(storageKey(rid));
const clearProgress = (rid)      => sessionStorage.removeItem(storageKey(rid));


const LANGUAGES = [
  { id: 71, name: "Python3",    label: "Python 3",   value: "python",     leetcode_value: "python3"    },
  { id: 54, name: "C++",        label: "C++",         value: "cpp",        leetcode_value: "cpp"        },
  { id: 62, name: "Java",       label: "Java",        value: "java",       leetcode_value: "java"       },
  { id: 63, name: "JavaScript", label: "JavaScript",  value: "javascript", leetcode_value: "javascript" },
];

const DIFF_COLOR     = { Easy: "#00b8a3", Medium: "#ffc01e", Hard: "#ff375f" };
const getProblemSlug = (p) => (typeof p === "string" ? p : p?.slug ?? "");
const getProblemDiff = (p) => (typeof p === "string" ? "Easy" : p?.difficulty ?? "Easy");

export default function Room() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { roomId } = useParams();

  const username     = useSelector((s) => s.user.username);
  const problems     = useSelector((s) => s.room.allProblems);
  const isLoading    = useSelector((s) => s.room.isLoading);
  const currentProblem = useSelector((s) => s.room.currentProblem);
  const people       = useSelector((s) => s.room.people);
  const isHost       = useSelector((s) => s.room.isHost);
  const joinRequests = useSelector((s) => s.room.joinRequests);
  const roomMeta     = useSelector((s) => s.room.roomMeta);

  const [language,      setLanguage]  = useState(LANGUAGES[0]);
  const [qLoading,      setQLoading]  = useState(false);
  const [rightTab,      setRightTab]  = useState("code");
  const [unread,        setUnread]    = useState(0);
  const [showHostPanel, setHostPanel] = useState(false);
  const [roomError,     setRoomError] = useState("");
  const [joining,       setJoining]   = useState(true);

  const [waitingApproval, setWaitingApproval] = useState(false);
  const [approvalMeta,    setApprovalMeta]    = useState(null);
  const roomJoinedRef  = useRef(false);

  const [isReconnecting, setIsReconnecting] = useState(!socket.connected);

  const restoredRef = useRef(false);

  const problemObj  = problems[currentProblem];
  const problemSlug = getProblemSlug(problemObj);

  useEffect(() => {
    if (roomId && problems.length > 0 && !waitingApproval) {
      saveProgress(roomId, currentProblem);
    }
  }, [currentProblem, roomId, problems.length, waitingApproval]);

  useEffect(() => {
    if (problems.length > 0 && roomId && !restoredRef.current) {
      restoredRef.current = true;
      const saved = loadProgress(roomId);
      if (saved !== null) {
        const idx = parseInt(saved, 10);
        if (idx > 0 && idx < problems.length) dispatch(setCurrentProblem(idx));
      }
    }
  }, [problems.length, roomId, dispatch]);

  useEffect(() => {
    if (!username || !roomId) return;

    const onSocketConnect = () => {
      setIsReconnecting(false);
      if (roomJoinedRef.current && username && roomId) {
        socket.emit("join_room", { username, room: roomId });
      }
    };

    const onSocketDisconnect = () => {
      setIsReconnecting(true);
    };

    socket.on("connect",    onSocketConnect);
    socket.on("disconnect", onSocketDisconnect);


    const init = async () => {
      setJoining(true);

      const data = await getRoomById(roomId);
      if (!data?.id) {
        setRoomError("Room not found or has been closed.");
        setJoining(false);
        return;
      }

      const alreadyMember = data.members?.includes(username);

      if (alreadyMember) {
        dispatch(setRoomData({
          roomId,
          roomMeta: data,
          isHost:   data.host === username,
        }));
        socket.emit("join_room", { username, room: roomId });
        dispatch(fetchProblems(roomId));
        roomJoinedRef.current = true;  

        if (data.host === username && Array.isArray(data.pendingRequests)) {
          data.pendingRequests.forEach((u) => dispatch(addJoinRequest({ username: u })));
        }

      } else {
        setApprovalMeta(data);
        setWaitingApproval(true);
        socket.emit("join_request", { roomId, username });
      }

      setJoining(false);
    };

    init();


    socket.on("join_error", ({ message }) => {
      setRoomError(message ?? "Could not join room.");
    });

    socket.on("join_approved", ({ roomId: rid }) => {
      if (rid !== roomId) return;
      setWaitingApproval(false);
      getRoomById(rid).then((data) => {
        if (!data?.id) return;
        dispatch(setRoomData({ roomId: rid, roomMeta: data, isHost: false }));
        socket.emit("join_room", { username, room: rid });
        dispatch(fetchProblems(rid));
        roomJoinedRef.current = true;   
      });
    });

    socket.on("join_rejected", ({ roomId: rid }) => {
      if (rid !== roomId) return;
      setWaitingApproval(false);
      setRoomError("Your join request was rejected by the host.");
    });

    socket.on("you_were_kicked", () => {
      clearProgress(roomId);
      dispatch(clearRoom());
      navigate(`/${username}`);
    });

    socket.on("room_dissolved", () => {
      clearProgress(roomId);
      dispatch(clearRoom());
      navigate(`/${username}`);
    });

    socket.on("new_join_request", ({ username: requester, roomId: rid }) => {
      if (rid === roomId) dispatch(addJoinRequest({ username: requester }));
    });

    return () => {
      socket.off("connect",    onSocketConnect);
      socket.off("disconnect", onSocketDisconnect);
      socket.off("join_error");
      socket.off("join_approved");
      socket.off("join_rejected");
      socket.off("you_were_kicked");
      socket.off("room_dissolved");
      socket.off("new_join_request");

      roomJoinedRef.current = false;
    };
  }, [roomId, username]);   

  useEffect(() => {
    if (username && roomId && !waitingApproval)
      socket.emit("problem_changed", { room: roomId, username, problemIndex: currentProblem });
  }, [currentProblem, username, roomId, waitingApproval]);

  const switchTab = useCallback((tab) => {
    setRightTab(tab);
    if (tab === "chat") setUnread(0);
  }, []);

  const handleNewMessage = useCallback(() => setUnread((n) => n + 1), []);

  const goToProblem = (idx) => {
    const delta = idx - currentProblem;
    const fn    = delta > 0 ? nextProblem : prevProblem;
    for (let i = 0; i < Math.abs(delta); i++) dispatch(fn());
  };

  const handleLeave = () => {
    clearProgress(roomId);
    socket.emit("leave_room", { roomId, username });
    dispatch(clearRoom());
    navigate(`/${username}`);
  };

  const respondToRequest = (targetUsername, approve) => {
    socket.emit("host_respond", { roomId, targetUsername, approve });
    dispatch(removeJoinRequest(targetUsername));
  };

  const handleKick = (targetUsername) => {
    socket.emit("kick_member", { roomId, targetUsername });
  };


  if (roomError) return (
    <div className="w-full h-full flex items-center justify-center bg-primary">
      <div className="text-center flex flex-col gap-4 max-w-sm px-4">
        <p className="text-3xl">🚫</p>
        <p className="text-gray-400 text-sm leading-relaxed">{roomError}</p>
        <button onClick={() => navigate(`/${username}`)}
          className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-sm text-gray-300
                     hover:bg-[#333] transition-colors">
          Back to lobby
        </button>
      </div>
    </div>
  );

  if (joining) return (
    <div className="w-full h-full flex items-center justify-center bg-primary">
      <CircularProgress color="inherit" size={24} />
    </div>
  );

  if (waitingApproval) return (
    <div className="w-full h-full flex items-center justify-center bg-primary">
      <div className="text-center flex flex-col items-center gap-5 max-w-sm px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#222] border border-[#2a2a2a]
                        flex items-center justify-center text-3xl">
          {approvalMeta?.isPublic ? "🏠" : "🔒"}
        </div>
        <div>
          <p className="font-semibold text-white text-lg mb-1">
            {approvalMeta?.name ?? roomId}
          </p>
          <p className="text-sm text-gray-600">
            {approvalMeta?.isPublic ? "Public room" : "Private room"} · hosted by{" "}
            <span className="text-gray-400">{approvalMeta?.host}</span>
          </p>
        </div>
        <div className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl px-5 py-4
                        flex flex-col gap-2 w-full text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <CircularProgress color="inherit" size={14} />
            <span>Waiting for host to approve your request…</span>
          </div>
          <p className="text-xs text-gray-700">
            The host will see your request in their Manage panel.
          </p>
        </div>
        <button
          onClick={() => {
            socket.off("join_approved");
            socket.off("join_rejected");
            navigate(`/${username}`);
          }}
          className="text-xs text-gray-700 hover:text-gray-500 transition-colors">
          Cancel and go back
        </button>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="w-full h-full flex items-center justify-center bg-primary">
      <CircularProgress color="inherit" size={24} />
    </div>
  );


  return (
    <div className="w-full h-full flex flex-col bg-primary overflow-hidden">

      {isReconnecting && (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2
                        bg-amber-900/40 border-b border-amber-700/40">
          <CircularProgress color="inherit" size={12} />
          <p className="text-xs text-amber-400/90">
            Connection lost: trying to get it back online..
          </p>
        </div>
      )}

      <header className="flex-shrink-0 h-12 bg-secondary border-b border-[#222]
                         flex items-center px-4 gap-3">
        <div className="flex items-center gap-1 font-bold flex-shrink-0 select-none">
          <span className="text-base tracking-tight">WE</span>
          <span className="px-1.5 py-0.5 text-sm rounded-md bg-[#fa971f] text-black font-bold">
            CODES
          </span>
        </div>

        <div className="w-px h-4 bg-[#333] flex-shrink-0" />

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-gray-400">{roomMeta?.name ?? roomId}</span>
          <span className="text-xs text-gray-700 font-mono select-all cursor-text
                           px-1.5 py-0.5 bg-[#1f1f1f] border border-[#2a2a2a] rounded">
            {roomId}
          </span>
          {roomMeta && !roomMeta.isPublic && (
            <span className="text-[10px] text-gray-700 border border-[#2a2a2a]
                             rounded px-1.5 py-0.5">
              Private
            </span>
          )}
        </div>

        {problems.length > 0 && (
          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none min-w-0">
            {problems.map((p, i) => {
              const diff     = getProblemDiff(p);
              const isActive = i === currentProblem;
              const here     = people.filter((u) => (u.currentProblem ?? 0) === i).length;
              return (
                <button key={i} onClick={() => goToProblem(i)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm
                              font-medium transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-[#2a2a2a] text-white"
                      : "text-gray-600 hover:text-gray-300 hover:bg-[#1f1f1f]"
                  }`}>
                  <span style={{ color: DIFF_COLOR[diff] ?? DIFF_COLOR.Easy, fontSize: 6 }}>●</span>
                  P{i + 1}
                  {here > 0 && (
                    <span className={`text-xs px-1 rounded-full ${
                      isActive ? "bg-[#3a3a3a] text-gray-400" : "text-gray-700"
                    }`}>{here}</span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {isHost && (
            <button onClick={() => setHostPanel((v) => !v)}
              className={`relative px-3 py-1 text-sm rounded-md border transition-all ${
                showHostPanel
                  ? "bg-gray-200 border-gray-200 text-black"
                  : "bg-white border-white text-black hover:bg-gray-100 hover:border-gray-100"
              }`}>
              Manage
              {joinRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5
                                 rounded-full bg-[#fa971f] text-black text-[9px] font-bold
                                 flex items-center justify-center">
                  {joinRequests.length}
                </span>
              )}
            </button>
          )}
          <span className="text-sm font-medium px-2.5 py-0.5 rounded-md select-none
                  bg-[#fa971f]/10 border border-[#fa971f]/25 text-[#fa971f]">
   {username}
 </span>
          <button
            onClick={handleLeave}
            disabled={isReconnecting}
            className="px-3 py-1 text-sm rounded-md bg-[#ff375f] border border-[#ff375f] text-white hover:bg-[#e02d52] hover:border-[#e02d52] hover:text-red-500
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all">
            Leave
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden flex">

        {showHostPanel && isHost && (
          <div className="w-64 flex-shrink-0 bg-secondary border-r border-[#222]
                          flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-3 border-b border-[#222]">
              <p className="text-sm font-semibold text-white">Room management</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-4">

              {joinRequests.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">
                    Join requests ({joinRequests.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {joinRequests.map((req) => (
                      <div key={req.username}
                        className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg p-2.5
                                   flex flex-col gap-2">
                        <p className="text-sm text-gray-300 font-medium">{req.username}</p>
                        <div className="flex gap-1.5">
                          <button onClick={() => respondToRequest(req.username, true)}
                            className="flex-1 py-1 rounded-md text-xs bg-[#1e4030] text-[#2CBB5D]
                                       hover:bg-[#2CBB5D] hover:text-white transition-all">
                            Accept
                          </button>
                          <button onClick={() => respondToRequest(req.username, false)}
                            className="flex-1 py-1 rounded-md text-xs bg-[#3d1e1e] text-[#ff375f]
                                       hover:bg-[#ff375f] hover:text-white transition-all">
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">
                  Members ({people.length}/{roomMeta?.maxMembers ?? 5})
                </p>
                <div className="flex flex-col gap-1">
                  {people.map((p) => (
                    <div key={p.username}
                      className="flex items-center justify-between px-2.5 py-2
                                 rounded-lg hover:bg-[#222] transition-colors group">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center
                                        justify-center text-xs text-gray-400 flex-shrink-0">
                          {p.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-300 truncate max-w-[100px]">
                          {p.username}
                          {p.username === roomMeta?.host && (
                            <span className="text-[10px] text-[#fa971f] ml-1">host</span>
                          )}
                        </span>
                      </div>
                      {p.username !== username && (
                        <button onClick={() => handleKick(p.username)}
                          className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#ff375f] border border-[#ff375f] text-white hover:bg-[#e02d52] hover:border-[#e02d52] opacity-0 group-hover:opacity-100 transition-all">
                          kick
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {roomMeta?.topics?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">
                    Topics
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {roomMeta.topics.map((t) => (
                      <span key={t}
                        className="text-xs px-2 py-0.5 rounded-full bg-[#fa971f]/10
                                   text-[#fa971f] border border-[#fa971f]/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden">
          <Split
            render={({ getGridProps, getGutterProps }) => (
              <div className="room-grid h-full overflow-hidden" style={getGridProps().style}>

                <div className="h-full min-h-0 overflow-hidden">
                  <QuestionDisplay
                    problemSlug={problemSlug}
                    problems={problems}
                    currentProblem={currentProblem}
                    questionLoading={qLoading}
                    setQuestionLoading={setQLoading}
                  />
                </div>

                <div className="gutter-col" {...getGutterProps("column", 1)} />

                <div className="flex flex-col h-full min-h-0 overflow-hidden">
                  <div className="flex-shrink-0 h-[42px] flex items-center gap-0.5 px-2
                                  bg-secondary border-b border-[#222]">
                    <TabBtn active={rightTab === "code"} onClick={() => switchTab("code")}>
                      Code
                    </TabBtn>
                    <TabBtn
                      active={rightTab === "chat"}
                      onClick={() => switchTab("chat")}
                      badge={unread > 0 && rightTab !== "chat" ? unread : 0}
                    >
                      Chat
                    </TabBtn>
                  </div>

                  <div className="flex-1 min-h-0 relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden"
                      style={{ display: rightTab === "code" ? "" : "none" }}>
                      <CustEditor
                        problemSlug={problemSlug}
                        language={language}
                        setLanguage={setLanguage}
                        questionLoading={qLoading}
                        problemIndex={currentProblem}
                        totalProblems={problems.length}
                      />
                    </div>
                    <div className="absolute inset-0 overflow-hidden"
                      style={{ display: rightTab === "chat" ? "" : "none" }}>
                      <ChatWindow
                        roomId={roomId}
                        onNewMessage={rightTab === "code" ? handleNewMessage : undefined}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}

const TabBtn = ({ active, onClick, badge, children }) => (
  <button onClick={onClick}
    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
                font-medium transition-all select-none ${
      active ? "bg-[#2a2a2a] text-white" : "text-gray-600 hover:text-gray-300 hover:bg-[#1f1f1f]"
    }`}>
    {children}
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full
                       bg-[#fa971f] text-black text-[9px] font-bold flex items-center
                       justify-center leading-none">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
  </button>
);