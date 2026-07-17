import React, { useEffect, useState } from "react";
import {SortableItem} from "./sort"
import Logo from "../assets/images/logoD.png";
import imageQ from "../assets/images/noImage.jpg";
import imageQEmpty from "../assets/images/imageQEmpty.jpg";
import emptyQ from "../assets/images/EmptyQuestions.jpg";
import {  arrayUnion,  doc, getDoc, onSnapshot,  updateDoc } from "firebase/firestore";
import { db } from "../auth/firebase";
import html2pdf from 'html2pdf.js';

import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';



import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ResponsesSortableInputs from "./sortResponses";
import { Link, useNavigate, useParams } from "react-router-dom";
import ExcelQuestions from "./ExcelQuestions";
import QuestionsTake from "./QuestionsTake";
import AiGenerate from "./AiGenerate";
import ThemeStyle from "./ThemeStyle";
import ConnectFirebase from "./connectFirebase";
import ScormButton from "./scorm/ScormButton";
import { useAuth } from "../auth/contexts/AuthContext";
import ExpressData from "./DataFromExpress/ExpressData";
import {
  Settings,
  ListChecks,
  Sparkles,
  Palette,
  Database,
  Plus,
  Pencil,
  Check,
  Info,
  Download,
  ChevronDown,
  FileText,
  Play,
  Upload,
  Trash2,
  HelpCircle,
} from "lucide-react";
import Htmlpage from "./HtmlPage/Htmlpage";


