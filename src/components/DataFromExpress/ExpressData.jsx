import { FileText, TextSearch } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../../auth/firebase';

const ExpressData = ({quizN}) => {
  const [questions, setQuestions] = useState([]);
  const [isModalOpenQqs, setisModalOpenQqs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(null);

  const fetchQuestions = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.REACT_APP_EXPRESS_API_URL || 'http://localhost:9800'}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data.data);
      setisModalOpenQqs(true);      
      
    } catch (err) {
      toast.error("Error fetching questions", { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async(question) => {
    const choiceArray = question?.choices.map((choice) => ({
      id: `ch_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text: choice.text,
      isCorrect: choice.correct
    }))

    const AiQuestion = {
      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      questionText: question.question,
      imageQuestion: "",
      randomResponse: false,
      questionTime: false,
      Time: "00:01",
      choices: choiceArray
    };

    try {
      
      const quizRef = doc(db, "quizzes", quizN);
  
      const quizSnapshot = await getDoc(quizRef);
  
      if (quizSnapshot.exists()) {
        const quizDataAi = quizSnapshot.data();
  
        const existingQuestions = quizDataAi.questions || [];
        
        const updatedQuestions = [...existingQuestions, AiQuestion];
        
  
        await updateDoc(quizRef, { questions: updatedQuestions });
        setQuestions(prevQuestions => 
          prevQuestions.filter(q => q !== question)
      );

        toast.success("Question added successfully", { position: "bottom-right" });
      } else {
        console.error("Quiz does not exist.");
      }
    } catch (error) {
      console.error("Error adding question:", error.message);
    }
    
  };


  
  return (
    <>
    { loading &&
      <div className="spinner-wrapper bg-black/20  backdrop-blur-md ">
        <span className="loader"></span>
      </div>
      }
     {isModalOpenQqs && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/20 p-4 pb-8 backdrop-blur-md sm:items-center lg:p-8 "
          role="dialog"
          aria-modal="true"
          aria-labelledby="defaultModalTitle"
          onClick={(e) => {
            if (e.target === e.currentTarget) setisModalOpenQqs(false);
          }}
        >
          <div 
            className="flex max-w-[800px] max-h-[600px] flex-col gap-4 overflow-y-auto overflow-x-hidden  custom-scrollbar rounded-md border border-neutral-300 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          >
            <div className="flex items-center justify-between border-b border-neutral-300 bg-neutral-50/60 p-4 dark:border-neutral-700 dark:bg-neutral-950/20">
              <h3 id="defaultModalTitle" className="font-semibold tracking-wide text-neutral-900 dark:text-white">
                Questions
              </h3>
              <button onClick={() => setisModalOpenQqs(false)} aria-label="close modal">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="1.4"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 py-8">
            {questions.map((question, index) => (
                <div key={index} className="mb-8 p-6 bg-white rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">
                   <span className='font-bold text-blue-600'>Question {index + 1} :</span>  {question.question}
                  </h2>
                  
                  <div className="space-y-3">
                    {question.choices.map((choice, choiceIndex) => (
                      <div 
                        key={choiceIndex}
                        className="flex items-start p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                      >
                        <span>{choice.text}</span>{choice.correct && <span className="ml-2 text-green-500">✓</span>}
                      </div>
                    ))}
                  </div>
                  <div className='flex justify-end'>
                    <button onClick={()=>addQuestion(question)} className='bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 mt-5'>Add Question</button>
                  </div>
                </div>
              ))}
            </div>

        
          </div>
        </div>
      )}
    
    
    <div className="bg-white  p-6 border lg:mt-5  shadow-md rounded-lg max-sm:mt-5 animate-enterRight ">
        

        <div className="mb-8 flex items-center gap-2 border-b-[2px] border-b-card-line-transparent pb-2">
            <FileText width={20} />
            <h2 className="text-md font-bold text-gray-800 ">
                  Data 
            </h2>
        </div>
        <div className="grid sm:grid-cols-12 gap-1 px-4 lg:justify-center items-center ">
          <div className="sm:col-span-12 flex items-center ">
            <label className="inline-block text-sm text-gray-800">
              Put your url here
            </label>
          </div>
          <form className="sm:col-span-12" onSubmit={fetchQuestions}>
          <div className="sm:col-span-12 flex items-center">
            <input
              type="text"
              id="url"
              name="url"
              defaultValue={url}
              onChange={(e) => setUrl(e.target.value)}
              className="QuizName border-2 shadow-sm py-2 px-3 pe-11 block w-full border-gray-300 rounded text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="sm:col-span-12 flex items-center mt-3">
            { loading ?
            
            <button className="flex items-center justify-center gap-3 bg-blue-400 text-white w-full inline-block rounded-lg border py-3 text-xs font-medium">
                <span className="loaderExpress"></span>
            </button>
            :
            
            <button
              type="submit"
              className="flex items-center justify-center gap-3 bg-blue-400 text-white w-full inline-block rounded-lg border py-3 text-xs font-medium"
            >
              <TextSearch width={20} />

               Generate
            </button>
            
            }
            
          </div>
          </form>
        </div>
    </div>
    
    </>
  );
}

export default ExpressData;
