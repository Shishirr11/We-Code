import React from "react";
import { Menu, Transition } from "@headlessui/react";

const Dropdown = ({ placeholder, options, onChange, disabled = false }) => (
  <Menu as="div" className="relative inline-block text-left z-10">
    <Menu.Button
      disabled={disabled}
      className={`inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary border border-secondary hover:border-gray-500 rounded-md shadow-sm hover:bg-[#3a3a3a] focus:outline-none ${
        disabled ? "opacity-40 cursor-not-allowed" : ""
      }`}
    >
      {placeholder?.label || placeholder?.value || placeholder}
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </Menu.Button>

    <Transition
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute left-0 w-56 mt-2 bg-secondary rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          {options.map((option, i) => (
            <Menu.Item key={i}>
              {({ active }) => (
                <button
                  className={`w-full text-left px-4 py-2 text-sm ${active ? "bg-[#3a3a3a]" : ""}`}
                  onClick={() => onChange(option)}
                >
                  {option.label || option.value || option}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
);

export default Dropdown;