const StartPage = () => {
  const [selected, setSelected] = useState('questions');
  const {quizN}= useParams();
  const [isLoading,setIsLoading]=useState(false);

  const navigate=useNavigate()


  const handleSidebarClick = (section) => {
    setSelected(section);
  };

  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapseQuestions = () => {
    setIsCollapsed(!isCollapsed);
  };

  const [selectedQuestionId, setSelectedQuestionId] = useState();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  // --------------------------------------------------------------------------------
  const [isEditing, setIsEditing] = useState(false);

  // ------------------------------------------------------------------------------------------------------------------------------

  // open model for export button
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // data state
  const [quizData, setQuizData] = useState(null);
  const [IsRandomResponsesChecked,setIsRandomResponsesChecked]=useState(); //state response random
  const [IsRandomQuestionsChecked,setIsRandomQuestionsChecked]=useState(); //state questions random
  const [IsTimeQuizChecked,setIsTimeQuizChecked]=useState(); //state time quiz
  const [IsQuestinTime,setIsQuestinTime]=useState(); //state time question
  const { currentUser } = useAuth();


  //  initalise data from bd
  useEffect(() => {
    const quizDocRef = doc(db, "quizzes", quizN);
    setIsLoading(true);
    const unsubscribe = onSnapshot(quizDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const quizData = docSnapshot.data();
        if(quizData.userId !== currentUser?.uid) return navigate("/");

        setQuizData(quizData);
        setInputTimeQuiz(quizData.Time);

        if (quizData.questions && quizData.questions.length > 0) {
          setIsRandomQuestionsChecked(quizData.randomQuestions);
          setIsTimeQuizChecked(quizData.quizTime);
          setIsRandomResponsesChecked(quizData.questions[0].randomResponse);
          setIsQuestinTime(quizData.questions[0].questionTime);

          // Set selectedQuestionId once quiz data is available
            if (!selectedQuestionId) {  // Only set it if it's not already set
              setSelectedQuestionId(quizData.questions[0].id);
            }
          } else {
          setSelectedQuestionId(null); // If no questions available
        }

        setIsLoading(false); // Set loading to false once data is fetched
      } else {
        navigate("/"); // Redirect if quiz does not exist
      }
    });

    return () => unsubscribe();
  }, [quizN, navigate, selectedQuestionId, currentUser?.uid]);

  useEffect(() => {
    if (quizData && selectedQuestionId && !isLoading) { // Ensure it's not loading
      const question = quizData.questions.find(q => q.id === selectedQuestionId);
      if (question) {
        setquizQuestion(question.questionText || "");
        setInputTimeQuestion(question.Time);
        setIsRandomResponsesChecked(question.randomResponse);
        setIsQuestinTime(question.questionTime);
      }
    }
  }, [quizData, selectedQuestionId, isLoading]);

  // drag and drop questions
  const handleDragEndQuestions = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const quizDocRef = doc(db, 'quizzes', quizN);
      const quizDoc = await getDoc(quizDocRef);

      if (quizDoc.exists()) {
        const quizData = quizDoc.data();

        const oldIndex = quizData.questions.findIndex((item) => item.id === active.id);
        const newIndex = quizData.questions.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const updatedQuestions = arrayMove(quizData.questions, oldIndex, newIndex);

        await updateDoc(quizDocRef, {
          questions: updatedQuestions,
        });
        setSelectedQuestionId(selectedQuestionId);

      } else {
        console.error('Quiz not found');
      }
    }
  };

  // add question on sidebar
  const addQuestionSide = async (quizId) => {
    try {
      const quizRef = doc(db, "quizzes", quizId);

      // Fetch the current quiz data
      const quizSnapshot = await getDoc(quizRef);

      if (quizSnapshot.exists()) {
        const quizData = quizSnapshot.data();

        const existingQuestions = quizData.questions || [];

        // Create the new question
        const emptyQuestion = {
          id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          questionText: "",
          imageQuestion: "",
          randomResponse: false,
          questionTime: typeof IsQuestinTime !== "undefined" ? IsQuestinTime : false,
          Time: "00:01",
          choices: [
            {
              id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              text: "",
              isCorrect: true,
            },
            {
              id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              text: "",
              isCorrect: false,
            },
          ],
        };

        const updatedQuestions = [...existingQuestions, emptyQuestion];

        await updateDoc(quizRef, { questions: updatedQuestions });

        setSelectedQuestionId(emptyQuestion.id);
        toast.success("Question added successfully", { position: "bottom-right" });
      } else {
        console.error("Quiz does not exist.");
      }
    } catch (error) {
      console.error("Error adding question:", error.message);
    }
  };

  // delete question from bd
  const deleteQuestionBd = async (questionId) => {
    const quizDocRef = doc(db, "quizzes", quizN);

    try {
      // Get the current quiz data
      const quizDoc = await getDoc(quizDocRef);
      if (quizDoc.exists()) {
        const quizData = quizDoc.data();
        const updatedQuestions = quizData.questions.filter(question => question.id !== questionId);

        // Update the quiz document with the new question array
        await updateDoc(quizDocRef, {
          questions: updatedQuestions,
        });
        toast.success('Question removed successfully', {position: 'bottom-right',})
        setSelectedQuestionId(quizData.questions[0].id);
      }
    } catch (error) {
      console.error("Error removing question:", error);
    }
  };

  // export document from excel and it firebase
  const handleFileUploadExcel = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const workbook = XLSX.read(arrayBuffer, { type: "array" });

          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // Detect headers dynamically
          const headers = json[0].map((header) => header?.toString().trim().toLowerCase());
          const questionColumnIndex = headers.indexOf("question text");

          if (questionColumnIndex === -1) {
            toast.error("Missing 'Question Text' column in the Excel file.", {
              position: "bottom-right",
            });
            return;
          }

          // Extract all columns after "Question Text" as options
          const optionColumns = headers.slice(questionColumnIndex + 1);
          if (optionColumns.length === 0) {
            toast.error("No option columns found in the Excel file.", {
              position: "bottom-right",
            });
            return;
          }

          const structuredData = json
            .slice(1) // Exclude the header row
            .filter((row) => row[questionColumnIndex]) // Filter out rows without a question
            .map((row, rowIndex) => {
              const questionText = row[questionColumnIndex]?.toString().trim();

              const options = row.slice(questionColumnIndex + 1).map((option) => {
                if (option && option.toString().trim() !== "") {
                  return {
                    id:`c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    text: option.toString().trim().toLowerCase(), // Convert to lowercase for consistency
                    isCorrect: "false", // Default all options to false
                  };
                }
                return null; // Exclude empty options
              }).filter((option) => option !== null); // Remove null options

              return {
                id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                questionText,
                choices: options.length > 0 ? options : [{ text: "No options available", isCorrect: "false" }],
                imageQuestion: "",
                randomResponse: false,
              };
            });

          const quizDocRef = doc(db, "quizzes", quizN);

          await updateDoc(quizDocRef, {
            questions: arrayUnion(...structuredData),
          });

          toast.success("Questions uploaded successfully!", { position: "bottom-right" });
        } catch (err) {
          console.error(err);
          toast.error("Failed to read the Excel file.", { position: "bottom-right" });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  //question title state && quiz title state
  const [quizTitle, setQuizTitle] = useState(quizData?.quizTitle || "");
  const [quizQuestion, setquizQuestion] = useState("ffffff");


  const handleQuestionChangeQuiz =async (e) => {
      setquizQuestion(e.target.value);
      try {
        const quizRef = doc(db, "quizzes", quizN);

        const quizDoc = await getDoc(quizRef);

        if (!quizDoc.exists()) {
          console.error("Quiz not found!");
          return;
        }

        const quizData = quizDoc.data();
        const questions = quizData.questions || [];

        const questionIndex = questions.findIndex(q => q.id === selectedQuestionId);

        if (questionIndex === -1) {
          console.error("Question not found!");
          return;
        }

        questions[questionIndex].questionText = e.target.value;
        await updateDoc(quizRef, {
          questions: questions
        });
        setSelectedQuestionId(selectedQuestionId);

        console.log("Question text updated successfully!");
      } catch (error) {
        console.error("Error updating question text:", error);
      }
  };
  // update quiz title
  const handleUpdateQuizTitle = async () => {


    const quizDocRef = doc(db, "quizzes", quizN);
    await updateDoc(quizDocRef, { quizTitle });
    console.log("Quiz title updated successfully!");

    setQuizData((prev) => ({ ...prev, quizTitle }));
    toast.success("Name changed successfully!", { position: "bottom-right" });

    setIsEditing(false);
  };

  // import image question
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        const quizRef = doc(db, "quizzes", quizN);

        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
          const quizData = quizSnap.data();
          const updatedQuestions = quizData.questions.map((q) =>
            q.id === selectedQuestionId ? { ...q, imageQuestion: base64Image } : q
          );

          await updateDoc(quizRef, { questions: updatedQuestions });

          setQuizData((prev) => ({
            ...prev,
            questions: updatedQuestions,
          }));
          setSelectedQuestionId(selectedQuestionId);
          toast.success('Image changed successfully', {position: 'bottom-right',})

        } else {
          toast.error('Quiz not found', {position: 'bottom-right',})

        }
      };

      reader.readAsDataURL(file);
    }
  };

  // update data
  // const SaveQuizTitle = async () => {

  //   try {
  //     const quizRef = doc(db, "quizzes", quizN);

  //     const quizDoc = await getDoc(quizRef);

  //     if (!quizDoc.exists()) {
  //       console.error("Quiz not found!");
  //       return;
  //     }

  //     const quizData = quizDoc.data();
  //     const questions = quizData.questions || [];

  //     const questionIndex = questions.findIndex(q => q.id === selectedQuestionId);

  //     if (questionIndex === -1) {
  //       console.error("Question not found!");
  //       return;
  //     }

  //     questions[questionIndex].questionText = quizQuestion;
  //     await updateDoc(quizRef, {
  //       questions: questions
  //     });
  //     setSelectedQuestionId(selectedQuestionId);

  //     console.log("Question text updated successfully!");
  //   } catch (error) {
  //     console.error("Error updating question text:", error);
  //   }
  // };

  //change image question
  const deleteImageQuestion = async () => {

        const quizRef = doc(db, "quizzes", quizN);

        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
          const quizData = quizSnap.data();
          const updatedQuestions = quizData.questions.map((q) =>
            q.id === selectedQuestionId ? { ...q, imageQuestion: null } : q
          );

          await updateDoc(quizRef, { questions: updatedQuestions });

          setQuizData((prev) => ({
            ...prev,
            questions: updatedQuestions,
          }));
          setSelectedQuestionId(selectedQuestionId);

          toast.success('image deleted successfully', {position: 'bottom-right',})

        } else {
          toast.error('Quiz not found', {position: 'bottom-right',})
        }

  };


  const [questionChoices, setQuestionChoices] = useState([]); // State for question choices

  // Fetch choices from Firestore based on quiz and selected question
  useEffect(() => {
    const fetchChoices = async () => {
      try {

        // Get the reference to the specific quiz document
        const quizRef = doc(db, "quizzes", quizN);
        const quizSnap = await getDoc(quizRef);

        if (quizSnap.exists()) {
          const quizData = quizSnap.data();
          // Find the question by selectedQuestionId from the questions array
          const question = quizData.questions.find(q => q.id === selectedQuestionId);

          if (question && question.choices) {
            setQuestionChoices(question.choices);  // Set the choices state
          }
        } else {
          console.error("Quiz not found");
        }
      } catch (error) {
        console.error("Error fetching choices: ", error);
      }
    };

    fetchChoices();
  }, [quizN,questionChoices, selectedQuestionId]);

  // drag and drop choices
  const handleDragEndChoices = async (event) => {
    const { active, over } = event;

    if (!active || !over) {
      console.error('Invalid drag event data:', { active, over });
      return;
    }

    if (active.id !== over.id) {
      const quizDocRef = doc(db, 'quizzes', quizN);
      const quizDoc = await getDoc(quizDocRef);

      if (quizDoc.exists()) {
        const quizData = quizDoc.data();

        const questionIndex = quizData.questions.findIndex((item) => item.id === selectedQuestionId);

        if (questionIndex !== -1) {
          const choices = quizData.questions[questionIndex].choices;

          const oldIndex = choices.findIndex((choice) => choice.id === active.id);
          const newIndex = choices.findIndex((choice) => choice.id === over.id);

          // Ensure valid indices
          if (oldIndex === -1 || newIndex === -1) {
            console.error('Invalid indices:', { oldIndex, newIndex });
            return;
          }

          const updatedChoices = arrayMove(choices, oldIndex, newIndex);

          const updatedQuestions = [...quizData.questions];
          updatedQuestions[questionIndex] = {
            ...quizData.questions[questionIndex],
            choices: updatedChoices,
          };

          await updateDoc(quizDocRef, {
            questions: updatedQuestions,
          });
          setSelectedQuestionId(selectedQuestionId);

        } else {
          console.error('Question not found');
        }
      } else {
        console.error('Quiz not found');
      }
    }
  };

  // add new choice
  const addChoiceToQuestion = async () => {
    try {

      const quizRef = doc(db, "quizzes", quizN);
      const quizSnap = await getDoc(quizRef);

      if (quizSnap.exists()) {
        const quizData = quizSnap.data();
        const questionIndex = quizData.questions.findIndex(
          (question) => question.id === selectedQuestionId
        );

        if (questionIndex !== -1) {
          // Update the choices array for the specific question
          quizData.questions[questionIndex].choices.push({ id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`, text: "", isCorrect: false });

          // Update the quiz document with the modified questions array
          await updateDoc(quizRef, {
            questions: quizData.questions,
          });
          setSelectedQuestionId(selectedQuestionId);

        } else {
          console.log("Question not found!");
        }
      } else {
        console.log("Quiz not found!");
      }
    } catch (error) {
      console.error("Error adding choice: ", error);
    }
  };

  // delete choice of question
  const deleteChoice = async (id) => {
  try {

    const quizRef = doc(db, "quizzes", quizN);
    const quizSnap = await getDoc(quizRef);

    if (quizSnap.exists()) {
      const quizData = quizSnap.data();
      const questionIndex = quizData.questions.findIndex(
        (question) => question.id === selectedQuestionId
      );

      if (questionIndex !== -1) {
        const updatedChoices = quizData.questions[questionIndex].choices.filter(
          (choice) => choice.id !== id // Make sure choiceIdToRemove is passed
        );

        quizData.questions[questionIndex].choices = updatedChoices;

        await updateDoc(quizRef, {
          questions: quizData.questions,
        });
        setSelectedQuestionId(selectedQuestionId);

        console.log("Choice removed successfully!");
      } else {
        console.log("Question not found!");
      }
    } else {
      console.log("Quiz not found!");
    }
  } catch (error) {
    console.error("Error removing choice: ", error);
  }

  };

  // duplicate question
  const duplicateQuestion = async(id)=>{
    try {

      const quizRef = doc(db, "quizzes", quizN);
      const quizSnap = await getDoc(quizRef);

      if (quizSnap.exists()) {
        const quizData = quizSnap.data();
        const questionIndex = quizData.questions.findIndex(
          (question) => question.id === id
        );

        if (questionIndex !== -1) {
          const questionToDuplicate = quizData.questions[questionIndex];

          // Clone the question and generate a new ID
          const duplicatedQuestion = {
            ...questionToDuplicate,
            id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // New ID
          };

          // Add the duplicated question to the questions array
          quizData.questions.push(duplicatedQuestion);

          // Update the quiz document with the new questions array
          await updateDoc(quizRef, {
            questions: quizData.questions,
          });

        } else {
          console.log("Question not found!");
        }
      } else {
        console.log("Quiz not found!");
      }
    } catch (error) {
      console.error("Error duplicating question: ", error);
    }
  }

  const [isVisible, setIsVisible] = useState(false);

  // Function to handle checkbox toggle
  const handleCheckboxChange = () => {
    setIsVisible(!isVisible);
  };



  // change radom response status
  const handleCheckRandomResponses = async (e) =>{
    setIsRandomResponsesChecked(e);
    try {
      const quizRef = doc(db, "quizzes", quizN);
      const quizDoc = await getDoc(quizRef);

      if (!quizDoc.exists()) {
        console.error("Quiz not found!");
        return;
      }

      const quizData = quizDoc.data();
      const questions = quizData.questions || [];
      const questionIndex = questions.findIndex(q => q.id === selectedQuestionId);

      if (questionIndex === -1) {
        console.error("Question not found!");
        return;
      }

      questions[questionIndex].randomResponse = e;

      await updateDoc(quizRef, {
        questions: questions,
      });
      setSelectedQuestionId(selectedQuestionId);

      toast.success("Random responses setting updated!",{position: 'bottom-right',})
    } catch (error) {
      console.error("Error updating random response:", error);
    }
  }

  // change radom questions status
  const handleCheckRandomQuestions = async (e) => {
    setIsRandomQuestionsChecked(e);
    try {

      const quizRef = doc(db, "quizzes", quizN);

      await updateDoc(quizRef, {
        randomQuestions: e,
      });

      setSelectedQuestionId(selectedQuestionId);

      toast.success("Random questions setting updated!", { position: "bottom-right" });
    } catch (error) {
      console.error("Error updating random questions:", error);
      toast.error("Failed to update random questions setting.", { position: "bottom-right" });
    }
  };

    // change quiz time status
  const handleQuizTime = async (e) => {
      setIsTimeQuizChecked(e);
      try {


        const quizRef = doc(db, "quizzes", quizN);
        const quizDoc = await getDoc(quizRef);
        const quizData = quizDoc.data();
        const questions = quizData.questions || [];

        const updatedQuestions = questions.map(q => ({
          ...q,
          questionTime: !e,
        }));

        await updateDoc(quizRef, {
          questions: updatedQuestions,
        });

        await updateDoc(quizRef, {
          quizTime: e,
        });

        setQuizData((prev) => ({
          ...prev,
          questions: updatedQuestions,
        }));
        setSelectedQuestionId(selectedQuestionId);

      } catch (error) {
        console.error("Error updating random questions:", error);
        toast.error("Failed to update random questions setting.", { position: "bottom-right" });
      }
  };

  // upload image quiz
  const handleImageUploadQuiz = (e) =>{
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        try {
          const quizRef = doc(db, "quizzes", quizN);
          const quizSnap = await getDoc(quizRef);

          if (quizSnap.exists()) {
            await updateDoc(quizRef, { imageQuiz: base64Image });

            setQuizData((prev) => ({
              ...prev,
              imageQuiz: base64Image,
            }));

            toast.success('Quiz image updated successfully', { position: 'bottom-right' });
          } else {
            toast.error('Quiz not found', { position: 'bottom-right' });
          }
        } catch (error) {
          console.error("Error updating quiz image:", error);
          toast.error('Failed to update quiz image', { position: 'bottom-right' });
        }
      };

      reader.readAsDataURL(file);
    }
  }

  // delete image quiz
  const deleteImageQuiz = async() =>{
    try {
      setIsLoading(true);
      const quizRef = doc(db, "quizzes", quizN);

      const quizSnap = await getDoc(quizRef);

      if (quizSnap.exists()) {
        await updateDoc(quizRef, { imageQuiz:""});

        setQuizData((prev) => ({
          ...prev,
          imageQuiz: "",
        }));

        toast.success('Quiz image deleted successfully', { position: 'bottom-right' });
      } else {
        toast.error('Quiz not found', { position: 'bottom-right' });
      }
    } catch (error) {
      console.error("Error deleting quiz image:", error);
      toast.error('Failed to delete quiz image', { position: 'bottom-right' });
    }finally {
      setIsLoading(false);
    }
  }


  // change radom response status
  const handleQuestionTime = async (e) => {
    setIsQuestinTime(e);
    handleQuizTime(!e);
    try {
      setIsLoading(true);
      const quizRef = doc(db, "quizzes", quizN);
      const quizDoc = await getDoc(quizRef);

      if (!quizDoc.exists()) {
        console.error("Quiz not found!");
        return;
      }

      const quizData = quizDoc.data();
      const questions = quizData.questions || [];

      // Update all questions with the new questionTime value
      const updatedQuestions = questions.map(q => ({
        ...q,
        questionTime: e,
      }));

      await updateDoc(quizRef, {
        questions: updatedQuestions,
      });
      setSelectedQuestionId(selectedQuestionId);

      setQuizData((prev) => ({
        ...prev,
        questions: updatedQuestions,
      }));

    } catch (error) {
      console.error("Error updating question time:", error);
      toast.error("Failed to update question time.", { position: 'bottom-right' });
    }finally {
      setIsLoading(false);
    }
  };

  const [InputTimeQuestion, setInputTimeQuestion] = useState();
  const [InputTimeQuiz, setInputTimeQuiz] = useState();

  // change time quiz
 const changeTimeQuiz = async(e) => {

  const newTime = e.trim();

  try {
    const quizDocRef = doc(db, "quizzes", quizN);
    await updateDoc(quizDocRef, {
      Time: newTime,
    });
  } catch (error) {
    console.error("Error updating time:", error);
    toast.error("Error updating time", { position: "bottom-right" });
  }

 }

