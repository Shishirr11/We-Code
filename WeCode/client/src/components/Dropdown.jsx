import React, { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import QuestionDisplay from "./QuestionDisplay";
const Dropdown = ({
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <Menu as="div" className="relative inline-block text-left z-10">
      <div>
        <Menu.Button
          disabled={disabled}
          className={"inline-flex justify-center px-4 py-2 text-sm font-medium bg-secondary border border-secondary hover:border-gray-300 rounded-md shadow-sm hover:bg-[#3a3a3a] focus:outline-none " + (disabled ? "text-secondary hover:text-[#3a3a3a]" : "")}
        >
          {placeholder?.value || placeholder}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 ml-2 -mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Menu.Button>
      </div>

      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 w-56 mt-2 origin-top-right bg-secondary rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option, ind) => {
              return (
                <Menu.Item key={ind}>
                  <button
                    className={`w-full flex hover:bg-[#3a3a3a] px-4 py-2 font-medium"`}
                    onClick={() => {
                      onChange(option);
                    }}
                  >
                    {option.value || option}
                  </button>
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown;
