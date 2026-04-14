import React from "react";

const Message = ({ message, username }) => {
<<<<<<< HEAD
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
=======
  const giveStyle = () => {
    if (username === message.username) return "items-end";
    else if (message.username === "chatBot") return "items-center";
  };
  return (
    <div className={"flex flex-col w-full my-2 " + giveStyle()}>
      {message.username !== "chatBot" && message.username !== username && (
        <p className="text-sm text-gray-300">{message.username}</p>
      )}
      <p
        className={
          "w-fit p-2 my-1 rounded-xl border-2 border-tertiary " +
          (message.username === "chatBot"
            ? "bg-tertiary font-semibold w-full flex justify-center text-center"
            : message.username === username
            ? " bg-[#38419d] rounded-tr-none border-0"
            : " rounded-tl-none bg-black")
        }
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
      >
        {message.message}
      </p>
    </div>
  );
};

export default Message;