//  change time question
const changeTimeQuestion = async (e) => {
  try {
    const newTime = e.trim();

    const quizDocRef = doc(db, "quizzes", quizN);

    const quizDoc = await getDoc(quizDocRef);
    if (!quizDoc.exists()) {
      toast.error("Quiz not found", { position: "bottom-right" });
      return;
    }

    const quizData = quizDoc.data();
    const questions = quizData.questions || [];

    const questionIndex = questions.findIndex(
      (question) => question.id === selectedQuestionId
    );

    if (questionIndex === -1) {
      toast.error("Question not found", { position: "bottom-right" });
      return;
    }

    questions[questionIndex].Time = newTime;

    await updateDoc(quizDocRef, { questions });
    setSelectedQuestionId(selectedQuestionId);

  } catch (error) {
    console.error("Error updating question time:", error);
    toast.error("Failed to update question time", { position: "bottom-right" });
  }
};

// udpate choices
const updateChoice = async (updatedText, choiceId) => {
  try {
    const docRef = doc(db, "quizzes", quizN);

    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      throw new Error("Quiz document not found");
    }

    const quizData = docSnapshot.data();
    const questions = quizData.questions;

    const updatedQuestions = questions.map((question) => {
      if (question.id === selectedQuestionId) {
        const updatedChoices = question.choices.map((choice) =>
          choice.id === choiceId ? { ...choice, text: updatedText } : choice
        );

        return { ...question, choices: updatedChoices };
      }

      return question;
    });

    await updateDoc(docRef, {
      questions: updatedQuestions,
    });

  } catch (error) {
    console.error("Error updating Firestore document:", error);
  }
};

