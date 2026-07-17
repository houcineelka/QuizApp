import { Clipboard } from "flowbite-react";
import React, { useState } from "react";
import { db } from "../auth/firebase";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const AiGenerate = () => {
  const [prompt, setPrompt] = useState("");
  const [quizDataAi, setquizDataAi] = useState(null);
  const [responseCount, setResponseCount] = useState(3);
  const [correctChoicesCount, setcorrectChoicesCount] = useState(1);

  const [taskType, setTaskType] = useState("generateQuiz");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, SetIsLoadingPage] = useState(false);
  const {quizN}= useParams();

  const resetquizDataAi = () => {
    setquizDataAi(null); 
  };

  const generateContent = async () => {
    try {
      setIsLoading(true);
      if (prompt === "") {
        toast.error('Please enter a prompt', { position: 'bottom-right' });
        return;
      }else{

      
      const taskPrompt =
        taskType === "generateQuiz"
          ? `${prompt} Generate a question and ${responseCount} choices as an array of objects, where each object has "text" and "isCorrect" keys. Ensure exactly ${correctChoicesCount} choice(s) have "isCorrect" set to true. Return the result as JSON.`
          : `Generate a corrected version of the following text: "${prompt}". Return the result as plain text.`;

      const response = await fetch(`${process.env.REACT_APP_EXPRESS_API_URL || 'http://localhost:9800'}/api/openai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: taskPrompt,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from OpenAI");
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (taskType === "generateQuiz") {
        try {
          const parsedData = JSON.parse(content);
          setquizDataAi({
            question: parsedData.question || "No question provided.",
            choices: Array.isArray(parsedData.choices) ? parsedData.choices : [],
          });
          setIsLoading(false);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          setquizDataAi({ error: "Invalid response format from OpenAI." });
        }
      } else {
        setquizDataAi({ correctedText: content || "No corrected text provided." });
      }
    }
    } catch (error) {
      console.error("Error generating content:", error);
      setquizDataAi({ error: "An error occurred while generating the content." });
    }finally{
      setIsLoading(false);
    }
  };

  const handleAddQuestion = async() => {
    
    const choiceArray = quizDataAi?.choices.map((choice) => ({
      id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text: choice.text,
      isCorrect: choice.isCorrect
    }))

    const AiQuestion = {
      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      questionText: quizDataAi.question,
      imageQuestion: "",
      randomResponse: false,
      questionTime: false,
      Time: "00:01",
      choices: choiceArray
    };

    try {
      
      SetIsLoadingPage(true); 
      const quizRef = doc(db, "quizzes", quizN);
  
      // Fetch the current quiz data
      const quizSnapshot = await getDoc(quizRef);
  
      if (quizSnapshot.exists()) {
        const quizDataAi = quizSnapshot.data();
  
        const existingQuestions = quizDataAi.questions || [];
        
        const updatedQuestions = [...existingQuestions, AiQuestion];
        
  
        await updateDoc(quizRef, { questions: updatedQuestions });
        SetIsLoadingPage(false);
        setquizDataAi(null);
        toast.success("Question added successfully", { position: "bottom-right" });
      } else {
        console.error("Quiz does not exist.");
      }
    } catch (error) {
      console.error("Error adding question:", error.message);
    }finally{
      SetIsLoadingPage(false);
    }

  };

  return (
  
    <div className="overflow-x-hidden">
      { isLoadingPage &&
        <div className="spinner-wrapper">
          <span className="loader"></span>
        </div>
      }

      {/* ai settings sidebar */} 
      <div className="flex items-center gap-2 px-4 pt-6 pb-2 border-b-2 border-gray-200">
        <img  className="w-4 h-4" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAxklEQVR4nOWUTQ6CMBSEv0R7KjyGZ6BEvIJeSVzogbgARDbuMCRD0gUgBd5GJ5mE9Gemnfco/Coy0Qx3oLAS3wEVUOt7c/Ej0IrHrUwyxVIH4j0rzfmBfWcgn2PgZxikA/ueoklEDmhEZ1HkQ3CQBIM2vQYGl1gDP1JUp9N2gmVgUGosiY2rR9cpD+XdfmGjtbm1wYkFcFYRbV7kqUL3SNa0KWrT28T8Hngt+dG8xN9iMXGT6Kci1iBf2i1zIlqNdOQF/TN8AEkwYB3qcBNmAAAAAElFTkSuQmCC" alt="sparkling" />
        <h3 className="text-md font-bold">AI Assistant</h3>
      </div>

      <div className="grid sm:grid-cols-12 gap-4 px-4 lg:justify-center items-center pt-3">
        {/* Number of responses */}
        <div className="sm:col-span-7 flex items-center mt-3">
          <label className="inline-block text-sm text-gray-800">Number of responses</label>
        </div>
        <div className="sm:col-span-5 flex items-center mt-3">
          <input
            type="number"
            value={responseCount}
            onChange={(e) => setResponseCount(Math.max(2, Math.min(10, parseInt(e.target.value, 10))))}
            className="lg:w-24 max-sm:w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

          {/* Number of responses correct */}
          <div className="sm:col-span-7 flex items-center mt-3">
          <label className="inline-block text-sm text-gray-800">Correct responses</label>
        </div>
        <div className="sm:col-span-5 flex items-center mt-3">
          <input
            type="number"
            min="1"
            max={responseCount}
            value={correctChoicesCount}
            onChange={(e) => setcorrectChoicesCount(Math.max(1, Math.min(10, parseInt(e.target.value, 10))))}
            className="lg:w-24 max-sm:w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Radio buttons */}
        <div className="sm:col-span-12 flex items-center mt-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="taskType"
              value="correctSentences"
              checked={taskType === "correctSentences"}
              onChange={() => {
                setTaskType("correctSentences");
                resetquizDataAi();
              }}
              className="mt-0.5 border-gray-300 rounded-full text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Correct Sentences</span>
          </label>
          <label className="flex items-center ml-4">
            <input
              type="radio"
              name="taskType"
              value="generateQuiz"
              checked={taskType === "generateQuiz"}
              onChange={() => {
                setTaskType("generateQuiz");
                resetquizDataAi();
              }}
              className="mt-0.5 border-gray-300 rounded-full text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Generate Quiz</span>
          </label>
        </div>

        {/* Text area */}
        <div className="sm:col-span-12 mt-3">
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              resetquizDataAi();
            }}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="5"
            placeholder="Type your prompt here..."
          ></textarea>
        </div>

        {/* Generate button */}
        <div className="sm:col-span-12 flex justify-end ">

          <button
            onClick={generateContent}
            className="border-blue-400 text-blue-500 m-2 inline-block rounded border py-1 px-2.5 text-xs font-medium"
          >

              Generate
          </button>    

        </div>

        {/* Output */}
        <div className="sm:col-span-12 flex justify-center ">
        


    
          {quizDataAi?.error && <p className="text-red-500 text-sm font-semibold">{quizDataAi.error}</p>}

          {isLoading && taskType === "generateQuiz" ? <div className="hsn mx-20 my-10"></div> : quizDataAi && taskType === "generateQuiz" && !quizDataAi.error && (
          
            <div className="relative mb-4">
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 box-content block h-6 w-6 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:border-gray-500 focus:border-gray-900"
                type="button"
                onClick={handleAddQuestion}
              >
                <img    className="w-2 h-2 text-gray-600" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAANklEQVR4nGNgGGngPxSPWoAT/B8NIkLg/8gOov9UxvS3YOjHATHg/6gFhMD/0SAa8CBiGHQAAOITS7WQXzPpAAAAAElFTkSuQmCC" alt="plus"></img>
              </button>
              <label
                className="flex cursor-pointer flex-col rounded-2xl border border-gray-300 bg-slate-100/80 p-4 pr-8 sm:pr-16"
              >
                <span className="mb-2 text-sm font-semibold">{quizDataAi.question}</span>
                <ul>
                {quizDataAi.choices.map((choice, index) => (
                <li className="text-xs mb-1">
                {choice.text} {choice.isCorrect && <span className="text-green-500">(Correct)</span>}
                </li>
              ))}</ul>
              </label>
            </div>
          
          )}

          { isLoading && taskType === "correctSentences" ? <div className="hsn mx-20 my-10"></div> : quizDataAi && taskType === "correctSentences" && !quizDataAi.error && (
            
          
            <div className="relative mb-4">
            <label className="flex items-start rounded-2xl border border-gray-300 bg-slate-100/80 p-4 pr-8 sm:pr-16">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-md font-semibold">Corrected Text:</span>
                </div>
                <p className="text-sm">
                  {quizDataAi.correctedText}
                </p>
              </div>
              <Clipboard.WithIcon
                valueToCopy={quizDataAi.correctedText}
                className="absolute top-5 right-4 h-7 w-7 rounded-full border-2 border-gray-300 bg-white hover:border-gray-500 focus:border-gray-900"
              />
            </label>
          </div>
          
          
          


          )}
        </div>
      </div>
    </div>
  );
};

export default AiGenerate;
