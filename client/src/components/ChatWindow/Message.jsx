import React from "react";

const Message = ({ message, username }) => {
  const isOwn = message.username === username;
  const isBot = message.username === "chatBot";

  return (
    <div className={`flex flex-col w-full my-1.5 ${isOwn ? "items-end" : isBot ? "items-center" : "items-start"}`}>
      {!isBot && !isOwn && (
        <p className="text-xs text-gray-400 mb-0.5 ml-1">{message.username}</p>
      )}
      <p
        className={`w-fit max-w-[85%] p-2 px-3 rounded-xl text-sm ${
          isBot
            ? "bg-tertiary font-medium text-center text-gray-300 rounded-lg text-xs px-4"
            : isOwn
            ? "bg-[#38419d] rounded-tr-none"
            : "bg-[#2a2a2a] rounded-tl-none border border-[#3a3a3a]"
        }`}
      >
        {message.message}
      </p>
    </div>
  );
};

export default Message;
