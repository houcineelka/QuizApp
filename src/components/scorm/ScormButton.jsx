import React, { useEffect, useState } from 'react';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import checkmarkImg from "../../assets/images/checkmark.png";
import JavaScriptObfuscator from 'javascript-obfuscator';
import { useAuth } from '../../auth/contexts/AuthContext';


const ScormButton = ({quizId,FirebaseProjectLink,FirebaseApiKey,FirebaseAuthDomain,imageQuiz}) => {
  const zip = new JSZip();

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
            // Load Firebase scripts dynamically
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

            // Initialize Firebase using the global firebase object
            app = window.firebase.initializeApp(firebaseConfig);
            db = app.firestore();

            
            console.log("Firebase connected successfully!");
        } catch (error) {
            console.error('Failed to connect to Firebase:', error);
        }
    }

    // Helper function to load external scripts
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Initialize Firebase when the document is loaded
    document.addEventListener('DOMContentLoaded', initializeFirebase);

    function startQuiz() {
        userName = document.getElementById('userName').value;
        if (userName.trim() === '') {
            alert('Please enter your name to start the quiz');
            return;
        }
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('question-container').style.display = 'block';
        
        // Start the appropriate timer based on quiz status
        if (quizStatus) {
            startTimer(quizTime);
        } else {
            startQuestionTimer(currentQuestionIndex);
            document.querySelectorAll(".prevBtn").forEach(btn => {
                btn.remove();
            });
        }
    }

    // Helper function to convert HH:MM to seconds
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
        const totalSeconds = convertTimeToSeconds(timeString);
        if (totalSeconds === null) {
            document.getElementById("time").textContent = "Invalid quiz time format";
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
                document.querySelector(".question-container").style.display = "none";
                document.getElementById("result-page").style.display = "flex";
            } else {
                updateTimerDisplay(remainingTime);
            }
        }, 1000);
    }

    function startQuestionTimer(questionIndex) {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        const questionTime = quizData[questionIndex]?.Time;
        const totalSeconds = convertTimeToSeconds(questionTime);
        
        if (totalSeconds === null) {
            document.getElementById("time").textContent = "Invalid time format for this question";
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
                    document.querySelector(".question-container").style.display = "none";
                    document.getElementById("result-page").style.display = "flex";
                }
            } else {
                updateTimerDisplay(remainingTime);
            }
        }, 1000);
    }

    function updateTimerDisplay(seconds) {
        if (typeof seconds !== 'number' || isNaN(seconds)) {
            document.getElementById("time").textContent = "Invalid time value";
            return;
        }

        const timeElement = document.getElementById("time");
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timeElement.textContent = "Time Remaining: " + 
            mins.toString().padStart(2, "0") + ":" + 
            secs.toString().padStart(2, "0");
    }

    // Capture user selections
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

    function updateQuestionDisplay() {
        const questionWrappers = document.querySelectorAll(".question-wrapper");
        questionWrappers.forEach((wrapper, index) => {
            wrapper.style.display = index === currentQuestionIndex ? "block" : "none";
        });
        
        // Start timer for the new question if quiz is not active
        if (!quizStatus) {
            startQuestionTimer(currentQuestionIndex);
        }
    }

    document.querySelectorAll(".nextBtn").forEach((btn, index) =>
        btn.addEventListener("click", () => {
            if (currentQuestionIndex < quizData.length - 1) {
                currentQuestionIndex++;
                updateQuestionDisplay();
            } else {
                clearInterval(timerInterval);
                calculateResults();
                document.querySelector(".question-container").style.display = "none";
                document.getElementById("result-page").style.display = "flex";
            }
        })
    );

    document.querySelectorAll(".prevBtn").forEach((btn) =>
        btn.addEventListener("click", () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                updateQuestionDisplay();
            }
        })
    );

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


      sendDataToServer(score,quizData.length);
    }

     async function sendDataToServer(score,lenght) {
        const name = document.getElementById('userName').value;
        const id = "uid_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        const peruS = "${currentUser?.uid}";

        const percentage = Math.round((score) / (lenght) * 100);


        if (!db) {
            console.error('Firebase not initialized');
            return;
        }
        
        const docData = { 
            id,
            name, 
            score: Number(score) +"/"+ lenght,
            percentage: percentage,
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
            // Retry once on failure
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await docRef.set(docData, { merge: true });
                console.log('Score saved successfully on retry');
            } catch (retryError) {
                console.error('Final error saving score:', retryError);
            }
        }
    }
