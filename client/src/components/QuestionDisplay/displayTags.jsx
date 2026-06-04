import React, { useState } from "react";

const DisplayIcon = ({ open, setOpen }) => {
  return (
    <div
      class="text-[24px] cursor-pointer"
      onClick={() => {
        setOpen((prev) => !prev);
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="currentColor"
      >
        {open ? (
          <path
            fill-rule="evenodd"
            d="M16.293 14.707a1 1 0 001.414-1.414l-5-5a1 1 0 00-1.414 0l-5 5a1 1 0 101.414 1.414L12 10.414l4.293 4.293z"
            clip-rule="evenodd"
          ></path>
        ) : (
          <path
            fill-rule="evenodd"
            d="M16.293 9.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L12 13.586l4.293-4.293z"
            clip-rule="evenodd"
          ></path>
        )}
      </svg>
    </div>
  );
};

const DisplayTags = ({ tags }) => {
  const [open, setOpen] = useState(false);
  // console.log(tags)
  const tagsIcon = () => {};
  return (
    <div>
      <div className="flex justify-between mb-3 pt-2 mt-4 pr-2 border-t-[2px] border-t-secondary">
        <p className="text-lg font-semibold">Related Topics</p>
        <DisplayIcon open={open} setOpen={setOpen} />
      </div>
      <div
        className="overflow-hidden transition-all duration-500 flex flex-wrap gap-y-3"
        style={{ height: open ? "auto" : "0px" }}
      >
        {tags.map((tag) => (
          <div className="mr-4 rounded-xl py-1 px-2 text-sm bg-[#424242] hover:bg-[#464646]">
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayTags;
