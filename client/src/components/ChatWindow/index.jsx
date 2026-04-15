import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import { socket } from "../../services/socket";
import { updatePeople, updateAllProblems } from "../../store/slices/roomSlice";
import Message from "./Message";
import PeopleList from "./PeopleList";
import NewRoomRequest from "./NewRoomRequest";

const DIFFICULTY_MIXES = [
  { label: "Balanced",   value: ["Easy","Medium","Medium","Hard"] },
  { label: "Easy focus", value: ["Easy","Easy","Medium","Medium"] },
  { label: "Hard focus", value: ["Medium","Medium","Hard","Hard"] },
  { label: "All Medium", value: ["Medium","Medium","Medium","Medium"] },
];

const ChatWindow = () => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.user.username);
  const people = useSelector((state) => state.room.people);
  const room = useSelector((state) => state.room.roomName);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [disableNewQuestions, setDisableNewQuestions] = useState(false);
  const [showMixPicker, setShowMixPicker] = useState(false);
  const [selectedMix, setSelectedMix] = useState(0);
  const bottomRef = useRef(null);

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

  useEffect(() => {
    if (!username) return;
    socket.emit("join_room", { username, room });
    socket.on("receive_message", addMessage);
    socket.on("chatroom_users", (data) => dispatch(updatePeople(data)));
    socket.on("new_questions_request", (data) => {
      setDisableNewQuestions(true);
      setTimeout(() => setDisableNewQuestions(false), data.maxResponseTime - Date.now() + 3000);
      addMessage({ ...data, newRoomRequest: true });
    });
    socket.on("update_room_questions", (data) => dispatch(updateAllProblems(data)));
    return () => {
      socket.off("receive_message");
      socket.off("chatroom_users");
      socket.off("new_questions_request");
      socket.off("update_room_questions");
    };
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("send_message", { username, message: input.trim(), room, __createdtime__: Date.now() });
    setInput("");
  };

  const requestNewQuestions = () => {
    const mix = DIFFICULTY_MIXES[selectedMix].value;
    socket.emit("new_questions", { room, username, mix });
    setDisableNewQuestions(true);
    setShowMixPicker(false);
    setTimeout(() => setDisableNewQuestions(false), 15000);
  };

  const respondToNewQuestions = ({ status }) => {
    socket.emit("new_questions_response", { room, username, status, time: Date.now() });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-primary">
      {/* People section */}
      <div className="flex-shrink-0 p-3 border-b border-[#2a2a2a]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 font-medium">{people.length} online</p>
        </div>
        <PeopleList />
      </div>

      {/* New questions section */}
      <div className="flex-shrink-0 p-3 border-b border-[#2a2a2a]">
        {showMixPicker && (
          <div className="mb-2 flex flex-col gap-1">
            <p className="text-xs text-gray-400 mb-1">Difficulty mix</p>
            {DIFFICULTY_MIXES.map((mix, i) => (
              <button
                key={i}
                onClick={() => setSelectedMix(i)}
                className={`text-xs px-3 py-1.5 rounded-lg text-left transition-colors ${
                  selectedMix === i ? "bg-[#3a3a3a] text-white" : "text-gray-400 hover:bg-[#2a2a2a]"
                }`}
              >
                {mix.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button
            disabled={disableNewQuestions}
            onClick={() => setShowMixPicker((p) => !p)}
            className={`px-2 py-1.5 rounded-lg text-xs border border-[#3a3a3a] transition-colors ${
              disableNewQuestions ? "opacity-40 cursor-not-allowed" : "hover:bg-[#2a2a2a]"
            }`}
          >
            ⚙
          </button>
          <button
            disabled={disableNewQuestions}
            onClick={requestNewQuestions}
            className={`flex-1 py-1.5 rounded-lg text-xs border border-[#3a3a3a] font-medium transition-colors ${
              disableNewQuestions ? "opacity-40 cursor-not-allowed" : "hover:bg-[#2a2a2a]"
            }`}
          >
            New questions ✨
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5 scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent scrollbar-thumb-rounded-full">
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

      {/* Input */}
      <div className="flex-shrink-0 flex gap-2 p-3 border-t border-[#2a2a2a]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Send a message..."
          className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-xs focus:outline-none focus:border-[#555] transition-colors"
        />
        <button
          onClick={sendMessage}
          className="px-3 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#333] rounded-lg text-xs transition-colors"
        >
          Send
        </button>
      </div>

    </div>
  );
};

export default React.memo(ChatWindow);
