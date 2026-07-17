import React, { useEffect, useState } from "react";
import theme2 from "../assets/images/thm2.png"
import theme1 from "../assets/images/thm.png"
import theme3 from "../assets/images/thm3.png"
import { Palette } from "lucide-react";

const ThemeStyle = ({changeTheme}) => {
  const [selectedTheme, setSelectedTheme] =  useState(localStorage.getItem("themeType") || "theme1");

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "themeType") {
        setSelectedTheme(event.newValue); 
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange); 
    };
  }, [selectedTheme]);
  
  const changeValueTheme = (e) => {
    setSelectedTheme(e.target.value);
    changeTheme(e.target.value);
    
  };

  return (
    <div className="overflow-x-hidden">
      <div className="flex items-center gap-2 px-4 pt-6 pb-2 border-b-[2px] border-b-card-line-transparent">
        <Palette width={20} />
        <h3 className="text-md font-bold">Theme Settings</h3>
        <div className="flex items-center space-x-2"></div>
      </div>

      <div className="grid sm:grid-cols-12 gap-4 px-4 justify-center items-center pt-8">
        {/* Theme 1 */}
        <div className="sm:col-span-6 flex items-center justify-center">
          <label
            className={`
              relative group 
              aspect-square 
              flex 
              rounded-xl 
              items-center 
              justify-center 
              cursor-pointer 
              transition 
              border-2 
              max-sm:w-[60%]
              shadow-md 
              hover:shadow-lg
              ${
                selectedTheme === "theme1"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }
            `}
          >
            <input
              type="radio"
              name="theme"
              value="theme1"
              checked={selectedTheme === "theme1"}
              onChange={(e) => changeValueTheme(e) }
              className="hidden"
            />
            <span
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-100 to-blue-300 opacity-0 group-hover:opacity-10 transition"
              aria-hidden="true"
            ></span>
            <img 
              src={theme1}
              alt="Theme 1" 
              className="w-full h-full border-2 rounded-xl"
            />
          </label>
        </div>

        {/* Theme 2 */}
        <div className="sm:col-span-6 flex items-center justify-center">
          <label
            className={`
              relative group 
              aspect-square 
              flex 
              max-sm:w-[60%]
              rounded-xl 
              items-center 
              justify-center 
              cursor-pointer 
              transition 
              border-2 
              shadow-md 
              hover:shadow-lg
              ${
                selectedTheme === "theme2"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }
            `}
          >
            <input
              type="radio"
              name="theme"
              value="theme2"
              checked={selectedTheme === "theme2"}
              onChange={(e) => changeValueTheme(e) }
              className="hidden"
            />
            <span
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-100 to-blue-300 opacity-0 group-hover:opacity-10 transition"
              aria-hidden="true"
            ></span>
            <img 
              src={theme2}
              alt="Theme 2" 
              className="w-full h-full border-2 rounded-xl"
            />
          </label>
        </div>
      </div>


      <div className="grid sm:grid-cols-12 gap-4 px-4 justify-center items-center pt-8">
        {/* Theme 3 */}
        <div className="sm:col-span-6 flex items-center justify-center">
          <label
            className={`
              relative group 
              aspect-square 
              flex 
              rounded-xl 
              items-center 
              justify-center 
              cursor-pointer 
              transition 
              border-2 
              max-sm:w-[60%]
              shadow-md 
              hover:shadow-lg
              ${
                selectedTheme === "theme3"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-gray-400"
              }
            `}
          >
            <input
              type="radio"
              name="theme"
              value="theme3"
              checked={selectedTheme === "theme3"}
              onChange={(e) => changeValueTheme(e) }
              className="hidden"
            />
            <span
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-100 to-blue-300 opacity-0 group-hover:opacity-10 transition"
              aria-hidden="true"
            ></span>
            <img 
              src={theme3}
              alt="Theme 1" 
              className="w-full h-full border-2 rounded-xl"
            />
          </label>
        </div>

      </div>
    </div>
  );
};

export default ThemeStyle;