import React, { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/images/logoD.png";
import { collection, deleteDoc, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import toast, { Toaster } from 'react-hot-toast';

import {
  Plus,
  LogOut,
  FileCheck2,
  CalendarDays,
  MessageCircleQuestion,
  Sparkles,
  Pencil,
  Download,
  FileQuestion,
  Play,
  Copy,
  Trash2,
  X,
  User,
  ChevronDown,
} from "lucide-react";
import Scores from "../components/scores";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [quizName,setquizName] = useState('');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizData, setQuizData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = React.useState('quizzes');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // charge data from bd
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "quizzes"),
      (querySnapshot) => {
        try {

          const quizzesData = querySnapshot.docs
            .map((doc) => {
              const quiz = { id: doc.id, ...doc.data() };
              return quiz;
            })
            .filter((quiz) => quiz.userId === currentUser?.uid);

          setQuizData(quizzesData);
          setIsLoading(false);

        } catch (error) {
          console.error("Error processing quizzes data:", error);
        }

      },
      (error) => {
        console.error("Error fetching quizzes:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);



  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // Redirect if no user is logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);



  const defaultQuizTemplate = {
    userId:currentUser.uid,
    quizTitle: quizName,
    quizTime: true,
    Time: "01:00",
    imageQuiz: "",
    randomQuestions: false,
    createdAt: new Date(),
    questions: [
      {
        id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        questionText: "",
        imageQuestion: "",
        randomResponse: false,
        questionTime: false,
        Time: "00:01",
        choices: [
          { id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`, text: "", isCorrect: true },
          { id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`, text: "", isCorrect: false },
        ],
      },
    ],
  };

  const handleCreateQuiz = async (event) => {
    event.preventDefault();
    try {
      const newQuizRef = doc(db, "quizzes", Date.now().toString());
      await setDoc(newQuizRef, defaultQuizTemplate);

      navigate(`/start/${newQuizRef.id}`);
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  // date format
  const formatDateTime = (timestamp) => {
    if (!timestamp) return null;

    // Convert Firestore Timestamp to a JavaScript Date object
    const date = timestamp.toDate();

    return date.toLocaleDateString('en-GB');
  };

  // duplicate quiz
  const duplicateQuiz = async (quizId) => {
    try {
      const quizRef = doc(db, "quizzes", quizId); // Reference to the quiz
      const quizSnap = await getDoc(quizRef); // Fetch the quiz document

      if (quizSnap.exists()) {
        const quizData = quizSnap.data(); // Get the data of the quiz

        // Clone the quiz data and generate a new unique ID
        const duplicatedQuiz = {
          ...quizData,
          id: `quiz_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // New ID for the duplicated quiz
          createdAt: new Date(), // Set new createdAt timestamp
        };

        // Add the duplicated quiz to the "quizzes" collection with the new ID
        await setDoc(doc(db, "quizzes", duplicatedQuiz.id), duplicatedQuiz);
        toast.success('Quiz duplicated successfully', { position: 'bottom-right' });

      } else {
        console.log("Quiz not found!");
      }
    } catch (error) {
      console.error("Error duplicating quiz: ", error);
    }
  };

  // delete quiz
  const deleteQuiz = async (quizId) => {
    const quizDocRef = doc(db, "quizzes", quizId); // Reference to the quiz document

    try {
      // Get the current quiz data
      const quizDoc = await getDoc(quizDocRef);

      if (quizDoc.exists()) {
        // Delete the quiz document
        await deleteDoc(quizDocRef);
        toast.success('Quiz removed successfully', { position: 'bottom-right' });
      } else {
        toast.error('Quiz not found', { position: 'bottom-right' });
      }
    } catch (error) {
      console.error("Error removing quiz:", error);
      toast.error('Error removing quiz', { position: 'bottom-right' });
    }
  };

  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const total = quizData.reduce((sum, quiz) => {
      if (quiz.userId === currentUser?.uid) {
        return sum + (quiz.questions ? quiz.questions.length : 0);
      }
      return sum;
    }, 0);
    setTotalQuestions(total);
  }, [quizData, currentUser?.uid]);



  const [recentQuizCount, setRecentQuizCount] = useState(0);


  useEffect(() => {
    const userQuizzes = quizData.filter(quiz => quiz.userId === currentUser?.uid);

    if (userQuizzes.length === 0) {
      setRecentQuizCount(0);
      return;
    }

    const getQuizDate = (createdAt) => {
      if (createdAt instanceof Object && createdAt.toDate) {
        return createdAt.toDate();
      } else if (typeof createdAt === "string") {
        return new Date(createdAt);
      } else {
        console.error("Unexpected date format:", createdAt);
        return null;
      }
    };

    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const quizzesCreatedToday = userQuizzes.filter(quiz => {
      const quizDate = getQuizDate(quiz.createdAt);
      return quizDate && quizDate >= todayStart && quizDate <= todayEnd;
    });

    setRecentQuizCount(quizzesCreatedToday.length);
  }, [quizData, currentUser?.uid]);

  const handlePlay = (e) => {
    window.open('/preview/'+e, '_blank');

  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      />
      <div className="min-h-screen bg-slate-50 font-['Inter']">
        { isLoading &&
        <div className="spinner-wrapper bg-black/20  backdrop-blur-md ">
          <span className="loader"></span>
        </div>
        }
        <Toaster />

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 w-full px-4 sm:px-6 lg:px-10 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <img src={Logo} alt="Qgen logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Q<span className="text-[#4F46E5]">gen</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleModal}
              className="flex items-center gap-2 rounded-full bg-[#4F46E5] hover:bg-indigo-700 active:scale-[0.98] motion-safe:transition-all text-white px-5 py-2.5 text-sm font-semibold shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quiz</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-label="Account menu"
                aria-expanded={isMenuOpen}
                className="flex items-center gap-1 cursor-pointer"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 text-[#4F46E5]">
                  <User className="w-4 h-4" />
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isMenuOpen && (
                <>
                  <button
                    aria-label="Close menu"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-20 py-1.5">
                    <p className="px-3.5 py-2 text-xs text-slate-500 truncate border-b border-slate-100">
                      {currentUser?.email}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 motion-safe:transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* modal quiz name */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4"
            role="dialog"
            aria-labelledby="hs-focus-management-modal-label"
            tabIndex="-1"
          >
            <div className="w-full sm:max-w-lg bg-white rounded-2xl shadow-xl">
              <div className="flex flex-col pointer-events-auto">
                <div className="flex justify-between items-center py-4 px-6 border-b border-slate-200">
                  <h3
                    id="hs-focus-management-modal-label"
                    className="font-bold text-lg text-slate-900"
                  >
                    Create a Quiz
                  </h3>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
                    aria-label="Close"
                    onClick={toggleModal}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateQuiz}>
                  <div className="p-6 space-y-4">
                    <input
                      type="text"
                      className="w-full py-2.5 px-4 border border-slate-300 rounded-lg text-sm outline-none motion-safe:transition-colors focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                      placeholder="Enter quiz name"
                      autoFocus
                      onChange={(e) => setquizName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex justify-end items-center gap-x-3 py-4 px-6 border-t border-slate-200">
                    <button
                      type="button"
                      className="py-2 px-4 text-sm font-medium text-slate-600 rounded-lg border border-slate-300 hover:bg-slate-50 focus:outline-none cursor-pointer"
                      onClick={toggleModal}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 text-sm font-semibold text-white rounded-lg bg-[#4F46E5] hover:bg-indigo-700 motion-safe:transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] cursor-pointer"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* main */}
        <div className="pb-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
          {/* total quizzes and recent quizzes and questions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 animate-enter-left">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl">
              <div className="pointer-events-none absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/40 blur-2xl" />
              <div className="pointer-events-none absolute right-8 bottom-0 w-16 h-16 rounded-full bg-[#4F46E5]/10 blur-xl" />
              <div className="relative flex items-center p-6">
                <div className="bg-white p-3 rounded-xl mr-4 shadow-sm">
                  <FileCheck2 className="w-6 h-6 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Quizzes</p>
                  <p className="text-3xl font-extrabold text-slate-900">{quizData.length}</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl">
              <div className="pointer-events-none absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/40 blur-2xl" />
              <div className="pointer-events-none absolute right-8 bottom-0 w-16 h-16 rounded-full bg-[#4F46E5]/10 blur-xl" />
              <div className="relative flex items-center p-6">
                <div className="bg-white p-3 rounded-xl mr-4 shadow-sm">
                  <CalendarDays className="w-6 h-6 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Recent Created</p>
                  <p className="text-3xl font-extrabold text-slate-900">{recentQuizCount}</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl">
              <div className="pointer-events-none absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/40 blur-2xl" />
              <div className="pointer-events-none absolute right-8 bottom-0 w-16 h-16 rounded-full bg-[#4F46E5]/10 blur-xl" />
              <div className="relative flex items-center p-6">
                <div className="bg-white p-3 rounded-xl mr-4 shadow-sm">
                  <MessageCircleQuestion className="w-6 h-6 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Questions</p>
                  <p className="text-3xl font-extrabold text-slate-900">{totalQuestions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="border border-slate-200 rounded-2xl bg-white mb-8 animate-enter-left">
            <div className="flex flex-col lg:flex-row lg:divide-x divide-slate-200">
              <div className="flex items-start gap-3 p-5 lg:w-64 shrink-0">
                <Sparkles className="w-5 h-5 text-[#4F46E5] mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900">Quick Tips</h3>
                  <p className="text-sm text-slate-500">Create quizzes in 3 simple steps</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                <div className="flex items-start gap-3 p-5">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 shrink-0">
                    <Plus className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">1. Create</p>
                    <p className="text-sm text-slate-500">Add details and generate questions</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 shrink-0">
                    <Pencil className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">2. Edit</p>
                    <p className="text-sm text-slate-500">Review and customize your quiz</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 shrink-0">
                    <Download className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">3. Download</p>
                    <p className="text-sm text-slate-500">Save or share your quiz</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Your Quizzes */}
          <div className="flex items-center gap-6 mb-5 animate-enter-left">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`text-xl font-bold motion-safe:transition-colors cursor-pointer ${
                activeTab === 'quizzes' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Your Quizzes
            </button>

            <button
              onClick={() => setActiveTab('scores')}
              className={`text-xl font-bold motion-safe:transition-colors cursor-pointer ${
                activeTab === 'scores' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Scores
            </button>
          </div>

          {/* recent quiz */}
          { activeTab === 'quizzes' && (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-enter-left">
              {quizData.length > 0 ? (
                quizData.map((obj, index) => {

                    return (
                      <div key={obj.id || index} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
                        {obj.imageQuiz === "" ? (
                          <div className="relative w-full h-32 mb-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
                            <FileQuestion className="w-10 h-10 text-[#4F46E5]/40" />
                          </div>
                        ) : (
                          <img
                            src={obj.imageQuiz}
                            className="w-full h-32 mb-4 rounded-xl object-cover"
                            alt={obj.quizTitle || "Quiz"}
                          />
                        )}

                        <p className="font-bold text-slate-900 truncate">{obj.quizTitle}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {obj.questions.length} questions&nbsp;|&nbsp;{obj.Time}&nbsp;|&nbsp;{formatDateTime(obj.createdAt)}
                        </p>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          {/* play button */}
                          <button
                            onClick={() => handlePlay(obj.id)}
                            aria-label="Play quiz"
                            className="flex items-center justify-center w-9 h-9 rounded-full border border-[#4F46E5]/30 text-[#4F46E5] hover:bg-indigo-50 active:scale-[0.98] motion-safe:transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" fill="currentColor" />
                          </button>

                          {/* edit button */}
                          <Link
                            to={"start/" + obj.id}
                            aria-label="Edit quiz"
                            className="flex items-center justify-center w-9 h-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 motion-safe:transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>

                          {/* duplicate button */}
                          <button
                            onClick={() => duplicateQuiz(obj.id)}
                            aria-label="Duplicate quiz"
                            className="flex items-center justify-center w-9 h-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 motion-safe:transition-colors cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* delete button */}
                          <button
                            onClick={() => deleteQuiz(obj.id)}
                            aria-label="Delete quiz"
                            className="flex items-center justify-center w-9 h-9 rounded-full text-red-500 hover:bg-red-50 motion-safe:transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );

                })
              ) : (
                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 flex items-center justify-center text-center p-10 md:p-16 border border-slate-200 rounded-2xl bg-white">
                <div className="flex flex-col items-center justify-center">
                  <FileQuestion className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-lg font-bold text-slate-900 w-full">No Quiz Added yet</p>
                  <button className="px-4 py-2 text-sm font-semibold text-[#4F46E5] mt-3 cursor-pointer" onClick={toggleModal}>Create Now</button>
                </div>
              </div>


              )}

          </div>
            )
          }

          {
            activeTab === 'scores' && (
              <Scores />
            )
          }
        </div>
      </div>
    </>
  );
};

export default Dashboard;