// check choices is correct or not
const updateCheck = async (updatedIsCorrect, choiceId) => {
  try {
    setIsLoading(true)
    // Get the document reference for the specific quiz
    const docRef = doc(db, "quizzes", quizN);

    // Fetch the document to get the questions array
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      throw new Error("Quiz document not found");
    }

    const quizData = docSnapshot.data();
    const questions = quizData.questions;

    // Find the question and update the choice
    const updatedQuestions = questions.map((question) => {
      if (question.id === selectedQuestionId) {
        const updatedChoices = question.choices.map((choice) =>
          choice.id === choiceId ? { ...choice, isCorrect: updatedIsCorrect } : choice
        );

        // Check if all choices are false
        const allChoicesFalse = updatedChoices.every((choice) => !choice.isCorrect);

        if (allChoicesFalse) {
          // Show a message to the user if all choices are false
          toast.error("At least one choice must be correct", { position: "bottom-right" });
          return question;
        }

        // Return the updated question with the modified choices
        return { ...question, choices: updatedChoices };
      }

      return question;
    });

    // If all choices are not false, update the document in Firestore
    await updateDoc(docRef, {
      questions: updatedQuestions,
    });

    setIsLoading(false)

  } catch (error) {
    console.error("Error updating Firestore document:", error);
  }finally {
    setIsLoading(false)
  }
};

