import React, { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from "lucide-react";

const LoginP = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setIsSubmitting(true);
      await signInWithEmailAndPassword(auth, email, password);

    } catch (err) {

      setError("Email or password Incorrect ");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Calistoga&family=Inter:wght@400;500;600;700&display=swap"
      />
      <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 font-['Inter']">
        {/* Branding panel */}
        <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-[#4F46E5] text-white p-12">
          <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <span className="font-['Calistoga'] text-3xl md:text-4xl tracking-tight text-white">Qgen</span>
          </div>

          <div className="relative max-w-md">
            <h1 className="font-['Calistoga'] text-4xl xl:text-5xl leading-[1.1] text-white">
              Craft assessments your learners actually finish.
            </h1>
            <p className="mt-5 text-indigo-100 text-base leading-relaxed">
              Qgen is where teachers, trainers and course creators build, publish
              and track quizzes — without fighting the tooling.
            </p>
          </div>

          <p className="relative text-sm text-indigo-200">
          </p>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center items-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-sm">
            <span className="font-['Calistoga'] text-3xl tracking-tight text-[#4F46E5] mb-8 lg:hidden block text-center">Qgen</span>

            <h2 className="font-['Calistoga'] text-3xl text-slate-900">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Enter your details to continue.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleLogin} noValidate>
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border-2 border-slate-300 bg-white pl-10 pr-3 py-2.5 text-slate-900 placeholder-slate-400 outline-none motion-safe:transition-colors focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                    placeholder="you@school.edu"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border-2 border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 outline-none motion-safe:transition-colors focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#4F46E5] hover:bg-indigo-700 active:scale-[0.98] motion-safe:transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 motion-safe:transition-transform group-hover:translate-x-0.5" />
                )}
                Sign in
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/signup"
                className="text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-[#4F46E5]"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginP;
