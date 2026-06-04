import React from "react";

const Message = ({ message, username }) => {
  const isOwn = message.username === username;
  const isBot = message.username === "chatBot";

  if (isBot) {
    return (
      <div className="flex justify-center my-1">
        <p className="text-m text-gray-600 px-2 py-0.5 rounded-full bg-[#1f1f1f]
                      border border-[#2a2a2a] select-none">
          {message.message}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col my-1 ${isOwn ? "items-end" : "items-start"}`}>
      {!isOwn && (
        <p className="text-m text-gray-600 mb-0.5 ml-2 select-none">
          {message.username}
        </p>
      )}
      <div
        className={`max-w-[85%] px-3 py-1.5 rounded-xl text-sm leading-relaxed ${
          isOwn
            ? "bg-[#2d3561] text-gray-100 rounded-tr-sm"
            : "bg-[#222] text-gray-300 rounded-tl-sm border border-[#2a2a2a]"
        }`}
      >
        {message.message}
      </div>
    </div>
  );
};

export default Message;