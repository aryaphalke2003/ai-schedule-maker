const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// OpenRouter client
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Endpoint to upload timetable
app.post('/api/upload', upload.single('timetable'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const subjects = [];
    const wakeTime = req.body.wakeTime;
    const sleepTime = req.body.sleepTime;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        if (data.subject && data.examDate) {
          subjects.push({ subject: data.subject, examDate: data.examDate });
        }
      })
      .on('end', async () => {
        const result = await generateContent(subjects, wakeTime, sleepTime);
        res.json(result);
      })
      .on('error', (err) => {
        res.status(500).json({ error: 'Failed to parse CSV' });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to generate flashcards and schedule
async function generateContent(subjects, wakeTime, sleepTime) {
  const prompt_for_flashcards = `
  Based on the following exam subjects: ${subjects.map(s => s.subject).join(', ')}
  Generate flashcards for each subject to help study. For each subject, create 5 flashcards in JSON format with question and answer fields.
  Return as a JSON array of objects, each with "subject", "question", "answer".
  Example: [{"subject": "Math", "question": "What is 2+2?", "answer": "4"}]
  `;

  const prompt_for_schedule = `
  Based on the subjects and their exam dates: ${JSON.stringify(subjects)}
  User's wake time: ${wakeTime}, sleep time: ${sleepTime}.
  Create a daily study schedule divided into time slots for the next 7 days, allocating study time for subjects based on proximity to exam.
  Return JSON with "schedule": array of day objects with date and slots, each slot has subject, startTime, endTime.
  `;

  const flashcardsResponse = await openai.chat.completions.create({
    model: 'x-ai/grok-4-fast:free',   // ✅ valid model
    extra_headers: {
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "Exam Flashcard Scheduler",
    },
    messages: [{ role: 'user', content: prompt_for_flashcards }],
    max_tokens: 1500,
  });

  const scheduleResponse = await openai.chat.completions.create({
    model: 'x-ai/grok-4-fast:free',   // ✅ valid model
    extra_headers: {
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "Exam Flashcard Scheduler",
    },
    messages: [{ role: 'user', content: prompt_for_schedule }],
    max_tokens: 1500,
  });

  const flashcards = JSON.parse(flashcardsResponse.choices[0].message.content.trim());
  const schedule = JSON.parse(scheduleResponse.choices[0].message.content.trim());

  return { flashcards, schedule };
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
