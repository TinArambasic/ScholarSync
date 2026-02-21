import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { API_URL } from '../config'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'
import { useAuth } from '../context/AuthContext'

export default function AnswerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isLoading = usePageLoading()
  
  const [answer, setAnswer] = useState(null)
  const [question, setQuestion] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadAnswer()
  }, [id])

  async function loadAnswer() {
    try {
      const res = await api.get(`/api/answers/${id}`)
      setAnswer(res.data)
      setEditContent(res.data.content)
      
      // Load the related question
      const qRes = await api.get(`/api/questions/${res.data.questionId}`)
      setQuestion(qRes.data)
    } catch (err) {
      console.error('Error loading answer:', err)
      setError('Ne mogu dohvatiti odgovor')
    }
  }

  async function handleEdit() {
    if (!editContent.trim()) {
      setError('Sadržaj odgovora je obavezan')
      return
    }
    
    if (editContent.trim().length < 10) {
      setError('Odgovor mora imati najmanje 10 znakova')
      return
    }

    try {
      const res = await api.patch(`/api/answers/${id}`, { content: editContent.trim() })
      setAnswer(res.data)
      setEditing(false)
      setSuccess('Odgovor je ažuriran')
      setTimeout(() => setSuccess(''), 3000)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri ažuriranju odgovora')
    }
  }

  async function handleDelete() {
    if (!window.confirm('Jeste li sigurni da želite izbrisati ovaj odgovor?')) return

    try {
      await api.delete(`/api/answers/${id}`)
      navigate(`/questions/${answer.questionId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri brisanju odgovora')
    }
  }

  async function handleDownload() {
    try {
      const fileName = answer.attachment.split('/').pop()
      const response = await fetch(answer.attachment.startsWith('http') ? answer.attachment : `${API_URL}${answer.attachment}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading file:', err)
      setError('Greška pri preuzimanju datoteke')
    }
  }

  async function toggleLike() {
    if (!user) {
      navigate('/login')
      return
    }
    
    try {
      const res = await api.post(`/api/answers/${id}/like`)
      setAnswer(res.data)
    } catch (err) {
      console.error('Error toggling like:', err)
      setError('Greška pri označavanju')
    }
  }

  if (!answer) {
    if (isLoading) return <LoadingSkeleton />
    return <div className="container mx-auto py-12 text-center text-gray-500">Učitavanje...</div>
  }

  const isAuthor = user && (user._id === answer.userId || user.role === 'admin')

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <button
          onClick={() => navigate(`/questions/${answer.questionId}`)}
          className="text-sm text-primary-600 hover:text-primary-700 mb-6 inline-block"
        >
          ← Natrag na pitanje
        </button>

        {question && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Odgovor na:</p>
            <h2 className="text-2xl font-bold text-gray-900 hover:text-primary-600 cursor-pointer" onClick={() => navigate(`/questions/${question._id}`)}>
              {question.title}
            </h2>
            <p className="text-gray-600 text-sm mt-2">Od: {question.author.username}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                  {answer.author.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{answer.author.username}</p>
                    {question && answer.userId === question.userId && (
                      <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold">
                        Autor
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{new Date(answer.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {answer.author.role && (
                <span className="inline-block ml-15 text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded font-semibold">
                  {answer.author.role}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={toggleLike}
                className={`px-4 py-2 rounded-lg transition text-sm font-semibold flex items-center gap-2 ${
                  user && answer.likes?.includes(user._id)
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{user && answer.likes?.includes(user._id) ? '❤️' : '🤍'}</span>
                <span className="font-semibold">{answer.likes?.length || 0}</span>
              </button>
              
              {isAuthor && !editing && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-semibold"
                  >
                    Uredi
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-semibold"
                  >
                    Obriši
                  </button>
                </>
              )}
            </div>
          </div>

          {answer.isHighlighted && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm font-semibold">
              ⭐ Istaknuto pitanje
            </div>
          )}

          {editing ? (
            <div className="space-y-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
                rows="12"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{editContent.length} znakova</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditContent(answer.content)
                      setError('')
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Otkaži
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition"
                  >
                    Spremi
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{answer.content}</p>
            </div>
          )}

          {answer.attachment && !editing && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="font-semibold text-gray-700">Prilog:</span>
                  <span className="text-gray-800">{answer.attachment.split('/').pop()}</span>
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
              {answer.attachment && answer.attachment.match(/\.(jpg|jpeg|png|gif)$/i) && (
                <div className="mt-4 flex justify-center">
                  <img 
                    src={answer.attachment.startsWith('http') ? answer.attachment : `${API_URL}${answer.attachment}`}
                    alt="Prilog"
                    className="max-w-full h-auto max-h-96 rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:opacity-90 transition"
                    onClick={() => setIsModalOpen(true)}
                  />
                </div>
              )}
              {answer.attachment && answer.attachment.match(/\.pdf$/i) && (
                <div className="mt-4 flex justify-center">
                  <iframe 
                    src={answer.attachment.startsWith('http') ? answer.attachment : `${API_URL}${answer.attachment}`}
                    className="w-full min-h-screen rounded-lg border border-gray-300"
                    title={answer.attachment.split('/').pop()}
                  />
                </div>
              )}
            </div>
          )}

          {/* Image Modal */}
          {isModalOpen && answer.attachment && answer.attachment.match(/\.(jpg|jpeg|png|gif)$/i) && (
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
                src={answer.attachment.startsWith('http') ? answer.attachment : `${API_URL}${answer.attachment}`}
                alt="Prilog"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
