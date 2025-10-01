import { useState } from 'react'
import './App.css'

interface Flashcard {
  subject: string
  question: string
  answer: string
}

interface Slot {
  subject: string
  startTime: string
  endTime: string
}

interface DaySchedule {
  date: string
  slots: Slot[]
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [wakeTime, setWakeTime] = useState('')
  const [sleepTime, setSleepTime] = useState('')
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null)
  const [schedule, setSchedule] = useState<{ schedule: DaySchedule[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!file || !wakeTime || !sleepTime) {
      setError('Please fill all fields and upload the file.')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('timetable', file)
    formData.append('wakeTime', wakeTime)
    formData.append('sleepTime', sleepTime)

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (response.ok) {
        setFlashcards(data.flashcards)
        setSchedule(data.schedule)
      } else {
        setError(data.error || 'An error occurred.')
      }
    } catch (err) {
      setError('Failed to upload file.')
    }
    setLoading(false)
  }

  return (
    <div className="container">
      <h1>Exam Flashcard Scheduler</h1>
      <div className="form">
        <div className="input-group">
          <label>Upload Exam Timetable (CSV):</label>
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="input-group">
          <label>Wake Time (HH:MM):</label>
          <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Sleep Time (HH:MM):</label>
          <input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} />
        </div>
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Flashcards & Schedule'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      {flashcards && (
        <div className="section">
          <h2>Flashcards</h2>
          {flashcards.map((card, index) => (
            <div key={index} className="flashcard">
              <div className="subject">Subject: {card.subject}</div>
              <div>Q: {card.question}</div>
              <div>A: {card.answer}</div>
            </div>
          ))}
        </div>
      )}

      {schedule && (
        <div className="section">
          <h2>Study Schedule</h2>
          {schedule.schedule.map((day, index) => (
            <div key={index} className="day">
              <h3>{day.date}</h3>
              <ul>
                {day.slots.map((slot, idx) => (
                  <li key={idx}>
                    {slot.startTime} - {slot.endTime}: {slot.subject}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
