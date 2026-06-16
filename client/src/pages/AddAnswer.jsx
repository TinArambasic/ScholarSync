import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'

export default function AddAnswer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isLoading = usePageLoading()
  
  const [question, setQuestion] = useState(null)
  const [content, setContent] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    loadQuestion()
  }, [id, user, navigate])

  async function loadQuestion() {
    try {
      const res = await api.get(`/api/questions/${id}`)
      setQuestion(res.data)
    } catch (err) {
      console.error('Error loading question:', err)
      setError('Ne mogu dohvatiti pitanje')
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    setSelectedFile(file)
    
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Sadržaj odgovora je obavezan')
      return
    }
    
    if (content.trim().length < 10) {
      setError('Odgovor mora imati najmanje 10 znakova')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('content', content.trim())
      formData.append('questionId', id)
      
      if (selectedFile) {
        formData.append('attachment', selectedFile)
      }
      
      await api.post('/api/answers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      navigate(`/questions/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri kreiranju odgovora')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSuggestAnswer() {
    if (!question) return

    setSuggesting(true)
    setError('')

    try {
      const res = await api.post('/api/answers/suggest', {
        questionId: id,
        draftContent: content.trim()
      })

      const suggestion = res.data?.suggestion?.trim()
      if (!suggestion) {
        setError('Nije moguće generirati prijedlog odgovora')
        return
      }

      setContent(suggestion)
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri generiranju prijedloga odgovora')
    } finally {
      setSuggesting(false)
    }
  }

  if (!user) return null

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="container mx-auto max-w-2xl">
            <button
              onClick={() => navigate(`/questions/${id}`)}
              className="text-sm text-primary-600 hover:text-primary-700 mb-6 inline-block"
            >
              ← Natrag na pitanje
            </button>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dodaj odgovor</h1>
              
              {question && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Odgovoriš na:</p>
                  <h2 className="text-xl font-semibold text-gray-900">{question.title}</h2>
                  <p className="text-gray-600 text-sm mt-2">Od: {question.author.username}</p>
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tvoj odgovor
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Vaš odgovor..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
                    rows="8"
                    required
                  />
                  <div className="flex justify-between items-center mt-2 gap-3">
                    <p className="text-xs text-gray-500">Najmanje 10 znakova</p>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-600">{content.length} znakova</p>
                      <button
                        type="button"
                        onClick={handleSuggestAnswer}
                        disabled={suggesting || submitting}
                        className="text-xs px-3 py-1.5 border border-primary-300 text-primary-700 rounded-md hover:bg-primary-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggesting ? 'Generiram...' : 'Predloži odgovor'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dodaj datoteku (opciono)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition cursor-pointer"
                  />
                  
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      📎 Odabrano: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  )}
                  
                  {previewUrl && (
                    <div className="mt-4">
                      <img src={previewUrl} alt="Preview" className="h-48 w-auto rounded-lg border border-gray-200" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Slanje...' : 'Pošalji odgovor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/questions/${id}`)}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Otkaži
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      )}
    </>
  )
}
