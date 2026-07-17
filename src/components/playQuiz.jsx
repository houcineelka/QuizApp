import React, { useState, useEffect } from "react";

// Utility to add leading zero
const addLeadingZero = (num) => (num < 10 ? `0${num}` : num);

const QuizApp = () => {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timer, setTimer] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const questions = [
    {
      questionText: "Which planets are gas giants?",
      choices: ["Earth", "Jupiter", "Mars", "Saturn"],
      correctAnswers: [1, 3],
    },
    {
      questionText: "Select the primary colors:",
      choices: ["Red", "Green", "Blue", "Yellow"],
      correctAnswers: [0, 2, 3],
    },
    {
      questionText: "Which languages are used for web development?",
      choices: ["Python", "HTML", "CSS", "C++"],
      correctAnswers: [1, 2],
    },
  ];

  const question = questions[activeQuestion]?.questionText;
  const choices = questions[activeQuestion]?.choices;

  // Timer logic
  useEffect(() => {
    if (timer > 0 && !quizCompleted) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !quizCompleted) {
      onClickNext();
    }
  }, [timer, quizCompleted]);

  const onAnswerSelected = (index) => {
    setSelectedAnswers((prev) => {
      const currentAnswers = prev[activeQuestion] || [];
      const updatedAnswers = currentAnswers.includes(index)
        ? currentAnswers.filter((i) => i !== index)
        : [...currentAnswers, index];
      return { ...prev, [activeQuestion]: updatedAnswers };
    });
  };

  const onClickPrevious = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
      setTimer(30);
    }
  };

  const onClickNext = () => {
    if (activeQuestion < questions.length - 1) {
      setActiveQuestion(activeQuestion + 1);
      setTimer(30);
    } else {
      setQuizCompleted(true);
    }
  };

  // Result screen
  if (quizCompleted) {
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter((q, index) => {
      const selected = selectedAnswers[index] || [];
      return (
        q.correctAnswers.length === selected.length &&
        q.correctAnswers.every((ans) => selected.includes(ans))
      );
    }).length;

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-10">
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-[450px] text-center">
          <h1 className="text-4xl font-bold text-[#2d3748] mb-4">
            Congratulations!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            You scored <span className="font-semibold text-[#38bdf8]">{percentage}%</span> ({correctAnswers} out of {totalQuestions}).
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-[#38bdf8] text-white font-semibold text-lg rounded-lg hover:bg-[#1d4ed8] transition duration-300"
          >
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-l from-green-400 via-teal-500 to-blue-500 py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-[600px] text-center">
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-2xl font-semibold text-[#2d3748]">
              {addLeadingZero(activeQuestion + 1)}
            </span>
            <span className="text-lg text-[#718096]">/{addLeadingZero(questions.length)}</span>
          </div>
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-[#38bdf8]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3M12 12A9 9 0 110 12a9 9 0 0112-12z"
              />
            </svg>
            <span className="ml-2 text-xl font-semibold text-[#38bdf8]">
              00:{addLeadingZero(timer)}
            </span>
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-2xl font-medium text-[#2d3748] mb-6">{question}</h2>

        {/* Choices */}
        <form className="space-y-4">
          {choices.map((answer, index) => (
            <label
              key={index}
              className={`block py-3 px-6 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${
                selectedAnswers[activeQuestion]?.includes(index)
                  ? "bg-[#38bdf8] text-white border-[#38bdf8]"
                  : "bg-white text-[#2d3748] border-[#e2e8f0] hover:border-[#38bdf8] hover:text-[#38bdf8]"
              }`}
            >
              <input
                type="checkbox"
                value={index}
                checked={selectedAnswers[activeQuestion]?.includes(index) || false}
                onChange={() => onAnswerSelected(index)}
                className="hidden"
              />
              {answer}
            </label>
          ))}
        </form>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onClickPrevious}
            disabled={activeQuestion === 0}
            className="px-6 py-3 text-lg font-semibold text-[#38bdf8] border border-[#38bdf8] rounded-lg hover:bg-[#f1f5f9] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={onClickNext}
            className="px-6 py-3 text-lg font-semibold text-white bg-[#38bdf8] rounded-lg hover:bg-[#1d4ed8] transition duration-300"
          >
            {activeQuestion === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizApp;
