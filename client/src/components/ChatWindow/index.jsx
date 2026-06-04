import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../services/socket";
import { updatePeople, updateAllProblems } from "../../store/slices/roomSlice";
import Message from "./Message";
import PeopleList from "./PeopleList";
import NewRoomRequest from "./NewRoomRequest";

const DIFFICULTY_MIXES = [
  { label: "Balanced  E · M · M · H",  value: ["Easy","Medium","Medium","Hard"]   },
  { label: "Easy focus  E · E · M · M", value: ["Easy","Easy","Medium","Medium"]   },
  { label: "Hard focus  M · M · H · H", value: ["Medium","Medium","Hard","Hard"]   },
  { label: "All Medium",                value: ["Medium","Medium","Medium","Medium"] },
];

const MAX_MESSAGES = 200;

const ChatWindow = ({ roomId, onNewMessage }) => {
  const dispatch = useDispatch();
  const username = useSelector((s) => s.user.username);
  const people   = useSelector((s) => s.room.people);

  const [messages,      setMessages]     = useState([]);
  const [input,         setInput]        = useState("");
  const [newQDisabled,  setNewQDisabled] = useState(false);
  const [showMixPicker, setShowMix]      = useState(false);
  const [selectedMix,   setSelectedMix]  = useState(0);

  const bottomRef       = useRef(null);
  const onNewMessageRef = useRef(onNewMessage);
  useEffect(() => { onNewMessageRef.current = onNewMessage; }, [onNewMessage]);

  const addMessage = useCallback(
    (msg) => setMessages((prev) => {
      const next = [...prev, msg];
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    }),
    []
  );

  useEffect(() => {
    if (!username || !roomId) return;

    socket.on("receive_message", (msg) => {
      addMessage(msg);
      if (msg.username !== username) onNewMessageRef.current?.();
    });

    socket.on("chatroom_users", (data) => dispatch(updatePeople(data)));

    socket.on("new_questions_request", (data) => {
      setNewQDisabled(true);
      setTimeout(
        () => setNewQDisabled(false),
        data.maxResponseTime - Date.now() + 3000
      );
      addMessage({ ...data, newRoomRequest: true });
      onNewMessageRef.current?.();
    });

    socket.on("update_room_questions", (data) =>
      dispatch(updateAllProblems(data))
    );

    return () => {
      socket.off("receive_message");
      socket.off("chatroom_users");
      socket.off("new_questions_request");
      socket.off("update_room_questions");
    };
  }, [username, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("send_message", {
      username,
      message: input.trim(),
      room: roomId,
      __createdtime__: Date.now(),
    });
    setInput("");
  };

  const requestNewQuestions = () => {
    socket.emit("new_questions", {
      room:     roomId,
      username,
      mix: DIFFICULTY_MIXES[selectedMix].value,
    });
    setNewQDisabled(true);
    setShowMix(false);
    setTimeout(() => setNewQDisabled(false), 15000);
  };

  const respondToNewQuestions = ({ status }) => {
    socket.emit("new_questions_response", {
      room:     roomId,
      username,
      status,
      time: Date.now(),
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-primary">

      <div className="flex-shrink-0 px-3 pt-2.5 pb-2 border-b border-[#222]">
        <p className="text-xs text-gray-700 font-medium mb-2 select-none">
          {people.length} online
        </p>
        <PeopleList />
      </div>

      <div className="flex-shrink-0 px-3 py-2.5 border-b border-[#222]">
        {showMixPicker && (
          <div className="mb-2 p-2 bg-[#1f1f1f] border border-[#2a2a2a]
                          rounded-lg flex flex-col gap-0.5">
            <p className="text-xs text-gray-600 px-1 pt-0.5 pb-1 select-none">
              Difficulty mix
            </p>
            {DIFFICULTY_MIXES.map((mix, i) => (
              <button key={i} onClick={() => setSelectedMix(i)}
                className={`text-sm px-2 py-1.5 rounded-md text-left transition-all ${
                  selectedMix === i
                    ? "bg-[#2a2a2a] text-gray-200"
                    : "text-gray-600 hover:text-gray-300 hover:bg-[#222]"
                }`}>
                {mix.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <button disabled={newQDisabled} onClick={() => setShowMix((p) => !p)}
            className={`w-8 h-8 rounded-md border border-[#2a2a2a] flex items-center
                        justify-center text-sm transition-all ${
              newQDisabled
                ? "opacity-25 cursor-not-allowed text-gray-600"
                : "text-gray-500 hover:text-gray-200 hover:bg-[#222]"
            }`}>
            ⚙
          </button>
          <button disabled={newQDisabled} onClick={requestNewQuestions}
            className={`flex-1 h-8 rounded-md text-sm border border-[#2a2a2a]
                        font-medium transition-all ${
              newQDisabled
                ? "opacity-25 cursor-not-allowed text-gray-600"
                : "text-gray-500 hover:text-gray-200 hover:bg-[#222]"
            }`}>
            New questions ✨
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 flex flex-col gap-0.5
                      scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent
                      scrollbar-thumb-rounded-full">
        {messages.map((msg, i) =>
          msg.newRoomRequest ? (
            <NewRoomRequest
              key={i}
              sendNewQuestionsResponse={respondToNewQuestions}
              maxResponseTime={msg.maxResponseTime}
              requestorUsername={msg.username}
              username={username}
              proposedMix={msg.mix}
            />
          ) : (
            <Message key={i} message={msg} username={username} />
          )
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 flex gap-2 p-3 border-t border-[#222]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Message…"
          className="flex-1 px-3 py-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded-md
                     text-sm focus:outline-none focus:border-[#3a3a3a] transition-colors
                     placeholder-gray-700 text-gray-200"
        />
        <button onClick={sendMessage}
          className="px-3 py-2 bg-[#222] hover:bg-[#2a2a2a] border border-[#2a2a2a]
                     rounded-md text-sm text-gray-500 hover:text-gray-200 transition-all">
          Send
        </button>
      </div>
    </div>
  );
};

export default React.memo(ChatWindow);