`;


    const obfuscationResult = JavaScriptObfuscator.obfuscate(originalScript, {
      compact: true,
      controlFlowFlattening: true,
      stringArrayEncoding: ['base64'],
    });

    return obfuscationResult.getObfuscatedCode();
};

  
  const generateScorm = () => {
    const obfuscatedScript = getObfuscatedScript();

    const manifestContent = `
          <manifest identifier="quiz_course" version="1.0"
                    xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
                    xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <metadata>
              <schema>ADL SCORM</schema>
              <schemaversion>1.2</schemaversion>
            </metadata>
            <organizations default="org1">
              <organization identifier="org1">
                <title>Quiz App</title>
                <item identifier="quiz1" identifierref="res1">
                  <title>Quiz Questions</title>
                </item>
              </organization>
            </organizations>
            <resources>
              <resource identifier="res1" type="webcontent" href="index.html">
                <file href="index.html" />
                <file href="scormdriver.js" />
              </resource>
            </resources>
          </manifest>
    `;
    zip.file('imsmanifest.xml', manifestContent);
      

    const htmlContent = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quiz</title>
            <script src="scormdriver.js"></script>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
                body {
                    font-family: 'Roboto', sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                }
                h1, h2, h3 {
                    margin: 0;
                    padding: 0;
                }
                .container {
                    padding: 20px;
                }
                .quiz-header {
                    text-align: center;
                    color: #333;
                }
                .quiz-time {
                    text-align: center;
                    color: #555;
                }
                .question-container {
                    width: 80%;
                    margin: 20px auto;
                    display: none;
                }
                .welcome-screen {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100%;
                    max-width: 500px;
                    text-align: center;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    border: 2px solid #e1e1e1;
                    border-radius: 12px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .welcome-screen input {
                    padding: 10px;
                    width: 300px;
                    border: 1px solid #555;
                    border-radius: 8px;
                    font-size: 16px;
                    text-align: center;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                }
                .welcome-screen .button-container {
                    justify-content: center;
                    margin-top: 0;
                }
                .question-title {
                    color: #555;
                }
                ul {
                    list-style: none;
                    padding: 0;
                    margin-top: 20px;
                }
                li {
                    margin-bottom: 10px;
                }
                label {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    width: 100%;
                }
                input[type="checkbox"] {
                    appearance: none;
                    margin-right: 10px;
                    width: 20px;
                    height: 20px;
                }
                input[type="checkbox"]:checked + span {
                    border-color: #4D4AEA;
                    background-color: #E3E3FF;
                }
                span {
                    display: inline-block;
                    width: 100%;
                    padding: 10px 15px;
                    border: 1px solid #555;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    color: #333;
                    transition: background-color 0.3s, border-color 0.3s;
                }
                .button-container {
                    gap: 10px;
                    display: flex;
                    justify-content: end;
                    margin-top: 20px;
                }
                button {
                    appearance: button;
                    background-color: #4D4AEA;
                    border: 1px solid #4D4AEA;
                    border-radius: 1rem;
                    box-sizing: border-box;
                    color: #FFF;
                    cursor: pointer;
                    padding: 0.5rem 2rem;
                    transition: background-color 0.15s, border-color 0.15s;
                }
                button:disabled {
                    background-color: #999;
                    border-color: #999;
                    cursor: not-allowed;
                }
                #result-page {
                    display: none;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    font-family: Arial, sans-serif;
                }
                #result-page.show {
                    display: flex;
                }
                .icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .checkmark {
                    font-size: 40px;
                    color: white;
                }
                .title {
                    margin: 20px 0 10px;
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                }
                .message {
                    margin: 0;
                    font-size: 16px;
                    color: #555;
                    text-align: center;
                }

                 .welcome-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 10px;
                    margin: 1rem 0;
                }
            </style>
        </head>
        <body>
          <div class="welcome-screen" id="welcome-screen">
              <h1 class="quiz-header"><b>${quizName}</b></h1>
              ${imageQuiz === "" ? "" : `<img src="${imageQuiz}" alt="Welcome" class="welcome-image">`}
              <h2>Welcome to the Quiz!</h2>
              <input type="text" id="userName" placeholder="Enter your name" required>
              <div class="button-container">
                  <button onclick="startQuiz()">Start Quiz</button>
              </div>
          </div>

            <div class="question-container" id="question-container">
                <h1 class="quiz-header"><b>${quizName}</b></h1>
                <p class="quiz-header" id="time"></p>

                ${quizData
                    .map(
                        (q, index) => `
                        <div class="question-wrapper" data-index="${index}" style="display: ${index === 0 ? 'block' : 'none'};">
                            <h2 class="question-title"><b>Question ${index + 1}: ${q.questionText}</b></h2>     
                            ${
                                q.imageQuestion === "" 
                                    ? "" 
                                    : `<div style="display:flex;align-items:center;justify-content:center;"><img 
                                            src=${q.imageQuestion} 
                                            alt="image Question" 
                                            style="width: 20rem;"
                                        /></div>`
                            }
                            <ul>
                                ${q.choices
                                    .map(
                                        (choice, choiceIndex) => `
                                        <li>
                                            <label>
                                                <input type="checkbox" data-index="${index}" data-choice-index="${choiceIndex}">
                                                <span>${choice.text}</span>
                                            </label>
                                        </li>`
                                    ).join('')}
                            </ul>

                            <div class="button-container">
                                <button class="prevBtn" style="${index === 0 ? 'visibility: hidden;' : ''}">Previous</button>
                                <button class="nextBtn">${index === quizData.length - 1 ? 'Finish' : 'Next'}</button>
                            </div>
                        </div>
                        `
                    )
                    .join('')}
            </div>

            <div id="result-page">
                <div class="icon">
                    <img src=${checkmarkImg} alt="checkmark" style="width: 7rem;">
                </div>
                <h1 class="title">Quiz Completed!</h1>
                <p class="message">Thank you for participating in the quiz</p>
            </div>

            <script>
              

                ${obfuscatedScript}
            </script>
        </body>
        </html>`;
        
    zip.file('index.html', htmlContent);
      
    const scormDriverContent = `
      // Minimal SCORM driver for tracking
      const API = window.parent.API || window.API;
      if (API) {
        API.LMSInitialize("");
        API.LMSSetValue("cmi.core.lesson_status", "not attempted");
        API.LMSCommit("");
      }
    `;
    zip.file('scormdriver.js', scormDriverContent);
  
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'quiz_scorm_package.zip');
    });
  };


  

  return (
      <button onClick={() => generateScorm()} className="flex items-center w-full gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 " >
          <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
                Scorm
      </button>
  );
}

export default ScormButton;

