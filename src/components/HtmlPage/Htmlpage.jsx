import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { useAuth } from '../../auth/contexts/AuthContext';

const Htmlpage = ({quizId,FirebaseProjectLink,FirebaseApiKey,FirebaseAuthDomain,imageQuiz}) => {
  const [quizData, setQuizData] = useState(null);
  
  const [quizName, setQuizname] = useState(null);

  const [quizStatus, setQuizStatus] = useState(null);

  const [quizTime, setQuizTime] = useState(null);

  const { currentUser } = useAuth();


  useEffect(() => {
    const fetchQuizData = () => {
      try {
        const quizDocRef = doc(db, "quizzes", quizId); 
  
        const unsubscribe = onSnapshot(quizDocRef, (docSnapshot) => {
          const data = docSnapshot.data();
          if (data) {
            setQuizname(data.quizTitle);
            setQuizStatus(data.quizTime); 
            setQuizTime(data.Time);

            let questions = data.questions;

            if (data.randomQuestions) {
              questions = questions.sort(() => Math.random() - 0.5);

            }

            questions = questions.map((question) => ({
              ...question,
              choices: question.randomResponse
                ? question.choices.sort(() => Math.random() - 0.5)
                : question.choices, 
            }));

            setQuizData(questions); 
          
          }
        });
  
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };
  
    const unsubscribe = fetchQuizData();  
  
    return () => {
      if (unsubscribe) {
        unsubscribe();  
      }
    };
  }, [quizId]);


  // script
  const getObfuscatedScript = () => {
    const originalScript = `
    const quizData = ${JSON.stringify(quizData)};
    const quizStatus = ${quizStatus};
    const quizTime = "${quizTime}";
    const quizName = "${quizName}"; 
    let currentQuestionIndex = 0;
    const userAnswers = {};
    let timerInterval;
    let userName = '';

    // Firebase configuration and initialization
    let app;
    let db;

    async function initializeFirebase() {
        const firebaseLink = "${FirebaseProjectLink}";
        const apiKey = "${FirebaseApiKey}";
        const authDomain = "${FirebaseAuthDomain}";
        
        try {
            await loadScript('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore-compat.js');
            
            const projectId = firebaseLink.split('.')[0].split('//')[1];
            const firebaseConfig = {
                apiKey: apiKey,
                authDomain: authDomain,
                databaseURL: firebaseLink,
                projectId: projectId,
                storageBucket: \`\${projectId}.appspot.com\`
            };

            app = window.firebase.initializeApp(firebaseConfig);
            db = app.firestore();
            console.log("Firebase connected successfully!");
        } catch (error) {
            console.error('Failed to connect to Firebase:', error);
        }
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    document.addEventListener('DOMContentLoaded', initializeFirebase);

    function startQuiz() {
        userName = document.getElementById('userName').value;
        if (userName.trim() === '') {
            alert('Please enter your name to start the quiz');
            return;
        }
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('question-container').style.display = 'flex';
        
        if (quizStatus) {
            startTimer(quizTime);
        } else {
            startQuestionTimer(currentQuestionIndex);
            document.querySelectorAll(".prevBtn").forEach(btn => {
                btn.remove();
            });
        }
    }

    function convertTimeToSeconds(timeString) {
        if (!timeString || typeof timeString !== 'string') {
            return null;
        }
        const [hours, minutes] = timeString.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            return null;
        }
        return hours * 3600 + minutes * 60;
    }

    function startTimer(timeString) {
        const timeElement = document.getElementById("time");
        if (!timeElement) {
            console.error("Timer element not found");
            return;
        }

        const totalSeconds = convertTimeToSeconds(timeString);
        if (totalSeconds === null) {
            timeElement.textContent = "Invalid quiz time format";
            return;
        }

        let remainingTime = totalSeconds;
        updateTimerDisplay(remainingTime);

        timerInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                alert("Time's up! Submitting your answers.");
                calculateResults();
                document.getElementById("question-container").style.display = "none";
                document.getElementById("result-page").style.display = "";
            } else {
                updateTimerDisplay(remainingTime);
            }
        }, 1000);
    }

    function startQuestionTimer(questionIndex) {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        const timeElement = document.getElementById("time");
        if (!timeElement) {
            console.error("Timer element not found");
            return;
        }

        const questionTime = quizData[questionIndex]?.Time;
        const totalSeconds = convertTimeToSeconds(questionTime);
        
        if (totalSeconds === null) {
            timeElement.textContent = "Invalid time format for this question";
            return;
        }
        
        let remainingTime = totalSeconds;
        updateTimerDisplay(remainingTime);
        
        timerInterval = setInterval(() => {
            remainingTime--;
            
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                
                if (currentQuestionIndex < quizData.length - 1) {
                    currentQuestionIndex++;
                    updateQuestionDisplay();
                    startQuestionTimer(currentQuestionIndex);
                } else {
                    alert("Time's up! Submitting your answers.");
                    calculateResults();
                    document.getElementById("question-container").style.display = "none";
                    document.getElementById("result-page").style.display = "";
                }
            } else {
                updateTimerDisplay(remainingTime);
            }
        }, 1000);
    }

    function updateTimerDisplay(seconds) {
        const timeElement = document.getElementById("time");
        if (!timeElement) {
            console.error("Timer element not found");
            return;
        }

        if (typeof seconds !== 'number' || isNaN(seconds)) {
            timeElement.textContent = "Invalid time value";
            return;
        }

        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timeElement.textContent = \`\${mins.toString().padStart(2, "0")}:\${secs.toString().padStart(2, "0")}\`;
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
            checkbox.addEventListener("change", (event) => {
                const questionIndex = parseInt(event.target.dataset.index);
                const choiceIndex = parseInt(event.target.dataset.choiceIndex);

                if (!userAnswers[questionIndex]) {
                    userAnswers[questionIndex] = [];
                }

                if (event.target.checked) {
                    userAnswers[questionIndex].push(choiceIndex);
                } else {
                    const indexToRemove = userAnswers[questionIndex].indexOf(choiceIndex);
                    if (indexToRemove > -1) {
                        userAnswers[questionIndex].splice(indexToRemove, 1);
                    }
                }
            });
        });

        document.querySelectorAll(".nextBtn").forEach((btn) =>
            btn.addEventListener("click", () => {
                if (currentQuestionIndex < quizData.length - 1) {
                    currentQuestionIndex++;
                    document.getElementById("currentQ").textContent = (currentQuestionIndex + 1).toString();
                    updateQuestionDisplay();
                } else {
                    clearInterval(timerInterval);
                    calculateResults();
                    document.getElementById("question-container").style.display = "none";
                    document.getElementById("result-page").style.display = "";
                }
            })
        );

        document.querySelectorAll(".prevBtn").forEach((btn) =>
            btn.addEventListener("click", () => {
                if (currentQuestionIndex > 0) {
                    currentQuestionIndex--;
                    document.getElementById("currentQ").textContent = (currentQuestionIndex + 1).toString();
                    updateQuestionDisplay();
                }
            })
        );
    });

    function updateQuestionDisplay() {
        const questionWrappers = document.querySelectorAll(".question-wrapper");
        questionWrappers.forEach((wrapper, index) => {
            wrapper.style.display = index === currentQuestionIndex ? "block" : "none";
        });
        
        // Update question number display
        const currentQuestionNumber = document.getElementById("current-question-number");
        if (currentQuestionNumber) {
            currentQuestionNumber.textContent = (currentQuestionIndex + 1).toString();
        }
        
        if (!quizStatus) {
            startQuestionTimer(currentQuestionIndex);
        }
    }

    function calculateResults() {
        let score = 0;

        quizData.forEach((question, questionIndex) => {
            const selectedChoices = userAnswers[questionIndex] || [];
            const correctChoices = question.choices
                .map((choice, choiceIndex) => (choice.isCorrect ? choiceIndex : -1))
                .filter((index) => index !== -1);

            const isCorrect = selectedChoices.every((index) => correctChoices.includes(index)) &&
                            selectedChoices.length === correctChoices.length;

            if (isCorrect) {
                score++;
            }
        });

        // Display score
        const scoreDisplay = document.getElementById("scoreT");
        if (scoreDisplay) {
            const percentage = Math.round((score / quizData.length) * 100);
            scoreDisplay.textContent = \`Final Score: \${percentage}%  \${score}/\${quizData.length}\`;
        }
        sendDataToServer(score, quizData.length);
    }

    async function sendDataToServer(score, length) {
        const name = document.getElementById('userName').value;
        const id = "uid_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        const peruS = "${currentUser?.uid}";
        const percentage = Math.round((score / length) * 100);
        
        if (!db) {
            console.error('Firebase not initialized');
            return;
        }
        
        const docData = {
            id,
            name,
            percentage: percentage,
            score: Number(score) + "/" + length,
            userId :peruS,
            quizname:quizName,
            timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const docRef = db.collection('scores').doc(id);
            await docRef.set(docData, { merge: true });
            console.log('Score saved successfully');
        } catch (error) {
            console.error('Error saving score:', error);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await docRef.set(docData, { merge: true });
                console.log('Score saved successfully on retry');
            } catch (retryError) {
                console.error('Final error saving score:', retryError);
            }
        }
    }`;

    const obfuscationResult = JavaScriptObfuscator.obfuscate(originalScript, {
      compact: true,
      controlFlowFlattening: true,
      stringArrayEncoding: ['base64'],
    });

    return obfuscationResult.getObfuscatedCode();
  };


  // generate html
  const generateHtml = () => {
    const selectedTheme = localStorage.getItem("themeType") || "theme1";

    const obfuscatedScript = getObfuscatedScript();

    const theme1 = `
      <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${quizName}</title>
          <style>
                 .welcome-image {
                    width: 100%;
                    height: 400px;
                    object-fit: cover;
                    border-radius: 10px;
                    margin: 1rem 0;
                }

                  input[type="checkbox"]:checked + span {
                    border-color: #4D4AEA;
                    background-color: #E3E3FF;
                }

                
          </style>
          <script src="https://cdn.tailwindcss.com"></script>

        </head>
        <body>
           <!-- Welcome Screen -->
          <div id="welcome-screen" class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
              <div class="mx-auto w-full max-w-[800px] rounded-md border border-[#444444] bg-[#1e293b] px-[60px] py-[30px]">
                  <h1 class="text-3xl font-bold text-white mb-6 flex justify-center items-center ">${quizName}</h1>
                  ${imageQuiz === "" ? "" : `<img src="${imageQuiz}" alt="Welcome" class="welcome-image flex justify-center items-center ">`}
                  <div class="mb-6 ">
                      <label for="userName" class="block text-white mb-2">Enter your name to start:</label>
                      <input type="text" id="userName" class="w-full p-2 rounded border border-gray-300" required>
                  </div>
                  <div class="flex justify-center">
                    <button onclick="startQuiz()" class="bg-[#38bdf8] text-white px-6 py-2 rounded hover:bg-[#1d4ed8] ">
                        Start Quiz
                    </button>
                  </div>
              </div>
          </div>

          <!-- Question Container (initially hidden) -->

          <div  id="question-container" class="question-container flex flex-col items-center justify-center min-h-screen bg-gray-50" style="display: none;">
            <div class="mx-auto mt-[100px] min-h-[550px] w-full max-w-[800px] rounded-md border border-[#444444] bg-[#1e293b] px-[60px] py-[30px]">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-4xl font-medium text-[#38bdf8]" id="currentQ">1</span>
                    <span class="text-[22px] font-medium text-[#817a8e]">/  ${quizData.length}</span>
                  </div>
                  <div class="flex w-[100px] items-center gap-2">
                    <span class="quiz-header mt-1 block text-2xl font-medium text-[#38bdf8]" id="time" ></span>
                  </div>
                </div>

            ${quizData
              .map(
                  (q, index) => `
            <div class="question-wrapper" data-index="${index}" style="display: ${index === 0 ? 'block' : 'none'};">

              <h3  class="question-title my-4 text-2xl font-medium text-white">${q.questionText}</h3>
              ${
                q.imageQuestion === "" 
                    ? "" 
                    : `
                        <img src=${q.imageQuestion} alt="image Question"  class="my-4 w-full h-60 rounded-md"/>
                      `          
                  }
                  ${q.choices.map((choice, choiceIndex) => `
                     <label class="block w-full my-2 p-3 rounded-md cursor-pointer border transition duration-300 bg-[#1e293b] text-white  border-gray-600" onclick="this.classList.toggle('bg-[#38bdf8]')">
                      <input
                          type="checkbox"
                          name="answer"
                          class="hidden"
                          data-index="${index}" 
                          data-choice-index="${choiceIndex}"
                          onclick="event.stopPropagation()"
                      />
                      ${choice.text}
                  </label>`
                  ).join('')}
              <div class="button-container flex justify-between mt-12">
                <button
                  class="prevBtn min-w-[150px] transform cursor-pointer rounded-lg border border-[#38bdf8] bg-[#1e293b] px-5 py-1.5 text-lg font-semibold text-[#38bdf8] outline-none transition duration-300 ease-in-out hover:scale-105 hover:bg-[#1d4ed8] active:scale-95 active:bg-[#1e40af] disabled:cursor-not-allowed disabled:border-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:hover:scale-100"
                   style="${index === 0 ? 'visibility: hidden;' : ''}"
                >
                  Previous
                </button>
                <button
                  class="nextBtn min-w-[150px] transform cursor-pointer rounded-lg border border-[#38bdf8] bg-[#38bdf8] px-5 py-1.5 text-lg font-semibold text-white outline-none transition duration-300 ease-in-out hover:scale-105 hover:bg-[#1d4ed8] active:scale-95 active:bg-[#1e40af] disabled:cursor-not-allowed disabled:border-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:hover:scale-100 ml-auto"
                >
                  ${index === quizData.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div></div>
                    `
                    )
                    .join('')}
            </div>
          </div>




              <div id="result-page" style="display: none;" class="mx-auto mt-[100px] max-w-lg shadow-2xl rounded-md border border-[#444444] bg-[#1e293b] px-[60px] py-[30px]">
                      <h2 class="text-3xl font-bold text-center text-[#38bdf8] mb-6">
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
                      <p class="text-lg text-center text-white" id="scoreT">
                         
                      </p>
                      <button
                        onclick="window.location.reload()"
                        class="mt-8 mx-auto block px-6 py-2 bg-[#38bdf8] text-white text-lg font-semibold rounded-lg hover:bg-[#1d4ed8] transition duration-200"
                      >
                        Restart Quiz
                      </button>
                    </div>

          <script>
              

                ${obfuscatedScript}
            </script>
        </body>
        </html>
    `
    
    const theme2 = `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${quizName}</title>
        <script src="https://cdn.tailwindcss.com"></script>

        <style>
          .welcome-image {
                width: 100%;
                height: 400px;
                object-fit: cover;
                border-radius: 10px;
                margin: 1rem 0;
            }

              input[type="checkbox"]:checked + span {
                border-color: #4D4AEA;
                background-color: #E3E3FF;
            }

            
          </style>
      </head>
      <body>
            <!-- Welcome Screen -->
            <div id="welcome-screen" class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-l from-green-400 via-teal-500 to-blue-500">
              <div class="mx-auto w-full max-w-[800px] rounded-md  bg-white px-[60px] py-[30px]">
                  <h1 class="text-3xl font-bold  mb-6 flex justify-center items-center ">${quizName}</h1>
                  ${imageQuiz === "" ? "" : `<img src="${imageQuiz}" alt="Welcome" class="welcome-image flex justify-center items-center ">`}
                  <div class="mb-6 ">
                      <label for="userName" class="block mb-2">Enter your name to start:</label>
                        <input type="text" id="userName" class="w-full p-2 rounded border border-gray-300" required>
                    </div>
                    <div class="flex justify-center">
                      <button onclick="startQuiz()" class="bg-[#38bdf8] text-white px-6 py-2 rounded hover:bg-[#1d4ed8] ">
                          Start Quiz
                      </button>
                    </div>
                </div>
            </div>




        <div id="question-container" class="question-container flex flex-col items-center justify-center min-h-screen bg-gradient-to-l from-green-400 via-teal-500 to-blue-500 py-10" style="display: none;">
          <div class="bg-white shadow-lg rounded-2xl p-8 w-full  text-center min-h-[550px] max-w-[800px] animate-enterFromTop">
            <div class="flex justify-between items-center mb-8">
              <div>
                <span class="text-2xl font-semibold text-[#2d3748]" id="currentQ">
                    1
                </span>
                <span class="text-lg text-[#718096]">/ ${quizData.length}</span>
              </div>
              <div class="flex items-center">
                
                <span class="ml-2 text-xl font-semibold text-[#38bdf8]" id="time">
                </span>
              </div>
            </div>



            ${quizData
              .map(
                  (q, index) => `
            <div class="question-wrapper" data-index="${index}" style="display: ${index === 0 ? 'block' : 'none'};">
            <h2  class="question-title text-2xl font-medium text-[#2d3748] mb-6">${q.questionText}</h2>
          
              ${
                q.imageQuestion === "" 
                    ? "" 
                  : `
                      <img src=${q.imageQuestion} alt="image Question"  class="my-4 w-full h-60 rounded-md"/>
                    `          
                }

                ${q.choices.map((choice, choiceIndex) => `

                <label
                  class="block py-3 px-6 rounded-lg cursor-pointer transition-all duration-300 ease-in-out mt-2" onclick="this.classList.toggle('bg-[#38bdf8]');this.classList.toggle('text-white');" >
                  <input
                    type="checkbox"
                    name="answer"
                    class="hidden"
                    data-index="${index}" 
                    data-choice-index="${choiceIndex}"
                    onclick="event.stopPropagation()"
                  />
                  ${choice.text}
                </label>`
                ).join('')}
              

              <div class="flex justify-between mt-8">

                  <button
                    class="prevBtn px-6 py-3 text-lg font-semibold text-[#38bdf8] border border-[#38bdf8] rounded-lg hover:bg-[#f1f5f9] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style="${index === 0 ? 'visibility: hidden;' : ''}"              >
                    Previous
                  </button>

                  <button
                    class="nextBtn px-6 py-3 text-lg font-semibold text-white bg-[#38bdf8] rounded-lg hover:bg-[#1d4ed8] transition duration-300"
                  >
                  ${index === quizData.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
              </div>
              `).join('')}
              </div></div>


              <div id="result-page" style="display: none;"  class="flex flex-col  items-center justify-center min-h-screen bg-gradient-to-l from-green-400 via-teal-500 to-blue-500 text-white py-10">
                  <div class="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-lg text-center">
                    <h1 class="text-4xl font-bold text-[#2d3748] mb-4">Quiz Completed!</h1>
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
                    <p class="text-lg text-gray-600 mb-6" id="scoreT">

                    </p>
                    <button
                      onclick="window.location.reload()"
                      class="mt-8 px-6 py-3 bg-[#38bdf8] text-white font-semibold text-lg rounded-lg hover:bg-[#1d4ed8] transition duration-300"
                    >
                      Restart Quiz
                    </button>
                  </div>
              </div>

          <script>
                    
            ${obfuscatedScript}
          </script>
      </body>
      </html>
    `

    const theme3 = ` <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${quizName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .welcome-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 10px;
          margin: 1rem 0;
      }

        input[type="checkbox"]:checked + span {
          border-color: #4D4AEA;
          background-color: #E3E3FF;
      }

    </style>
</head>
<body>

      <div id="welcome-screen" class="flex flex-col items-center justify-center min-h-screen bg-gray-50 shadow-lg">
        <div class="mx-auto w-full max-w-[800px] rounded-md  bg-white px-[60px] py-[30px]">
            <h1 class="text-3xl font-bold  mb-6 flex justify-center items-center ">${quizName}</h1>
            ${imageQuiz === "" ? "" : `<img src="${imageQuiz}" alt="Welcome" class="welcome-image flex justify-center items-center ">`}
            <div class="mb-6 ">
                <label for="userName" class="block mb-2">Enter your name to start:</label>
                  <input type="text" id="userName" class="w-full p-2 rounded border border-gray-300" required>
              </div>
              <div class="flex justify-center">
                <button onclick="startQuiz()" class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-[#1d4ed8] ">
                    Start Quiz
                </button>
              </div>
          </div>
      </div>



    <div id="question-container" style="display: none;" class="question-container flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div class="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <div class="flex justify-between items-center mb-6">
          <div>
            <span class="text-2xl font-semibold text-indigo-600" id="currentQ">
            1
            </span>
            <span class="text-lg text-gray-500">/${quizData.length}</span>
          </div>
          <div class="flex items-center">
      
            <span class="ml-2 text-xl font-semibold text-gray-700" id="time">
            </span>
          </div>
        </div>


        ${quizData
          .map(
              (q, index) => `
        <div class="question-wrapper" data-index="${index}" style="display: ${index === 0 ? 'block' : 'none'};">

            <h2 class="text-xl font-semibold text-gray-800 mb-6">${q.questionText}</h2>

            ${
              q.imageQuestion === "" 
                  ? "" 
                : `
                    <img src=${q.imageQuestion} alt="image Question"  class="my-4 w-full h-60 rounded-md"/>
                  `          
              }

              ${q.choices.map((choice, choiceIndex) => `
                <label class="block px-4 py-3 rounded-lg cursor-pointer border transition duration-300 mt-3 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200" onclick="this.classList.toggle('bg-indigo-500');this.classList.toggle('text-white');this.classList.toggle('border-indigo-500');this.classList.toggle('hover:bg-indigo-500');" >
                  <input
                    type="checkbox"
                    class="hidden"
                    name="answer"
                    data-index="${index}" 
                    data-choice-index="${choiceIndex}"
                    onclick="event.stopPropagation()"
                  />
                  ${choice.text}
                </label>
                `).join('')}

            <div class="flex justify-between mt-8">
              <button
                class="prevBtn px-6 py-2 text-lg font-semibold text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style="${index === 0 ? 'visibility: hidden;' : ''}"  
                >
                Previous
              </button>

              <button
                class="nextBtn px-6 py-2 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300"
              >
              ${index === quizData.length - 1 ? 'Finish' : 'Next'}
            </button>
        </div>
      </div>
      `).join('')}
    </div>
  </div>

  
  <div id="result-page" style="display: none;" class="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-white">
    <div class="bg-white p-8 rounded-xl shadow-md max-w-lg w-full">
      <h1 class="text-3xl font-bold text-center text-indigo-600 mb-4">
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
      <p class="text-lg text-center text-gray-700"  id="scoreT">
      </p>
      <button
      onclick="window.location.reload()"
      class="mt-6 w-full px-4 py-2 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300"
      >
        Restart Quiz
      </button>
    </div>
    </div>
    

  <script>
                    
    ${obfuscatedScript}
  </script>

</body>
</html>
`;

    
    const blob = new Blob([selectedTheme === "theme1" && theme1 || selectedTheme === "theme2" && theme2 || theme3], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${quizName}.html`;
    link.click();
  }



  return (
    <button onClick={()=>generateHtml()} className="flex items-center w-full gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ">
        <svg className="shrink-0 size-4 h-6 text-gray-800 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="m3 2 1.578 17.824L12 22l7.467-2.175L21 2H3Zm14.049 6.048H9.075l.172 2.016h7.697l-.626 6.565-4.246 1.381-4.281-1.455-.288-2.932h2.024l.16 1.411 2.4.815 2.346-.763.297-3.005H7.416l-.562-6.05h10.412l-.217 2.017Z"/>
        </svg>
        Html Page
    </button>
  );
}

export default Htmlpage;
