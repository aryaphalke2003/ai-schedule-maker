# Exam Flashcard Scheduler

A React web application that allows users to upload an exam timetable (CSV format) and generate personalized flashcards and study schedules using AI (Grok via OpenRouter).

## Features

- Upload exam timetable as CSV (columns: `subject`, `examDate`)
- Input wake-up and sleep times
- AI-generated flashcards for each subject
- AI-generated study schedule divided into time slots for the next 7 days
- Clean, responsive UI

## Prerequisites

- Node.js v16+ (recommended v18+)
- npm

## Setup Instructions

### 1. Get OpenRouter API Key
- Go to [OpenRouter](https://openrouter.ai/)
- Sign up/Sign in
- Navigate to API Keys section
- Generate a new API key

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
This starts the backend server on http://localhost:5000

### 3. Frontend Setup
```bash
cd exam-flashcard-scheduler
npm install
npm run dev
```
This starts the frontend development server on http://localhost:5173

### 4. Environment Configuration
Create/update `backend/.env` with your OpenRouter API key:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Replace `your_openrouter_api_key_here` with your actual API key from OpenRouter.

## Usage

1. Start both backend and frontend servers as above.
2. Open http://localhost:5173 in your browser.
3. Create a CSV file with exam timetable:
   ```
   subject,examDate
   Math,2025-10-01
   Physics,2025-10-02
   Chemistry,2025-10-03
   Biology,2025-10-04
   ```
4. Upload the CSV, enter your wake/sleep times (e.g., 07:00 and 23:00).
5. Click "Generate Flashcards & Schedule".
6. View the generated flashcards and study schedule.

## CSV Format

The timetable CSV must have exactly two columns:
- `subject`: Name of the subject (string)
- `examDate`: Exam date in YYYY-MM-DD format (string)

## Technologies Used

- Frontend: React 19, TypeScript, Vite
- Backend: Node.js, Express, Multer (file upload), csv-parser, OpenAI SDK
- AI: Grok (beta) via OpenRouter API

## API Usage

The app makes requests to OpenRouter's API using the Grok model (`xai/grok-beta`). Free credits may be available for personal use.
