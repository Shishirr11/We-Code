import React from "react";

const Message = ({ message, username }) => {
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
      >
        {message.message}
      </p>
    </div>
  );
};

export default Message;