// preview new blank
const handleButtonClick = () => {
  window.open('/preview/'+quizN, '_blank');
};

// theme value
const changeTheme = async (e) => {
  localStorage.setItem("themeType", e);
}

// pdf
const generatePDF = () => {
  const pdfContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h1 style="text-align: center;"><b>${quizData?.quizTitle}</b></h1>
    ${quizData?.questions.map(
        (q, index) => `
          <div style="margin-bottom: 40px; margin-top: 20px;">
            <h2><b>Question ${index + 1}: ${q.questionText}</b></h2>
            ${
              q.imageQuestion === ""
                  ? ""
                  : `<div style="display:flex;align-items:center;justify-content:center;margin:20px 0px"><img
                          src=${q.imageQuestion}
                          alt="image Question"
                          style="width: 10rem;"
                      /></div>`
            }
            <ul style="padding-left: 0; list-style-type: none;">
              ${q.choices
                .map(
                  (resp) => `
                    <li style="display: flex; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 18px; margin-right: 10px;">☐</span>
                      <span>${resp.text}</span>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
        `
      )
      .join('')}
  </div>
`;


  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = pdfContent;
  document.body.appendChild(tempDiv);

  const options = {
    margin: 1,
    filename: quizData?.quizTitle+'.pdf',
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  };

  html2pdf().set(options).from(tempDiv).save();

  document.body.removeChild(tempDiv);
};

const [FirebaseProjectLink, setFirebaseProjectLink] = useState("");
const [FirebaseApiKey, setFirebaseApiKey] = useState("");
const [FirebaseAuthDomain, setFirebaseAuthDomain] = useState("");

const toggleSwitchClass = "relative w-12 h-6 bg-slate-200 checked:bg-[#4F46E5] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ring-1 ring-transparent ring-offset-white focus:outline-none appearance-none before:inline-block before:w-5 before:h-5 before:bg-white checked:before:bg-white before:translate-x-0 checked:before:translate-x-6 before:shadow before:rounded-full before:transform before:transition before:ease-in-out before:duration-200";
const fieldLabelClass = "inline-block text-sm text-slate-700";
const panelCardClass = "bg-white p-6 border border-slate-200 rounded-2xl";
const uploadButtonClass = "py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-slate-50";



  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      />
    <div className="bg-slate-50 min-h-screen font-['Inter']">
      { isLoading &&
      <div className="spinner-wrapper  backdrop-blur-md bg-black/20">
        <span className="loader"></span>
      </div>
      }
      <header className="relative flex items-center justify-between w-full px-4 py-3 bg-white border-b border-slate-200 md:flex-row flex-col space-y-4 md:space-y-0 ">
        {/* Left Section: Logo and Design */}
        <div className="flex items-center space-x-4 ">
          {/* Logo */}
          <Link to="/" className="flex items-center text-2xl font-black">
            <img src={Logo} alt="Qgen logo" className="w-9 h-9 rounded-lg object-cover" />
          </Link>

          {/* Test and Quiz Design */}
          <div className="flex flex-col">
            {/* Title */}
            <div className="flex items-center space-x-1.5">
            {isEditing ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={quizTitle} // Local state for the input
                      onChange={(e) => setQuizTitle(e.target.value)} // Update input value
                      className="font-bold text-slate-900 border-b-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateQuizTitle} // Save changes when clicked
                      aria-label="Save quiz title"
                      className="ml-2 p-1 text-[#4F46E5] hover:text-indigo-700 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                      <span
                      className="font-bold text-slate-900 cursor-pointer"
                      onClick={() => setIsEditing(true)}
                    >
                      {quizData?.quizTitle
                        ?.split(' ')
                        .slice(0, 4)
                        .join(' ')}
                      {quizData?.quizTitle?.split(' ').length > 3 ? '...' : ''}
                    </span>

                )}
            <button
              type="button"
              aria-label="Edit quiz title"
              onClick={()=>setIsEditing(true)} // Trigger edit mode when clicked
              className="text-slate-400 hover:text-[#4F46E5] cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>


            {/* Quiz Text with Info Icon */}
            <div className="flex items-center space-x-1 text-slate-400 text-sm">
              <span>Quiz</span>
              <Info className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center space-x-3 md:space-x-3  md:space-y-0">
          {/* button export */}
          <div className="relative">
              <button
            id="hs-dropdown-with-icons"
            type="button"
            className="hs-dropdown-toggle py-2 px-5 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label="Export"
            onClick={toggleDropdown}
          >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

          <div
            className={`hs-dropdown-menu absolute z-10 transition-[opacity,margin] duration ${isOpen ? 'opacity-100' : 'opacity-0'} ${isOpen ? 'block' : 'hidden'} min-w-60 bg-white border border-slate-200 rounded-xl mt-2 divide-y divide-slate-100 `}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="hs-dropdown-with-icons"
          >
            <div className="p-1 space-y-0.5">

                {/* html button */}
                <Htmlpage quizId={quizN} FirebaseProjectLink={FirebaseProjectLink} FirebaseApiKey={FirebaseApiKey} FirebaseAuthDomain={FirebaseAuthDomain} imageQuiz={quizData?.imageQuiz} />

              <button onClick={() =>generatePDF()} className="flex items-center w-full gap-x-3 py-2 px-3 rounded-lg text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus:bg-slate-100 cursor-pointer" >
                <FileText className="shrink-0 w-4 h-4 text-slate-500" />
                PDF File
              </button>

              <ScormButton quizId={quizN} FirebaseProjectLink={FirebaseProjectLink} FirebaseApiKey={FirebaseApiKey} FirebaseAuthDomain={FirebaseAuthDomain} imageQuiz={quizData?.imageQuiz}/>

            </div>
          </div>
          </div>



          <button onClick={(handleButtonClick)} className="flex items-center gap-2 bg-[#4F46E5] hover:bg-indigo-700 active:scale-[0.98] motion-safe:transition-all text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer">
            <Play className="w-4 h-4" fill="currentColor" />
            <span>PREVIEW</span>
          </button>
        </div>
      </header>

    {/* main */}
      <div className="md:flex sm:flex lg:flex p-6 gap-6  ">
        {/* First Column: Sidebar and settings */}
        <div className="flex flex-1 h-screen  border border-slate-200 rounded-2xl overflow-hidden  md:w-1/4 sm:w-full lg:w-[30%] max-h-max overflow-y-auto animate-enter-left ">
          <div className="relative left-0 h-5/6  select-none bg-slate-900">
            {/* Sidebar items */}
            <div className="h-14 w-16 cursor-pointer p-3" onClick={() => handleSidebarClick('questions')}>
              <div className={`border-gray pointer-events-auto absolute flex h-10 w-10 items-center justify-center rounded-full ${selected === 'questions' ? 'bg-[#4F46E5]' :''} text-slate-300 duration-100 hover:bg-slate-800`}>
              <ListChecks className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="h-14 w-16 cursor-pointer p-3" onClick={() => handleSidebarClick('quiz')}>
              <div className={`border-gray pointer-events-auto absolute flex h-10 w-10 items-center justify-center rounded-full ${selected === 'quiz' ? 'bg-[#4F46E5]' :''} text-slate-300 duration-100 hover:bg-slate-800`}>
              <Settings className="w-5 h-5 text-white" />
              </div>
            </div>


            <div className="h-14 w-16 cursor-pointer p-3" onClick={() => handleSidebarClick('ai')}>
              <div className={`border-gray pointer-events-auto absolute flex h-10 w-10 items-center justify-center rounded-full ${selected === 'ai' ? 'bg-[#4F46E5]' :''} text-slate-300 duration-100 hover:bg-slate-800`}>
                  <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>


            <div className="h-14 w-16 cursor-pointer p-3" onClick={() => handleSidebarClick('theme')}>
              <div className={`border-gray pointer-events-auto absolute flex h-10 w-10 items-center justify-center rounded-full ${selected === 'theme' ? 'bg-[#4F46E5]' :''} text-slate-300 duration-100 hover:bg-slate-800`}>
                  <Palette className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="h-14 w-16 cursor-pointer p-3" onClick={() => handleSidebarClick('firebase')}>
              <div className={`border-gray pointer-events-auto absolute flex h-10 w-10 items-center justify-center rounded-full ${selected === 'firebase' ? 'bg-[#4F46E5]' :''} text-slate-300 duration-100 hover:bg-slate-800`}>
              <Database className="w-5 h-5 text-white" />
              </div>
            </div>


          </div>
          <div className=" bg-white  h-5/6 overflow-y-auto custom-scrollbar w-full">


              {selected === 'questions' && (
                  <div className="overflow-x-hidden" >
                  {/* Header with Toggle */}
                      <div className="flex items-center justify-between px-4 pt-6 pb-2 border-b-[2px] border-b-slate-100">
                        <h3 className="text-md font-bold text-slate-900">Questions</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm bg-slate-100 text-slate-700 px-3 py-0.5 rounded-lg">
                            {quizData?.questions?.length}
                          </span>
                          <button
                            onClick={toggleCollapseQuestions}
                            aria-label={isCollapsed ? "Collapse questions list" : "Expand questions list"}
                            className="ml-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '' : '-rotate-180'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Section */}
                      {isCollapsed && (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEndQuestions}
                          >
                            <SortableContext
                              items={quizData?.questions?.map((q) => q.id) || []}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="mt-4 rounded space-y-2 hover:rounded-lg">
                                {quizData?.questions?.map((question) => (
                                  <SortableItem
                                    key={question.id}
                                    id={question.id}
                                    question={question}
                                    questionsLength={quizData?.questions.length}
                                    selectedQuestionId={selectedQuestionId}
                                    setSelectedQuestionId={setSelectedQuestionId}
                                    deleteQuestionBd={deleteQuestionBd}
                                    duplicateQuestion={duplicateQuestion}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                      )}

                      {/* Add Question Button */}
                      <div className="px-4 mt-4">
                        <button
                          onClick={()=>addQuestionSide(quizN)}
                          className="flex items-center justify-center w-full gap-2 bg-[#4F46E5] hover:bg-indigo-700 active:scale-[0.98] motion-safe:transition-all text-white px-6 py-2.5 rounded-lg cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm font-semibold">Add a Question</span>
                        </button>
                        {/* button excel import */}
                          <ExcelQuestions handleFileUploadExcel={handleFileUploadExcel}/>

                      </div>

                      <div className="text-xs p-3 mx-4 mt-4 mb-5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                        <p className="font-semibold flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Note:</p>
                        <p className="mt-1">The Excel just accepted structure <strong>'Question Text' as first column - options</strong></p>
                      </div>


                  </div>
              )}

              {selected === 'quiz' && (
                <div className="overflow-x-hidden">
                {/* quiz settings sidebar */}
                <div className="flex items-center gap-2 px-4 pt-6 pb-2 border-b-[2px] border-b-slate-100">
                  <Settings className="w-5 h-5 text-slate-500" />
                  <h3 className="text-md font-bold text-slate-900">Quiz Settings</h3>
                  <div className="flex items-center space-x-2"></div>
                </div>

                {/* time status */}
                <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 justify-center items-center pt-8">
                  <div className="sm:col-span-6 flex items-center">
                    <label
                      htmlFor="af-account-full-name"
                      className={`${fieldLabelClass} text-nowrap`}
                    >
                      Time (hours : minutes)
                    </label>
                  </div>

                  <div className="sm:col-span-6 flex justify-center items-center">
                    {/* input question checkbox */}
                    <input
                      type="checkbox"
                      name="timequiz"
                      checked={IsTimeQuizChecked}
                      onChange={(e) => handleQuizTime(e.target.checked)}
                      className={toggleSwitchClass}
                    />
                  </div>
                </div>

                {/* time quiz */}
                {quizData?.quizTime &&

                <div className="grid sm:grid-cols-12 gap-2 sm:gap-4  justify-center items-center pt-8">


                  <div className="sm:col-span-12 px-4 max-w-sm relative ">
                      <div className="relative">

                        <input
                                type="time"
                                id="time"
                                className="bg-slate-50 border leading-none border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-[#4F46E5] focus:border-[#4F46E5] block w-full p-2.5 "
                                min="09:00"
                                max="18:00"
                                value={InputTimeQuiz || "00:00"}
                                onChange={(e) => changeTimeQuiz(e.target.value)}
                                required
                              />
                      </div>
                  </div>

                </div>}

                {/* random questions */}
                <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 justify-center items-center pt-8">
                  <div className="sm:col-span-6 flex items-center">
                    <label
                      htmlFor="af-account-full-name"
                      className={fieldLabelClass}
                    >
                      Random Questions
                    </label>
                  </div>

                  <div className="sm:col-span-6 flex justify-center items-center">
                    {/* input question checkbox */}
                    <input
                      type="checkbox"
                      name="randomQuestion"
                      checked={IsRandomQuestionsChecked}
                      onChange={(e) => handleCheckRandomQuestions(e.target.checked)}
                      className={toggleSwitchClass}
                    />
                  </div>
                </div>

                {/* image quiz */}

                <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 justify-center items-center pt-8">
                  <div className="sm:col-span-6 flex items-center">
                    <label
                      htmlFor="af-account-full-name"
                      className={fieldLabelClass}
                    >
                      Quiz image
                    </label>
                  </div>

                  <div className="sm:col-span-6 flex justify-center items-center">
                        {/* upload image quiz */}
                        <div className="flex gap-x-2">
                            <div>
                              <div className={uploadButtonClass}>
                                <label className="inline-flex items-center gap-x-2 cursor-pointer">
                                  <Upload className="shrink-0 w-4 h-4" />
                                  <input
                                    type="file"
                                    className="ImageQuestion hidden"
                                    onChange={handleImageUploadQuiz}
                                  />
                                </label>
                                {quizData?.imageQuiz && (
                                  <label className="inline-flex items-center ms-5 gap-x-2 cursor-pointer">
                                    <button onClick={() => deleteImageQuiz()} aria-label="Delete quiz image" className="cursor-pointer">
                                      <Trash2 className="shrink-0 w-4 h-4 text-red-500" />
                                    </button>
                                  </label>
                                ) }
                              </div>
                            </div>
                        </div>
                  </div>
                </div>

                {/* list image quiz  */}

                <div className="grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 justify-center items-center pb-4">
                  <div className="sm:col-span-12 flex items-center justify-center mt-6 ">
                          <img
                              className="border-2 border-slate-200 inline-block w-2/4 h-1/4 rounded-xl ring-4 ring-white "
                              src={
                                quizData?.imageQuiz
                                  ?  quizData?.imageQuiz
                                  : imageQEmpty
                              }
                              alt="Quiz cover"
                          />
                  </div>

                </div>
              </div>

              )}

              {selected === 'ai' && (
                // ai generate
                <AiGenerate />

              )}

              {selected === 'theme' && (
                  <ThemeStyle changeTheme={changeTheme} />
              )}


              {selected === 'firebase' && (
                <ConnectFirebase ProjectLink={setFirebaseProjectLink} ApiKey={setFirebaseApiKey} AuthDomain={setFirebaseAuthDomain} />

              )}


          </div>

        </div>


        {/* three column : form question */}
        {quizData?.questions?.length > 0?
            <div className="h-screen max-h-max lg:w-[46%] md:w-1/2 max-sm:w-full max-sm:mt-5 ">
                <div className={`w-1/2 h-5/6 overflow-y-auto custom-scrollbar w-full ${panelCardClass}`}>
                    <div className="flex mb-8 justify-between border-b-[2px] border-b-slate-100 pb-2 " >
                          <h2 className="flex items-center gap-2.5 text-md font-bold text-slate-900 ">
                          <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
                            {quizData?.questions?.find(q => q.id === selectedQuestionId)?.questionText}
                          </h2>
                          {/* quik question */}


                              <QuestionsTake quizId={quizN} />


                    </div>

                    {/* start form */}
                      <div className="grid sm:grid-cols-12 gap-4">
                        {/* --------------- block image ----------------------- */}

                              <div className="sm:col-span-12">
                                { isVisible ? <div className="px-80"></div> :
                                <div className="flex items-center justify-center gap-5">
                                  <img
                                    className="inline-block w-1/4 h-1/4 rounded-xl ring-4 ring-white "
                                    src={
                                      quizData?.questions?.find((q) => q.id === selectedQuestionId)?.imageQuestion
                                        ? quizData?.questions?.find((q) => q.id === selectedQuestionId)?.imageQuestion
                                        : imageQ
                                    }
                                    alt="Question illustration"
                                  />
                                  <div className="flex gap-x-2">
                                    <div>
                                      <div className={uploadButtonClass}>
                                        <label className="inline-flex items-center gap-x-2 cursor-pointer">
                                          <Upload className="shrink-0 w-4 h-4" />
                                          <input
                                            type="file"
                                            className="ImageQuestion hidden"
                                            onChange={handleImageUpload}
                                          />
                                        </label>

                                        {quizData?.questions?.find((q) => q.id === selectedQuestionId)?.imageQuestion && (
                                          <label className="inline-flex items-center ms-5 gap-x-2 cursor-pointer">
                                            <button onClick={() => deleteImageQuestion()} aria-label="Delete question image" className="cursor-pointer">
                                              <Trash2 className="shrink-0 w-4 h-4 text-red-500" />
                                            </button>
                                          </label>
                                        ) }
                                      </div>
                                    </div>
                                  </div>
                                </div>}
                              </div>

                        {/* -------------------- end block image */}

                        {/* ----------------- block question name ------------ */}
                            <div className="sm:col-span-12">
                              <label className="inline-block text-xs text-slate-500 mt-2.5  font-bold">
                                Question
                              </label>
                            </div>

                            <div className="sm:col-span-12">
                                <div className="flex items-center w-full">
                                  <div className="w-full"> {/* Takes 80% width */}
                                    <input
                                      id="question af-account-full-name"
                                      name="question"
                                      type="text"
                                      value={quizQuestion}
                                      onChange={handleQuestionChangeQuiz}
                                      className="QuizName py-2.5 px-3 block w-full rounded-lg border border-slate-300 text-sm text-slate-900 focus:z-10 focus:border-[#4F46E5] focus:ring-[#4F46E5] disabled:opacity-50 disabled:pointer-events-none "
                                    />
                                  </div>
                                  {/* <div className="w-1/3">
                                    <select
                                      className="py-2 px-3 block w-full border-gray-200 shadow-sm text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                                      value={questionType}
                                      onChange={(e) => setQuestionType(e.target.value)} // Manage the state for questionType
                                    >
                                      <option value="multipleChoice">Multiple Choice</option>
                                      <option value="singleChoice">Single Choice</option>
                                    </select>
                                  </div> */}
                                </div>
                            </div>

                          {/* -------------------- end question name ------------------------ */}

                        {/* boucle input to create a responses  */}

                            <div className="sm:col-span-12 flex items-center justify-between">
                              <label
                                htmlhtmlfor="af-account-full-name"
                                className="inline-block text-xs text-slate-500 mt-2.5  font-bold"
                              >
                                Resopnses
                              </label>

                              {/* button add input */}
                              <button
                                onClick={addChoiceToQuestion}
                                type="button"
                                aria-label="Add response"
                                className={uploadButtonClass}
                              >
                                <Plus className="shrink-0 w-4 h-4" />

                              </button>

                            </div>

                            <div className="sm:col-span-12">
                            {/* Start DnD */}
                                <DndContext
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={handleDragEndChoices}
                                >
                                  <SortableContext items={questionChoices.map((choice) => choice.id)}>
                                      <div className="sm:col-span-12">
                                        {questionChoices.map((choice) => (
                                          <ResponsesSortableInputs
                                            key={choice.id}
                                            id={choice.id}
                                            choices={questionChoices}
                                            input={choice}
                                            updateCheck={updateCheck}
                                            updateChoice={updateChoice}
                                            deleteChoice={deleteChoice}
                                          />
                                        ))}
                                      </div>
                                    </SortableContext>
                                </DndContext>
                                {/* End DnD */}
                            </div>

                        {/*  end iput */}
                      </div>

                      <div className="mt-5 flex justify-center	 gap-x-2">




                      </div>

                </div>
            </div>
            :
            <div className={`w-1/2 max-h-5/6 flex items-center justify-center ${panelCardClass}`}>
            <div className="flex mb-8 justify-between  border-b-slate-100 pb-2">

            </div>
            {/* start form */}
              <div className="grid sm:grid-cols-12  ">

                  <div className="sm:col-span-12">
                    <div className="flex items-center justify-center gap-5">
                      <img
                        className="inline-block rounded-xl ring-4 ring-white "
                        src={emptyQ}
                        alt="No questions"
                        width="50%"
                      />
                    </div>
                    <p className="text-xl text-slate-700 font-extrabold text-center leading-relaxed">
                      No questions added
                    </p>


                  </div>

              </div>



            </div>





        }
        <div className="lg:w-[25%] md:w-1/4 sm:w-full">
          {/* settings questions */}
          <div className={`max-sm:mt-5  animate-enterRight ${panelCardClass}`}>
              <div className="mb-8 flex items-center gap-2 border-b-[2px] border-b-slate-100 pb-2">
                    <Settings className="w-5 h-5 text-slate-500" />

                    <h2 className="text-md font-bold text-slate-900 ">
                      Settings
                    </h2>
              </div>
              {/* start settings */}
                {quizData?.questions?.length > 0 ? <>
                    {/* hide image */}
                    <div className="grid sm:grid-cols-12 gap-2 sm:gap-6 justify-center items-center pb-5">
                      <div className="sm:col-span-6 flex items-center">
                        <label
                          htmlFor="af-account-full-name"
                          className={fieldLabelClass}
                        >
                          Hide Image Content
                        </label>
                      </div>

                      <div className="sm:col-span-6 flex justify-center items-center">
                        {/* input question checkbox */}
                        <input
                          type="checkbox"
                          name="imageHide"
                          onChange={handleCheckboxChange}
                          className={toggleSwitchClass}
                        />
                      </div>
                    </div>


                    {/* random responses */}
                    <div className="grid sm:grid-cols-12 gap-2 sm:gap-6 justify-center items-center pb-5">
                      <div className="sm:col-span-6 flex items-center">
                        <label
                          htmlFor="af-account-full-name"
                          className={fieldLabelClass}
                        >
                          Random Responses
                        </label>
                      </div>

                      <div className="sm:col-span-6 flex justify-center items-center">
                        {/* input question checkbox */}
                        <input
                          type="checkbox"
                          name="randomResponse"
                          checked={IsRandomResponsesChecked}
                          onChange={(e) => handleCheckRandomResponses(e.target.checked)}
                          className={toggleSwitchClass}
                        />
                      </div>
                    </div>

                    {/* time question settings */}
                    <div className="grid sm:grid-cols-12 gap-2 sm:gap-6 justify-center items-center pb-5">
                      <div className="sm:col-span-6 flex items-center">
                        <label
                          htmlFor="af-account-full-name"
                          className={`${fieldLabelClass} text-nowrap`}
                        >
                          Question Time (hours:minutes)
                        </label>
                      </div>

                      <div className="sm:col-span-6 flex justify-center items-center">
                        {/* input question checkbox */}
                        <input
                          type="checkbox"
                          name="randomResponse"
                          checked={IsQuestinTime}
                          onChange={(e) => handleQuestionTime(e.target.checked)}
                          className={toggleSwitchClass}
                        />
                      </div>
                    </div>

                    {/* {time value} */}
                    {IsQuestinTime && (
                      <div className="grid sm:grid-cols-12 gap-2 sm:gap-4  justify-center items-center pt-2">
                        <div className="sm:col-span-12 px-4 max-w-sm relative">
                          <div className="relative">

                            <input
                              type="time"
                              id="time"
                              className="bg-slate-50 border leading-none border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-[#4F46E5] focus:border-[#4F46E5] block w-full p-2.5 "
                              min="09:00"
                              max="18:00"
                              value={InputTimeQuestion || "00:00"}
                              onChange={(e) => changeTimeQuestion(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}


                  </>

                :
                  <span className="text-xs flex justify-center items-center text-slate-400">No Questions Added</span>
                }


          </div>

          {/* express data */}
          <ExpressData quizN={quizN} />
          </div>


      </div>
    </div>
    </>
  );
};

export default StartPage;
