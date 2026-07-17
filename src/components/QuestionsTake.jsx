import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { db } from "../auth/firebase";
import { Tooltip } from 'flowbite-react';

const QuestionsTake = ({quizId,setQuickQuestion}) => {
  const [isModalOpenQuestions, setisModalOpenQuestions] = useState(false); 

  const openModal = () => {
    setisModalOpenQuestions(true);
  };

  const closeModal = () => {
    setisModalOpenQuestions(false); 
  };
  const [isLoading, setIsLoading] = useState(false);


  const [text, setText] = useState('');

  const getQuestionToBd = async (e) => {
    e.preventDefault(); 
    const lines = text.split('\n').map((line) => line.trim()).filter((line) => line !== '');
    let currentQuestion = null;
    const newQuestions = [];
    let hasInvalidStructure = false;
  
    for (const line of lines) {
      if (line.endsWith('?')) {

        if (currentQuestion) {
          if (currentQuestion.choices.length < 2) {
            toast.error(`Question "${currentQuestion.questionText}" must have at least two choices`, {
              position: "bottom-right",
            });
            hasInvalidStructure = true;
          } else {
            newQuestions.push(currentQuestion);
          }
        }
  
        currentQuestion = {
          id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          questionText: line,
          imageQuestion: "",
          randomResponse: false,
          questionTime: false,
          Time: "00:01",
          choices: [],
        };
      } else {

        if (!currentQuestion) {
          toast.error(`"${line}" appears before any question`, {
            position: "bottom-right",
          });
          hasInvalidStructure = true;
        } else {
          currentQuestion.choices.push({
            id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            text: line,
            isCorrect: true, 
          });
        }
      }
    }
  
    // Add the last question
    if (currentQuestion) {
      if (currentQuestion.choices.length < 2) {
        toast.error(`Question "${currentQuestion.questionText}" must have at least two choices`, {
          position: "bottom-right",
        });
        hasInvalidStructure = true;
      } else {
        newQuestions.push(currentQuestion);
      }
    }
  
    if (hasInvalidStructure || newQuestions.length === 0) {
      return;
    }
  
    try {
      setIsLoading(true);
      const quizRef = doc(db, "quizzes", quizId); // Reference to the specific quiz document
      const quizSnap = await getDoc(quizRef);
  
      if (!quizSnap.exists()) {
        toast.error("Quiz not found!", { position: "bottom-right" });
        return;
      }
  
      const existingData = quizSnap.data();
      const existingQuestions = existingData.questions || [];
  
      // Append new questions to the existing ones
      const updatedQuestions = [...existingQuestions, ...newQuestions];
  
      await updateDoc(quizRef, { questions: updatedQuestions });
      
      toast.success("Questions added successfully!", { position: "bottom-right" });
      closeModal()
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast.error("Failed to add questions. Please try again.", { position: "bottom-right" });
    }finally {
      setIsLoading(false);
    }
  };
  


  return (
    <div><Toaster />
      { isLoading &&
      <div className="spinner-wrapper">
        <span className="loader"></span>
      </div>
      }
    

      <label className="inline-flex items-center px-4 cursor-pointer " onClick={openModal} >
        <Tooltip content="Add quick questions">
          <img className="shrink-0 size-6" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEMAAABDCAYAAADHyrhzAAAACXBIWXMAAAsTAAALEwEAmpwYAAADHklEQVR4nO2aW4hNYRTHf4NhMibXB8rkTnhRnoTSlBeJByTDg3lQg0mUWyIJUVLIJSlJeCCXmDe3klAilElqKDQaTaJxGbc5+rR2lqOz59zmnP3tWb9aTbPP2l/r++/vsta3NxiGYRiGYXQeFcAR4BnQGAN7BFRlK8ZWIBEza8hWjGMRCD6RZ2s2MTAxEp0xMhqBDZ7blXyJcRP/WWNi/MXEUJgYChOjUGKUACMLbK48iKQYPYqQPdaYGERfjO5FqDrnR1UM3zAxFCZGIcXoX2DrmW1HbGv9F8szFCaGwhZQxVhgATCHLIlTnpEzvotRAkwCFss02SV/FwETu0rVOgw4ALzqoPBzKf4eYEgcq9YKYC/QlnTfL6AJeAq8BdqTfv8EbAfK4iLGcOCJ8v0CHAVmAqVJvr2AWcBx4Ju6517YKOlIjPcFtuoUcY6XNDvo1BmgkvQYBVxS976RaZaRGFHBpenPJc6fwOoUftNka61Ksf5tUdPnMdDHRzEuqKdaG+IXvES6G+KzUbV1wjcxpqvgXazkKIYbIefUouu2ZW/EuCXxfQAG5kEMx1BZfJ1vvS9iVKo5vi0N/3TFcOwT3x/AAB/EqFNTxO0m+RRjimp7iQ9inJbYXqbpn4kY3YAW8T8U1S93alTAN+TadXVtBnA2hTWJf0uIj65o74v/RR/EaJBrboQELM2x/XWqrcsqK/2Dy8QmR8j0jvFAgnV5RsC8kHcun8W/LcRnmWrraoSXiP+oz2ANyHTN0CPvFB5wUIJt7ajazEKMfsB38d+BB8xWc91VoPkUo1q1PRUPKJNziIR0NJ9iBJntO3mn7AX7M3iC6YqhR5z7QtobBkld4gJ/If/nIsZg4LX4Nef4cUxRqFVP8hpQnsLP5SC7gRUpfu8L3JF2XM2zEE85rAR5mMEpV8BotZUm5BTdW0qBk6ozbrvdHDJK9GjYqUr2oBZxtYn3rJWyO+iYyzrPAyul7nCL7FxglaTbX5WvOxheTswYJ0VX8uuAVNYu/u5gOLZMADbJ7tGaJMBH4DawHhhDF6QcGAH0LnYghmEYhoHxG2zI2+nRDYZBAAAAAElFTkSuQmCC" alt="external-Add-app-operations-others-inmotus-design" />
        </Tooltip>
      </label>


      {/* Modal Backdrop */}
      {isModalOpenQuestions && (
        <div
          className="pointer-events-auto fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-gray-500 bg-opacity-50 transition-opacity duration-300"
        >
          <div
            className="relative m-4 lg:w-[30%] max-md:w-[70%] max-sm:w-[70%] rounded-lg bg-white shadow-sm"
          >
            <div className="flex items-start justify-between p-4">
              <div>
                <h5 className="text-xl font-medium text-slate-800">
                  Add Question Quickly
                </h5>
                <p className="text-slate-500 text-sm font-light">
                  Copy and paste it here
                </p>
              </div>
              <button
                onClick={closeModal}
                className="relative h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-blue-gray-500 transition-all hover:bg-blue-gray-500/10 active:bg-blue-gray-500/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
              >
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </span>
              </button>
            </div>
            <div className="relative px-4">
              <form onSubmit={getQuestionToBd}>
                  {/* Textareas for Choices */}
                  <div className="mb-6">
                      <div  className="mb-2">
                      <textarea
                          className="w-full px-4 py-2 border border-slate-300 rounded-md text-sm "
                          rows="6"
                          placeholder="Question ?
                          choice 1
                          choice 2
                          choice 3
                          "
                          style={{ whiteSpace: 'pre-line' }}
                          onChange={(e) => setText(e.target.value)}
                          required
                        />
                      </div>


                    
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pb-5">
                    <button
                      className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none"
                    type="submit"
                    >
                      Save
                    </button>
                  </div>
              </form>
            </div>
        
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionsTake;
