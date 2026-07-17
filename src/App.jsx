import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./auth/contexts/AuthContext";

import ProtectedRoute from "./auth/ProtectedRoute";
import Dashboard from "./auth/Dashboard";
import Sign from "./auth/SignUp";
import LoginP from "./auth/Login";
import GuestRoute from "./auth/GuestRoute";
import StartPage from "./components/Start";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";
import Preview from "./components/Preview";
import Scores from "./components/scores";


function App() {
  const [loading, setLoading] = useState(true);
  
  
  const location = useLocation();
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location]);

    

  return  loading ? (
    <Loader />
  ) : ( 

    <AuthProvider>
      <Routes>
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <Sign/>
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginP />
            </GuestRoute>
          }
        />
        {/*  auth routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/start/:quizN"
          element={
            <ProtectedRoute>
              <StartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Navigate to="/" />

            </ProtectedRoute>
          }
        />


        <Route
          path="/preview/:quizN"
          element={
            <ProtectedRoute>
              <Preview />

            </ProtectedRoute>
          }
        />  

        <Route
          path="/sc"
          element={
            <ProtectedRoute>
              <Scores />

            </ProtectedRoute>
          }
        />  

       
      </Routes>
    </AuthProvider>
  );
}

export default App;
