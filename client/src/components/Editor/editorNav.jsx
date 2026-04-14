import React, { useState } from "react";
// import EditorNav from "../Dropdown";
import { LANGUAGES } from "../../constants";
import monacoThemes from "monaco-themes/themes/themelist";
import { Menu, Transition } from "@headlessui/react";
import Dropdown from "../Dropdown";

// const EditorNav = ({ language, setLanguage }) => {
// //   console.log(monacoThemes);
//   return (
//     <div className="w-[200px] py-2">
//       <Dropdown
//         // className="w-[200px]"
//         placeholder={language.label}
//         options={LANGUAGES}
//         value={language.value}
//         key={language.id}
//         handleChange={(e) => setLanguage(e)}
//       />
//     </div>
//   );
// };

// export default EditorNav;

export default ({ language, setLanguage, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Python3");

  const items = ["Python3", "Java", "JavaScript", "TypeScript", "C#"];
  return (
    <Dropdown
      options={LANGUAGES}
      placeholder={language}
      onChange={(value) => setLanguage(value)}
      disabled={loading}
    />
  );
};
