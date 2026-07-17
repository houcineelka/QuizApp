# QuizApp

A web-based quiz builder and delivery platform. Create quizzes with a drag-and-drop editor, generate questions with AI, import them from Excel, and export the finished quiz as a standalone HTML page, a PDF, or a SCORM package for an LMS.

## Features

- **Quiz editor** — add, reorder (drag & drop), duplicate, and delete questions and answer choices; mark one or more choices as correct.
- **Excel import** — bulk-load questions from an `.xlsx` file (first column `Question Text`, following columns as options).
- **AI question generation** — generate a question and choices from a prompt, or correct existing text, via an OpenAI-backed endpoint.
- **Timers & randomization** — set a time limit per quiz or per question, and optionally randomize question and choice order.
- **Media** — attach a cover image to the quiz and an image to each question.
- **Theming** — customize the look of a quiz before sharing it.
- **Export** — download a quiz as a self-contained HTML page, a PDF, or a SCORM-compliant package.
- **Preview & play** — preview a quiz or take it end-to-end, with automatic scoring.
- **Scores dashboard** — review, search, and delete past quiz attempts.
- **Firebase auth** — per-user accounts, with quizzes and scores scoped to the signed-in user.
- **Bring your own Firebase project** — optionally connect the exported quiz to a different Firebase project instead of the default one.

## Tech stack

- **Frontend:** React 19, React Router, Tailwind CSS (with Flowbite/Preline components), `@dnd-kit` for drag-and-drop, `lucide-react` icons, `xlsx` for Excel parsing, `html2pdf.js` for PDF export, `jszip` + `file-saver` for SCORM packaging, Firebase (Auth + Firestore).
- **Backend:** a small Express server (`express/`) that proxies OpenAI chat completions and exposes a scraping endpoint used by the AI question generator.

## Project structure

```
src/
  auth/            Firebase config, auth context, login/signup, dashboard
  components/       Quiz editor, question/response editors, AI generation,
                    Excel import, exports (HTML/PDF/SCORM), scoring, theming
express/           Express server proxying OpenAI + a scraping endpoint
```

## Getting started

### Prerequisites

- Node.js
- A Firebase project (Auth + Firestore) — configured in `src/auth/firebase.jsx`
- An OpenAI API key (for AI question generation)

### Install

```bash
npm install
cd express && npm install
```



### Run

```bash
# Terminal 1 — backend
cd express && npm start

# Terminal 2 — frontend
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000); the Express API runs at `http://localhost:9800`.

## Available scripts

In the project root:

- `npm start` — run the app in development mode.
- `npm test` — run the test runner.
- `npm run build` — build the app for production into the `build` folder.

In `express/`:

- `npm start` — run the Express API server.
