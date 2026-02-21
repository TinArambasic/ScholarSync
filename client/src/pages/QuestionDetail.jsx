import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { API_URL } from '../config'
import AnswerCard from '../components/AnswerCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'
import { useAuth } from '../context/AuthContext'


export default function QuestionDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const isLoading = usePageLoading()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function load(){
      try{
        const q = await api.get(`/api/questions/${id}`)
        setQuestion(q.data)
        const a = await api.get(`/api/answers?questionId=${id}`)
        setAnswers(a.data)
      } catch(err) { console.error(err) }
    }
    load()
  }, [id])

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_URL}${question.attachment.path}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = question.attachment.originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading file:', err)
    }
  }

  const toggleCompleted = async () => {
    if (updating) return
    
    setUpdating(true)
    try {
      const res = await api.patch(`/api/questions/${id}`, {
        isCompleted: !question.isCompleted
      })
      setQuestion(res.data)
    } catch (err) {
      console.error('Error updating question:', err)
    } finally {
      setUpdating(false)
    }
  }

  const toggleQuestionLike = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    try {
      const res = await api.post(`/api/questions/${id}/like`)
      setQuestion(res.data)
    } catch (err) {
      console.error('Error toggling question like:', err)
    }
  }

  const toggleAnswerLike = async (answerId) => {
    if (!user) {
      navigate('/login')
      return
    }
    
    try {
      const res = await api.post(`/api/answers/${answerId}/like`)
      // Update the answer in the list
      setAnswers(answers.map(a => a._id === answerId ? res.data : a))
    } catch (err) {
      console.error('Error toggling answer like:', err)
    }
  }

  // Sort answers by likes count (descending)
  const sortedAnswers = [...answers].sort((a, b) => {
    const aLikes = a.likes?.length || 0
    const bLikes = b.likes?.length || 0
    return bLikes - aLikes
  })

  if(!question) {
    if (isLoading) return <LoadingSkeleton />
    return <div className="container py-5">Učitavanje...</div>
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-primary-600 hover:text-primary-700 mb-6 inline-block"
          >
            ← Natrag
          </button>

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">{question.title}</h1>
              <div className="flex gap-2">
                {user && user._id === question.userId && (
                  <button
                    onClick={toggleCompleted}
                    disabled={updating}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      question.isCompleted
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    } disabled:opacity-50`}
                  >
                    {question.isCompleted ? '✓ Dovršeno' : 'Označi kao dovršeno'}
                  </button>
                )}
              </div>
            </div>
            
            {question.isCompleted && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">
                Pitanje je dovršeno
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <Link to={`/users/${question.userId}`} className="flex items-center gap-3 hover:opacity-80 transition">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                  {question.author.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{question.author.username}</p>
                  <p className="text-xs text-gray-500">{new Date(question.createdAt).toLocaleString()}</p>
                </div>
              </Link>
              <button
                onClick={toggleQuestionLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  user && question.likes?.includes(user._id)
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{user && question.likes?.includes(user._id) ? '❤️' : '🤍'}</span>
                <span className="font-semibold">{question.likes?.length || 0}</span>
              </button>
            </div>

            <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap mb-6">
              {question.content}
            </div>
            
            {question.attachment && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="font-semibold text-gray-700">Prilog:</span>
                    <span className="text-gray-800">{question.attachment.originalName}</span>
                    <span className="text-gray-500">({Math.round(question.attachment.size / 1024)} KB)</span>
                  </div>
                  <button 
                    onClick={handleDownload}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Preuzmi
                  </button>
                </div>
                {question.attachment.mimetype?.startsWith('image/') && (
                  <div className="mt-2 flex justify-center">
                    <img 
                      src={`${API_URL}${question.attachment.path}`}
                      alt={question.attachment.originalName}
                      className="max-w-full h-auto max-h-96 rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:opacity-90 transition"
                      onClick={() => setIsModalOpen(true)}
                    />
                  </div>
                )}
                {question.attachment.mimetype === 'application/pdf' && (
                  <div className="mt-2 flex justify-center">
                    <iframe 
                      src={`${API_URL}${question.attachment.path}`}
                      className="w-full min-h-screen rounded-lg border border-gray-300"
                      title={question.attachment.originalName}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image Modal */}
          {isModalOpen && question.attachment && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsModalOpen(false)}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img 
                src={`${API_URL}${question.attachment.path}`}
                alt={question.attachment.originalName}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Answers Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Odgovori</h2>
                <p className="text-sm text-gray-600 mt-1">{answers.length} {answers.length === 1 ? 'odgovor' : 'odgovora'}</p>
              </div>
              {user && (
                <button
                  onClick={() => navigate(`/questions/${id}/answer`)}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-lg hover:border-primary-500 font-semibold flex items-center gap-2 transition"
                >
                  <span>+</span> Dodaj odgovor
                </button>
              )}
            </div>

            {answers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 mb-4">Nema odgovora. Budite prvi koji će odgovoriti!</p>
                {user && (
                  <button
                    onClick={() => navigate(`/questions/${id}/answer`)}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Dodaj odgovor
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedAnswers.map(a => (
                  <div key={a._id} className="bg-white rounded-lg shadow-md p-6 relative">
                    <div className="flex justify-between items-start mb-4">
                      <Link to={`/users/${a.userId}`} className="flex items-center gap-3 flex-1 hover:opacity-80 transition">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                          {a.author.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{a.author.username}</p>
                            {a.userId === question.userId && (
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold">
                                ✓ Autor pitanja
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => toggleAnswerLike(a._id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                          user && a.likes?.includes(user._id)
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>{user && a.likes?.includes(user._id) ? '❤️' : '🤍'}</span>
                        <span className="font-semibold text-sm">{a.likes?.length || 0}</span>
                      </button>
                    </div>
                    {a.isHighlighted && (
                      <div className="mb-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm font-semibold">
                        ⭐ Istaknuto
                      </div>
                    )}
                    <p className="text-gray-700 mb-4 cursor-pointer hover:text-primary-600 transition" onClick={() => navigate(`/answers/${a._id}`)}>
                      {a.content}
                    </p>
                    {a.attachment && (
                      <div className="text-sm text-gray-600">
                        📎 Sadrži prilog
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
