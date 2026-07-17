import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";

function ResponsesSortableInputs({
  id,
  input,
  choices,
  updateChoice,
  updateCheck,
  deleteChoice,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : "none",
    transition: transition || "none",
  };

  const [inputText, setInputText] = useState(input.text);
  const [isChecked, setIsChecked] = useState(input.isCorrect);

  // Handler to update the input value
  const handleInputChange = (e, id) => {
    setInputText(e.target.value);
    updateChoice(e.target.value, id);
  };

  // Handler to update the checkbox state
  const handleCheckboxChange = (e, id) => {
    const updatedIsCorrect = e.target.checked;
    updateCheck(updatedIsCorrect, id);
  };

  useEffect(() => {
    setIsChecked(input.isCorrect);
  }, [input.isCorrect]);

  return (
    <div key={id} ref={setNodeRef} style={style} className="flex mb-2">
      {/* Drag handle */}
      <span
        {...listeners}
        {...attributes}
        className="font-bold me-2 py-2 px-2 bg-indigo-500 cursor-move rounded"
      >
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAVUlEQVR4nO3VMQqAMBBE0T2ewVubmyTe49sIahCRFBHhv3aLgYFhI6RRgBlYgQqkkcGVQ2lumT75q+DlTXDawwswddUm3XHHcW3DHeuH8B+fuGMpHmwHAxf5nL4N4AAAAABJRU5ErkJggg=="
          alt="bulleted-list"
        />
      </span>

      {/* Correct or isCorrect */}
      <div className="inline-flex px-2 items-center">
        <label className="flex items-center cursor-pointer relative">
          <input
            type="checkbox"
            checked={isChecked} // Bind the checkbox to the state
            onChange={(e) => handleCheckboxChange(e, id)} // Update on change
            className="peer h-6 w-6 cursor-pointer transition-all appearance-none rounded-md bg-slate-100 shadow hover:shadow-md border border-slate-300 checked:bg-green-400"
            id="check-custom-style"
          />
          <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </span>
        </label>
      </div>

      {/* Input field */}
      <input
        id={`quiz-input-${id}`}
        value={inputText} // Bind input value to the state
        onChange={(e) => handleInputChange(e, id)} // Update the input text
        type="text"
        className="QuizName border-2 shadow-sm py-2 px-3 pe-11 block w-full border-gray-300 rounded text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
      />

      {/* Delete Button */}
      {choices.length > 2 && (
        <button
          className="px-3 py-1 rounded hover:bg-white-400"
          onClick={(e) => deleteChoice(id)}
        >
          <svg
            className="shrink-0 size-4"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width={24}
            height={24}
            viewBox="0,0,256,256"
          >
            <g
              fillOpacity="0.90196"
              fill="#dd0e19"
              fillRule="nonzero"
              stroke="none"
              strokeWidth={1}
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit={10}
              strokeDasharray="true"
              strokeDashoffset={0}
              fontFamily="none"
              fontWeight="none"
              fontSize="none"
              textAnchor="none"
              style={{ mixBlendMode: "normal" }}
            >
              <g transform="scale(10.66667,10.66667)">
                <path d="M10,2l-1,1h-6v2h18v-2h-6l-1,-1zM4.36523,7l1.52734,13.26367c0.132,0.99 0.98442,1.73633 1.98242,1.73633h8.24805c0.998,0 1.85138,-0.74514 1.98438,-1.74414l1.52734,-13.25586z" />
              </g>
            </g>
          </svg>
        </button>
      )}
    </div>
  );
}

export default ResponsesSortableInputs;
