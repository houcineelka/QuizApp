import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../auth/firebase"; // Ensure you have the correct Firebase configuration here
import { useParams } from "react-router-dom";
import imageQ from "../assets/images/quizLogo.jpg";

const Preview = () => {
  const [quizData, setQuizData] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizTimer, setQuizTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setThemeType] = useState(localStorage.getItem("themeType") || "theme1");
  const { quizN } = useParams();

  const addLeadingZero = (num) => {
    return num.toString().padStart(2, '0');
  };

  useEffect(() => {
    const fetchQuizData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "quizzes", quizN); 
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          let data = docSnap.data();

          if (data.randomQuestions) {
            data.questions.sort(() => Math.random() - 0.5);
          }
      
          data.questions = data.questions.map(question => {

            if (question.randomResponse) {
              question.choices = question.choices.slice().sort(() => Math.random() - 0.5);
            }
            return question;
          });

        
          console.log(data.randomQuestions);
          
          setQuizData(data);
        } else {
          setError("Quiz not found");
        }
      } catch (err) {
        setError("Failed to load quiz data.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
    //  charge theme
    const handleStorageChange = (event) => {
      if (event.key === "themeType") {
        setThemeType(event.newValue); 
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange); 
    };

  }, []);

  useEffect(() => {
    if (quizData?.quizTime && !quizCompleted) {
      const totalQuizTime = parseTime(quizData.Time || "00:00");
      setQuizTimer(totalQuizTime);

      const intervalQuiz = setInterval(() => {
        setQuizTimer((prev) => {
          if (prev <= 0) {
            clearInterval(intervalQuiz);
            setQuizCompleted(true);
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(intervalQuiz);
    }
  }, [quizData, quizCompleted]);

  useEffect(() => {
    if (quizData && !quizData.quizTime && !quizCompleted) {
      const questionTime = parseTime(
        quizData?.questions?.[activeQuestion]?.Time || "00:00"
      );
      setQuestionTimer(questionTime);

      const intervalQuestion = setInterval(() => {
        setQuestionTimer((prev) => {
          if (prev <= 0) {
            clearInterval(intervalQuestion);
            onClickNext();
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(intervalQuestion);
    }
  }, [quizData, activeQuestion, quizCompleted]);

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60; 
  };
 // Convert seconds to MM:SS format
 const formatTimeDisplay = (totalSeconds) => {
  if (totalSeconds < 0) return "00:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${addLeadingZero(minutes)}:${addLeadingZero(seconds)}`;
};
  if (loading) {
    return   <div className="spinner-wrapper">
                <span className="loader"></span>
              </div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const questions = quizData?.questions || [];
  const question = questions[activeQuestion]?.questionText;
  const questionImage = questions[activeQuestion]?.imageQuestion;

  const choices = questions[activeQuestion]?.choices;

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
    }
  };

  const onClickNext = () => {
    if (activeQuestion < questions.length - 1) {
      setActiveQuestion(activeQuestion + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  if (quizCompleted) {
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter((q, index) => {
      const selected = selectedAnswers[index] || [];
      const correctChoiceIndices = q.choices
        .map((choice, choiceIndex) => (choice.isCorrect ? choiceIndex : -1))
        .filter((index) => index !== -1);

      const hasIncorrectAnswer = selected.some(
        (answerIndex) => !q.choices[answerIndex].isCorrect
      );

      if (hasIncorrectAnswer) return false;

      return correctChoiceIndices.every((correctIndex) => selected.includes(correctIndex));
    }).length;

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (<>
      {/* result theme 1  */}
      {theme === 'theme1' && (
      <div className="mx-auto mt-[100px] max-w-lg shadow-2xl rounded-md border border-[#444444] bg-[#1e293b] px-[60px] py-[30px]">
        <h2 className="text-3xl font-bold text-center text-[#38bdf8] mb-6">
          Quiz Completed!
        </h2>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
          <circle cx="200" cy="150" r="120" fill="#1e293b"/>
          
          <path d="M160 100 h80 v20 q0 50 -40 70 q-40 -20 -40 -70 v-20" fill="#38bdf8"/>
          <path d="M140 100 h20 v10 q-20 10 -20 30 q-20 -10 -20 -30 z" fill="#38bdf8"/>
          <path d="M240 100 h20 v10 q20 10 20 30 q20 -10 20 -30 z" fill="#38bdf8"/>
          
          <rect x="180" y="190" width="40" height="10" fill="#38bdf8"/>
          <path d="M170 200 h60 l10 20 h-80 z" fill="#38bdf8"/>
          
          <g fill="#ffd700">
            <path d="M100,80 l5,15 h15 l-12,9 l4,15 l-12,-9 l-12,9 l4,-15 l-12,-9 h15 z"/>
            <path d="M300,80 l5,15 h15 l-12,9 l4,15 l-12,-9 l-12,9 l4,-15 l-12,-9 h15 z"/>
            <path d="M200,40 l5,15 h15 l-12,9 l4,15 l-12,-9 l-12,9 l4,-15 l-12,-9 h15 z"/>
          </g>
          
          <g>
            <rect x="80" y="120" width="6" height="2" fill="#ff6b6b" transform="rotate(45, 83, 121)"/>
            <rect x="320" y="120" width="6" height="2" fill="#4ecdc4" transform="rotate(-45, 323, 121)"/>
            <rect x="100" y="200" width="6" height="2" fill="#ffe66d" transform="rotate(30, 103, 201)"/>
            <rect x="300" y="200" width="6" height="2" fill="#ff6b6b" transform="rotate(-30, 303, 201)"/>
            <circle cx="90" cy="150" r="2" fill="#4ecdc4"/>
            <circle cx="310" cy="150" r="2" fill="#ffe66d"/>
            <circle cx="200" cy="250" r="2" fill="#ff6b6b"/>
          </g>
        </svg>
        <p className="text-lg text-center text-white">
          You scored {percentage}% ({correctAnswers} out of {totalQuestions}).
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 mx-auto block px-6 py-2 bg-[#38bdf8] text-white text-lg font-semibold rounded-lg hover:bg-[#1d4ed8] transition duration-200"
        >
          Restart Quiz
        </button>
      </div>
      )}

      {/* result theme 2 */}
      {theme === 'theme2' && (
        <div className="flex flex-col  items-center justify-center min-h-screen bg-gradient-to-l from-green-400 via-teal-500 to-blue-500 text-white py-10">
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-lg text-center">
          <h1 className="text-4xl font-bold text-[#2d3748] mb-4">Quiz Completed!</h1>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
          <circle cx="200" cy="150" r="120" fill="#1e293b"/>
          
          <path d="M160 100 h80 v20 q0 50 -40 70 q-40 -20 -40 -70 v-20" fill="#38bdf8"/>
          <path d="M140 100 h20 v10 q-20 10 -20 30 q-20 -10 -20 -30 z" fill="#38bdf8"/>
          <path d="M240 100 h20 v10 q20 10 20 30 q20 -10 20 -30 z" fill="#38bdf8"/>
          
          <rect x="180" y="190" width="40" height="10" fill="#38bdf8"/>
          <path d="M170 200 h60 l10 20 h-80 z" fill="#38bdf8"/>
          
          <g fill="#ffd700">
            <path d="M100,80 l5,15 h15 l-12,9 l4,15 l-12,-9 l-12,9 l4,-15 l-12,-9 h15 z"/>
            <path d="M300,80 l5,15 h15 l-12,9 l4,15 l-12,-9 l-12,9 l4,-15 l-12,-9 h15 z"/>
            <path d="M200,40 l5,15 h15 l-12,9 l4,15 l-12,-9 l-12,9 l4,-15 l-12,-9 h15 z"/>
          </g>
          
          <g>
            <rect x="80" y="120" width="6" height="2" fill="#ff6b6b" transform="rotate(45, 83, 121)"/>
            <rect x="320" y="120" width="6" height="2" fill="#4ecdc4" transform="rotate(-45, 323, 121)"/>
            <rect x="100" y="200" width="6" height="2" fill="#ffe66d" transform="rotate(30, 103, 201)"/>
            <rect x="300" y="200" width="6" height="2" fill="#ff6b6b" transform="rotate(-30, 303, 201)"/>
            <circle cx="90" cy="150" r="2" fill="#4ecdc4"/>
            <circle cx="310" cy="150" r="2" fill="#ffe66d"/>
            <circle cx="200" cy="250" r="2" fill="#ff6b6b"/>
          </g>
        </svg>
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
      )}

      {/* result theme 3 */}
      {theme === 'theme3' && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-white">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full">
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-4">
            Quiz Completed!
          </h1>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
          <circle cx="200" cy="150" r="120" fill="#1e293b"/>
          
          <path d="M160 100 h80 v20 q0 50 -40 70 q-40 -20 -40 -70 v-20" fill="#38bdf8"/>
          <path d="M140 100 h20 v10 q-20 10 -20 30 q-20 -10 -20 -30 z" fill="#38bdf8"/>
          <path d="M240 100 h20 v10 q20 10 20 30 q20 -10 20 -30 z" fill="#38bdf8"/>
          
          <rect x="180" y="190" width="40" height="10" fill="#38bdf8"/>
          <path d="M170 200 h60 l10 20 h-80 z" fill="#38bdf8"/>
          
          <g fill="#ffd700">
            <path d="M100,80 l5,15 h15 l-12,9 l4,15 l-12,-9 l-12,9 l4,-15 l-12,-9 h15 z"/>
            <path d="M300,80 l5,15 h15 l-12,9 l4,15 l-12,-9 l-12,9 l4,-15 l-12,-9 h15 z"/>
            <path d="M200,40 l5,15 h15 l-12,9 l4,15 l-12,-9 l-12,9 l4,-15 l-12,-9 h15 z"/>
          </g>
          
          <g>
            <rect x="80" y="120" width="6" height="2" fill="#ff6b6b" transform="rotate(45, 83, 121)"/>
            <rect x="320" y="120" width="6" height="2" fill="#4ecdc4" transform="rotate(-45, 323, 121)"/>
            <rect x="100" y="200" width="6" height="2" fill="#ffe66d" transform="rotate(30, 103, 201)"/>
            <rect x="300" y="200" width="6" height="2" fill="#ff6b6b" transform="rotate(-30, 303, 201)"/>
            <circle cx="90" cy="150" r="2" fill="#4ecdc4"/>
            <circle cx="310" cy="150" r="2" fill="#ffe66d"/>
            <circle cx="200" cy="250" r="2" fill="#ff6b6b"/>
          </g>
        </svg>
          <p className="text-lg text-center text-gray-700">
            You scored <span className="font-bold text-indigo-500">{percentage}%</span> ({correctAnswers} out of {totalQuestions} correct answers).
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full px-4 py-2 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Restart Quiz
          </button>
        </div>
        </div>
      )}
      </>

    );
  }

  return (
    <>
    {theme === 'theme1' && (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="mx-auto mt-[100px] min-h-[550px] w-full max-w-[800px] rounded-md border border-[#444444] bg-[#1e293b] px-[60px] py-[30px] animate-enterFromTop">
          <div className="flex items-center justify-between">
        <div>
          <span className="text-4xl font-medium text-[#38bdf8]">
            {addLeadingZero(activeQuestion + 1)}
          </span>
          <span className="text-[22px] font-medium text-[#817a8e]">
            /{addLeadingZero(questions.length)}
          </span>
        </div>
        <div className="flex w-[100px] items-center gap-2">
          <span className="mt-1 block text-2xl font-medium text-[#38bdf8]">
          {formatTimeDisplay(quizTimer || questionTimer)}
          </span>
        </div>
      </div>
      <h3 className="my-4 text-2xl font-medium text-white">{question}</h3>
      { questionImage === "" ? null :
      <img
        src={questionImage} 
        alt="image Question"
        className="my-4 w-full h-60 rounded-md"
      />}
      <form>
        {choices.map((answer, index) => (
          <label
            key={index}
            className={`block my-2 p-3 rounded-md cursor-pointer border transition duration-300 ${
              selectedAnswers[activeQuestion]?.includes(index)
                ? "bg-[#38bdf8] text-white border-[#38bdf8]"
                : "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700"
            }`}
          >
            <input
              type="checkbox"
              name="answer"
              value={index}
              checked={selectedAnswers[activeQuestion]?.includes(index) || false}
              onChange={() => onAnswerSelected(index)}
              className="hidden"
            />
            {answer.text}
          </label>
        ))}
      </form>
      <div className="flex justify-between mt-12">
        {/* Hide Previous button when using question timer */}
        {quizData?.quizTime && (
          <button
            onClick={onClickPrevious}
            disabled={activeQuestion === 0}
            className="min-w-[150px] transform cursor-pointer rounded-lg border border-[#38bdf8] bg-[#1e293b] px-5 py-1.5 text-lg font-semibold text-[#38bdf8] outline-none transition duration-300 ease-in-out hover:scale-105 hover:bg-[#1d4ed8] active:scale-95 active:bg-[#1e40af] disabled:cursor-not-allowed disabled:border-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:hover:scale-100"
          >
            Previous
          </button>
        )}
        {/* If question timer mode, add margin-left-auto to Next button when Previous is hidden */}
        <button
          onClick={onClickNext}
          className={`min-w-[150px] transform cursor-pointer rounded-lg border border-[#38bdf8] bg-[#38bdf8] px-5 py-1.5 text-lg font-semibold text-white outline-none transition duration-300 ease-in-out hover:scale-105 hover:bg-[#1d4ed8] active:scale-95 active:bg-[#1e40af] disabled:cursor-not-allowed disabled:border-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:hover:scale-100 ${!quizData?.quizTime ? 'ml-auto' : ''}`}
        >
          {activeQuestion === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
      </div>
    </div>
    )}

    {theme === 'theme2' && (
     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-l from-green-400 via-teal-500 to-blue-500 py-10">
     <div className="bg-white shadow-lg rounded-2xl p-8 w-full  text-center min-h-[550px] max-w-[800px] animate-enterFromTop">
       <div className="flex justify-between items-center mb-8">
         <div>
           <span className="text-2xl font-semibold text-[#2d3748]">
             {addLeadingZero(activeQuestion + 1)}
           </span>
           <span className="text-lg text-[#718096]">/{addLeadingZero(questions.length)}</span>
         </div>
         <div className="flex items-center">
           
           <span className="ml-2 text-xl font-semibold text-[#38bdf8]">
           {formatTimeDisplay(quizTimer || questionTimer)}
           </span>
         </div>
       </div>

       {/* Question Text */}
       <h2 className="text-2xl font-medium text-[#2d3748] mb-6">{question}</h2>
        {/* image question */}
        { questionImage === "" ? null :
        <img
          src={questionImage} 
          alt="image Question"
          className="my-4 w-full h-60 rounded-md"
        />}
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
             {answer.text}
           </label>
         ))}
       </form>

       {/* Navigation Buttons */}
       <div className="flex justify-between mt-8">
          {quizData?.quizTime && (

            <button
              onClick={onClickPrevious}
              disabled={activeQuestion === 0}
              className="px-6 py-3 text-lg font-semibold text-[#38bdf8] border border-[#38bdf8] rounded-lg hover:bg-[#f1f5f9] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
          )}
         <button
           onClick={onClickNext}
           className="px-6 py-3 text-lg font-semibold text-white bg-[#38bdf8] rounded-lg hover:bg-[#1d4ed8] transition duration-300"
         >
           {activeQuestion === questions.length - 1 ? "Finish" : "Next"}
         </button>
       </div>
     </div>
      </div>
    )
    }
    
    {theme === 'theme3' && (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        {/* Question Progress */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-2xl font-semibold text-indigo-600">
              {addLeadingZero(activeQuestion + 1)}
            </span>
            <span className="text-lg text-gray-500">/{addLeadingZero(questions.length)}</span>
          </div>
          <div className="flex items-center">
      
            <span className="ml-2 text-xl font-semibold text-gray-700">
            {formatTimeDisplay(quizTimer || questionTimer)}
            </span>
          </div>
        </div>
  
        {/* Question Text */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{question}</h2>

        { questionImage === "" ? null :
        <img
          src={questionImage} 
          alt="image Question"
          className="my-4 w-full h-60 rounded-md"
        />}

        {/* Choices */}
        <form className="space-y-4">
          {choices.map((answer, index) => (
            <label
              key={index}
              className={`block px-4 py-3 rounded-lg cursor-pointer border transition duration-300 ${
                selectedAnswers[activeQuestion]?.includes(index)
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              <input
                type="checkbox"
                value={index}
                checked={selectedAnswers[activeQuestion]?.includes(index) || false}
                onChange={() => onAnswerSelected(index)}
                className="hidden"
              />
              {answer.text}
            </label>
          ))}
        </form>
  
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
        {quizData?.quizTime && (
          <button
            onClick={onClickPrevious}
            disabled={activeQuestion === 0}
            className="px-6 py-2 text-lg font-semibold text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
        )}
          <button
            onClick={onClickNext}
            className="px-6 py-2 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            {activeQuestion === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>

    )}


    </>
  );
};

export default Preview;
