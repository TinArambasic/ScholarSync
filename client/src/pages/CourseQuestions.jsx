import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { usePageLoading } from '../hooks/usePageLoading'

export default function CourseQuestions() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const isPageLoading = usePageLoading()
  const [error, setError] = useState('')
  const [showNewQuestion, setShowNewQuestion] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [joiningLoading, setJoiningLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    loadData()
  }, [courseId])

  useEffect(() => {
    // Check if user is joined to this course
    if (user && user.joinedCourses) {
      setIsJoined(user.joinedCourses.includes(courseId))
    }
  }, [user, courseId])

  useEffect(() => {
    // Cleanup previous preview URL
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [coursesRes, questionsRes] = await Promise.all([
        api.get('/api/courses'),
        api.get('/api/questions')
      ])
      
      const foundCourse = coursesRes.data.find(c => c._id === courseId)
      setCourse(foundCourse)
      
      const filtered = questionsRes.data
        .filter(q => q.courseId === courseId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setQuestions(filtered)
    } catch (err) {
      console.error('Error loading course questions', err)
      setError('Ne mogu učitati pitanja')
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    setSelectedFile(file)
    
    // Create preview URL only for images
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  async function handleCreateQuestion(e) {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return
    
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', newTitle)
      formData.append('content', newContent)
      formData.append('courseId', courseId)
      
      if (selectedFile) {
        formData.append('attachment', selectedFile)
      }
      
      const res = await api.post('/api/questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setQuestions([res.data, ...questions])
      setNewTitle('')
      setNewContent('')
      setSelectedFile(null)
      setPreviewUrl(null)
      setShowNewQuestion(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Greška pri kreiranju pitanja')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleJoinCourse() {
    if (!user) {
      navigate('/login')
      return
    }

    setJoiningLoading(true)
    try {
      await api.post(`/api/courses/${courseId}/join`)
      setIsJoined(true)
      // Update user context with new joinedCourses
      const updatedUser = { ...user, joinedCourses: [...(user.joinedCourses || []), courseId] }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      window.dispatchEvent(new StorageEvent('storage', { key: 'currentUser', newValue: JSON.stringify(updatedUser) }))
    } catch (err) {
      alert(err.response?.data?.message || 'Greška pri pridruživanju kolegiju')
    } finally {
      setJoiningLoading(false)
    }
  }

  async function handleUnjoinCourse() {
    setJoiningLoading(true)
    try {
      await api.post(`/api/courses/${courseId}/unjoin`)
      setIsJoined(false)
      // Update user context
      const updatedUser = { ...user, joinedCourses: (user.joinedCourses || []).filter(id => id !== courseId) }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      window.dispatchEvent(new StorageEvent('storage', { key: 'currentUser', newValue: JSON.stringify(updatedUser) }))
    } catch (err) {
      alert(err.response?.data?.message || 'Greška pri napuštanju kolegija')
    } finally {
      setJoiningLoading(false)
    }
  }

  return (
    <>
      {isPageLoading ? (
        <LoadingSkeleton />
      ) : (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to={course ? `/years/${course.year}` : '/'} className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block">
              ← Natrag na kolegije
            </Link>
            {course && (
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
                <p className="text-gray-600 mt-1">
                  {course._id} • {course.type === 'obavezni' ? 'Obavezni' : 'Izborni'} • {course.year}. godina
                </p>
              </div>
            )}
          </div>
          
          {user && (
            <div className="flex gap-3">
              {isJoined ? (
                <button
                  onClick={handleUnjoinCourse}
                  disabled={joiningLoading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pridružen
                </button>
              ) : (
                <button
                  onClick={handleJoinCourse}
                  disabled={joiningLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Pridruži se
                </button>
              )}
              
              <button
                onClick={() => navigate(`/courses/${courseId}/ask`)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <span>+</span> Novo pitanje
              </button>
            </div>
          )}
        </div>

        {showNewQuestion && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Postavi novo pitanje</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Naslov pitanja</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Unesite naslov pitanja..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sadržaj pitanja</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Opišite vaše pitanje detaljno..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  rows="5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dodaj Datoteku</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Odabrano: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
                {previewUrl && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300 shadow-sm"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Dozvoljeni tipovi: JPG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP, RAR (max 10MB)
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Slanje...' : 'Objavi pitanje'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewQuestion(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold"
                >
                  Odustani
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-500 py-12">Učitavanje pitanja...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && questions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Nema postavljenih pitanja za ovaj kolegij.</p>
            {user ? (
              <button
                onClick={() => setShowNewQuestion(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Postavi prvo pitanje
              </button>
            ) : (
              <Link to="/login" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold">
                Prijavite se da biste postavili pitanje
              </Link>
            )}
          </div>
        )}

        {!loading && !error && questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {questions.length} {questions.length === 1 ? 'pitanje' : 'pitanja'}
            </h2>
            {questions.map(q => (
              <QuestionCard 
                key={q._id} 
                id={q._id} 
                title={q.title} 
                content={q.content} 
                author={q.author?.username || 'Unknown'} 
                course={q.courseId} 
                date={new Date(q.createdAt).toLocaleString()} 
                answersCount={q.answersCount || 0}
                attachment={q.attachment}
                isCompleted={q.isCompleted}
              />
            ))}
          </div>
        )}
      </div>
        </main>
      )}
    </>
  )
}
