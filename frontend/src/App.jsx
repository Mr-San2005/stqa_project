import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Could not reach the server. Check that the backend is running.', 0)
  }

  let data
  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    throw new ApiError(data.message || `Request failed (${response.status}).`, response.status)
  }
  return data
}

function readSession() {
  try {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (token && user?.id && user?.name && user?.role) return { token, user }
  } catch {
    // Clear an unreadable stored session and show the login form.
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return null
}

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const registering = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)

    try {
      let data
      if (registering) {
        data = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            ...(age ? { age: Number(age) } : {}),
          }),
        })
        if (!data.token || !data.user) {
          throw new ApiError('The server returned an incomplete registration response.', 500)
        }
        onAuthenticated({ token: data.token, user: data.user })
      } else {
        data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), password }),
        })
        if (!data.token || !data.user) {
          throw new ApiError('The server returned an incomplete login response.', 500)
        }
        onAuthenticated({ token: data.token, user: data.user })
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to complete the request.')
    } finally {
      setBusy(false)
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <main className="auth-layout">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="brand-mark" aria-hidden="true">OE</div>
        <p className="eyebrow">ONLINE EXAMINATION SYSTEM</p>
        <h1 id="auth-title">{registering ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">
          {registering ? 'Register as a student to access available exams.' : 'Sign in to continue to your dashboard.'}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button
            type="button"
            role="tab"
            aria-selected={!registering}
            className={!registering ? 'active' : ''}
            onClick={() => changeMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={registering}
            className={registering ? 'active' : ''}
            onClick={() => changeMode('register')}
          >
            Create account
          </button>
        </div>

        <form id="login-form" onSubmit={handleSubmit}>
          {registering && (
            <>
              <label className="field">
                <span>Full name</span>
                <input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={100}
                />
              </label>
              <label className="field">
                <span>Age <span className="optional">(optional, 18–60)</span></span>
                <input
                  id="age"
                  type="number"
                  min="18"
                  max="60"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                />
              </label>
            </>
          )}
          <label className="field">
            <span>Email address</span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              id="password"
              type="password"
              autoComplete={registering ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && (
            <p
              id="error-message"
              className={error.startsWith('Account created') ? 'notice success' : 'notice error'}
              role="status"
            >
              {error}
            </p>
          )}
          <button id="login-btn" className="button primary full-width" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <p className="auth-note">New public accounts are created with the student role.</p>
      </section>
    </main>
  )
}

function AdminTools({ token, exams, onExamCreated, onError }) {
  const [title, setTitle] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [totalMarks, setTotalMarks] = useState(100)
  const [selectedExam, setSelectedExam] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctOptionIndex, setCorrectOptionIndex] = useState('0')
  const [marks, setMarks] = useState(1)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function createExam(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const data = await apiRequest('/exams', {
        token,
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), durationMinutes: Number(durationMinutes), totalMarks: Number(totalMarks) }),
      })
      setTitle('')
      setMessage('Exam created.')
      onExamCreated(data.exam)
      setSelectedExam(data.exam._id)
    } catch (requestError) {
      onError(requestError)
    } finally {
      setBusy(false)
    }
  }

  async function addQuestion(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await apiRequest('/questions', {
        token,
        method: 'POST',
        body: JSON.stringify({
          exam: selectedExam,
          questionText: questionText.trim(),
          options: options.map((option) => option.trim()),
          correctOptionIndex: Number(correctOptionIndex),
          marks: Number(marks),
        }),
      })
      setQuestionText('')
      setOptions(['', '', '', ''])
      setCorrectOptionIndex('0')
      setMessage('Question added.')
    } catch (requestError) {
      onError(requestError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin-tools">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h2>Manage exams</h2>
        </div>
      </div>
      <div className="admin-grid">
        <form className="panel form-panel" onSubmit={createExam}>
          <h3>Create an exam</h3>
          <label className="field">
            <span>Exam title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={150} />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Duration (minutes)</span>
              <input type="number" min="1" max="300" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} required />
            </label>
            <label className="field">
              <span>Total marks</span>
              <input type="number" min="1" max="500" value={totalMarks} onChange={(event) => setTotalMarks(event.target.value)} required />
            </label>
          </div>
          <button className="button primary" type="submit" disabled={busy}>Create exam</button>
        </form>

        <form className="panel form-panel" onSubmit={addQuestion}>
          <h3>Add a multiple-choice question</h3>
          {exams.length === 0 ? (
            <p className="muted">Create an exam before adding questions.</p>
          ) : (
            <>
              <label className="field">
                <span>Exam</span>
                <select value={selectedExam || exams[0]._id} onChange={(event) => setSelectedExam(event.target.value)} required>
                  {exams.map((exam) => <option key={exam._id} value={exam._id}>{exam.title}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Question</span>
                <textarea value={questionText} onChange={(event) => setQuestionText(event.target.value)} required rows="2" />
              </label>
              <div className="option-fields">
                {options.map((option, index) => (
                  <label className="field" key={index}>
                    <span>Option {index + 1}</span>
                    <input
                      value={option}
                      onChange={(event) => setOptions(options.map((value, optionIndex) => optionIndex === index ? event.target.value : value))}
                      required
                    />
                  </label>
                ))}
              </div>
              <div className="field-row">
                <label className="field">
                  <span>Correct option</span>
                  <select value={correctOptionIndex} onChange={(event) => setCorrectOptionIndex(event.target.value)}>
                    {options.map((_, index) => <option key={index} value={index}>Option {index + 1}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Question marks</span>
                  <input type="number" min="1" value={marks} onChange={(event) => setMarks(event.target.value)} required />
                </label>
              </div>
              <button className="button primary" type="submit" disabled={busy}>Add question</button>
            </>
          )}
        </form>
      </div>
      {message && <p className="notice success" role="status">{message}</p>}
    </section>
  )
}

function ExamAttempt({ exam, token, onBack, onSubmitted, onError }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const answeredCount = Object.keys(answers).length
  const unansweredCount = questions.length - answeredCount

  useEffect(() => {
    let active = true
    apiRequest(`/questions/exam/${exam._id}`, { token })
      .then((data) => {
        if (active) setQuestions(data.questions || [])
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message)
          onError(requestError)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [exam._id, token, onError])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await apiRequest('/submissions', {
        token,
        method: 'POST',
        body: JSON.stringify({
          exam: exam._id,
          answers: Object.entries(answers).map(([question, selectedOptionIndex]) => ({
            question,
            selectedOptionIndex: Number(selectedOptionIndex),
          })),
        }),
      })
      onSubmitted(data.submission)
    } catch (requestError) {
      setError(requestError.message)
      onError(requestError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel attempt-panel">
      <button type="button" className="text-button" onClick={onBack}>← Back to exams</button>
      <p className="eyebrow">EXAM · {exam.durationMinutes} MINUTES</p>
      <h2>{exam.title}</h2>
      {loading ? <p className="muted">Loading questions…</p> : (
        error && questions.length === 0 ? <p className="notice error" role="alert">{error}</p> :
          questions.length === 0 ? <p className="muted">This exam does not have any questions yet.</p> : (
            <form onSubmit={submit}>
              <p className="attempt-progress" role="status">
                Answered <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions
                {unansweredCount > 0 && ` · ${unansweredCount} unanswered`}
              </p>
              {questions.map((question, index) => (
                <fieldset className="question-card" key={question._id}>
                  <legend>{index + 1}. {question.questionText} <span className="muted">({question.marks} {question.marks === 1 ? 'mark' : 'marks'})</span></legend>
                  {question.options.map((option, optionIndex) => (
                    <label className="answer-option" key={optionIndex}>
                      <input
                        type="radio"
                        name={question._id}
                        value={optionIndex}
                        checked={answers[question._id] === String(optionIndex)}
                        onChange={() => setAnswers({ ...answers, [question._id]: String(optionIndex) })}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </fieldset>
              ))}
              {error && <p className="notice error" role="alert">{error}</p>}
              {unansweredCount > 0 && (
                <p className="attempt-hint">You can submit now, but unanswered questions will receive no marks.</p>
              )}
              <button className="button primary" type="submit" disabled={busy}>
                {busy ? 'Submitting…' : 'Submit exam'}
              </button>
            </form>
          )
      )}
    </section>
  )
}

function ResultCard({ result, exam, onClose }) {
  return (
    <section className="result-card" role="status">
      <div>
        <p className="eyebrow">RESULT · {exam.title}</p>
        <h2>{result.score} <span>/ {result.totalMarks}</span></h2>
        <p className="muted">Your answers have been submitted.</p>
      </div>
      <button className="button secondary" type="button" onClick={onClose}>Back to exams</button>
    </section>
  )
}

function Dashboard({ session, onLogout }) {
  const { token, user } = session
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attemptingExam, setAttemptingExam] = useState(null)
  const [result, setResult] = useState(null)
  const [resultExam, setResultExam] = useState(null)
  const [adminResults, setAdminResults] = useState(null)
  const [adminResultsExam, setAdminResultsExam] = useState(null)
  const [loadingResults, setLoadingResults] = useState(false)

  const handleApiError = useCallback((requestError) => {
    if (requestError.status === 401) {
      onLogout()
      return
    }
    setError(requestError.message || 'Something went wrong.')
  }, [onLogout])

  useEffect(() => {
    let active = true
    apiRequest('/exams', { token })
      .then((data) => {
        if (active) setExams(data.exams || [])
      })
      .catch((requestError) => {
        if (active) handleApiError(requestError)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [token, handleApiError])

  function handleExamCreated(exam) {
    setExams((currentExams) => [exam, ...currentExams.filter((item) => item._id !== exam._id)])
    setError('')
  }

  async function viewResult(exam) {
    setError('')
    try {
      const data = await apiRequest(`/submissions/my/${exam._id}`, { token })
      setResult(data.submission)
      setResultExam(exam)
    } catch (requestError) {
      handleApiError(requestError)
    }
  }

  async function viewExamResults(exam) {
    setError('')
    setAdminResults(null)
    setAdminResultsExam(exam)
    setLoadingResults(true)
    try {
      const data = await apiRequest(`/submissions/exam/${exam._id}`, { token })
      setAdminResults(data.submissions)
    } catch (requestError) {
      setAdminResultsExam(null)
      handleApiError(requestError)
    } finally {
      setLoadingResults(false)
    }
  }

  if (attemptingExam) {
    return (
      <main className="app-shell">
        <AppHeader user={user} onLogout={onLogout} />
        <ExamAttempt
          exam={attemptingExam}
          token={token}
          onBack={() => setAttemptingExam(null)}
          onSubmitted={(submission) => {
            setResult(submission)
            setResultExam(attemptingExam)
            setExams((currentExams) => currentExams.map((exam) =>
              exam._id === attemptingExam._id ? { ...exam, hasSubmitted: true } : exam
            ))
            setAttemptingExam(null)
          }}
          onError={handleApiError}
        />
      </main>
    )
  }

  return (
    <main className="app-shell">
      <AppHeader user={user} onLogout={onLogout} />
      <section className="welcome-banner">
        <div>
          <p className="eyebrow">YOUR LEARNING SPACE</p>
          <h1 id="welcome-message">Welcome, {user.name}!</h1>
          <p className="muted">You are signed in as <strong>{user.role}</strong>. Your exams and results are here.</p>
        </div>
        <div className="welcome-icon" aria-hidden="true">✓</div>
      </section>

      {result && resultExam && (
        <ResultCard result={result} exam={resultExam} onClose={() => { setResult(null); setResultExam(null) }} />
      )}
      {error && <p className="notice error" role="alert">{error}</p>}

      {user.role === 'admin' && (
        <AdminTools token={token} exams={exams} onExamCreated={handleExamCreated} onError={handleApiError} />
      )}

      {user.role === 'admin' && adminResultsExam && (
        <section className="panel results-panel" aria-live="polite">
          <div className="section-heading">
            <div>
              <p className="eyebrow">STUDENT SCORES</p>
              <h2>{adminResultsExam.title}</h2>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => { setAdminResultsExam(null); setAdminResults(null) }}
            >
              Close
            </button>
          </div>
          {loadingResults ? <p className="muted">Loading results…</p> : adminResults?.length ? (
            <div className="results-table-wrap">
              <table className="results-table">
                <thead>
                  <tr><th>Student</th><th>Score</th><th>Submitted</th></tr>
                </thead>
                <tbody>
                  {adminResults.map((submission) => (
                    <tr key={submission._id}>
                      <td>
                        <strong>{submission.student?.name || 'Unknown student'}</strong>
                        {submission.student?.email && <span className="result-email">{submission.student.email}</span>}
                      </td>
                      <td>{submission.score} / {submission.totalMarks}</td>
                      <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="muted">No students have submitted this exam yet.</p>}
        </section>
      )}

      <section className="exam-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{user.role === 'admin' ? 'EXAM LIBRARY' : 'READY WHEN YOU ARE'}</p>
            <h2>{user.role === 'admin' ? 'Available exams' : 'Your exams'}</h2>
          </div>
          {!loading && <span className="count-badge">{exams.length} {exams.length === 1 ? 'exam' : 'exams'}</span>}
        </div>
        {loading ? <p className="muted">Loading exams…</p> : exams.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">▤</span>
            <h3>No exams available yet</h3>
            <p className="muted">{user.role === 'admin' ? 'Create an exam above to get started.' : 'Check back later for exams from your instructor.'}</p>
          </div>
        ) : (
          <div className="exam-grid">
            {exams.map((exam) => (
              <article className="exam-card" key={exam._id}>
                <div className="exam-card-icon" aria-hidden="true">✎</div>
                <h3>{exam.title}</h3>
                <div className="exam-meta">
                  <span>{exam.durationMinutes} min</span>
                  <span>{exam.totalMarks} marks</span>
                </div>
                {user.role === 'student' && (
                  <p className={`exam-status ${exam.hasSubmitted ? 'completed' : ''}`}>
                    {exam.hasSubmitted ? 'Completed' : 'Not attempted'}
                  </p>
                )}
                <div className="exam-actions">
                  {user.role === 'student' && (
                    <>
                      {exam.hasSubmitted ? (
                        <button className="button secondary" type="button" onClick={() => viewResult(exam)}>View result</button>
                      ) : (
                        <button className="button primary" type="button" onClick={() => { setError(''); setAttemptingExam(exam) }}>
                          Take exam
                        </button>
                      )}
                    </>
                  )}
                  {user.role === 'admin' && (
                    <button className="text-button" type="button" onClick={() => viewExamResults(exam)}>
                      View results
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function AppHeader({ user, onLogout }) {
  return (
    <header className="app-header">
      <a className="app-brand" href="/" aria-label="Online Examination System home">
        <span className="brand-mark small" aria-hidden="true">OE</span>
        <span>Exam<span className="brand-light">space</span></span>
      </a>
      <div className="header-user">
        <div className="user-details">
          <span>{user.name}</span>
          <span className="role-badge">{user.role}</span>
        </div>
        <button id="logout-btn" className="button secondary" type="button" onClick={onLogout}>Sign out</button>
      </div>
    </header>
  )
}

export default function App() {
  const [session, setSession] = useState(readSession)

  function handleAuthenticated(nextSession) {
    localStorage.setItem('token', nextSession.token)
    localStorage.setItem('user', JSON.stringify(nextSession.user))
    setSession(nextSession)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setSession(null)
  }

  return session
    ? <Dashboard session={session} onLogout={handleLogout} />
    : <AuthPage onAuthenticated={handleAuthenticated} />
}
