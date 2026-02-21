import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'

export default function AskQuestion() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isLoading = usePageLoading()
  
  const [course, setCourse] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    loadCourse()
  }, [courseId, user, navigate])

  async function loadCourse() {
    try {
      const res = await api.get('/api/courses')
      const foundCourse = res.data.find(c => c._id === courseId)
      if (foundCourse) {
        setCourse(foundCourse)
      }
    } catch (err) {
      console.error('Error loading course:', err)
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
    
    if (!newTitle.trim() || !newContent.trim()) {
      setError('Naslov i sadržaj su obavezni')
      return
    }
    
    setSubmitting(true)
    setError('')
    
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
      
      navigate(`/courses/${courseId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri kreiranju pitanja')
    } finally {
      setSubmitting(false)
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
              onClick={() => navigate(courseId ? `/courses/${courseId}` : '/questions')}
              className="text-sm text-primary-600 hover:text-primary-700 mb-6 inline-block"
            >
              ← Natrag
            </button>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Postavi novo pitanje</h1>
              <p className="text-gray-600 mb-6">
                {course ? `Kolegij: ${course.title}` : 'Postavi pitanje na forum'}
              </p>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Naslov pitanja
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Naslov"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Najmanje 5 znakova</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Detaljni sadržaj pitanja
                  </label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Opis"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
                    rows="7"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Najmanje 10 znakova</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dodaj datoteku (opciono)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
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
                    {submitting ? 'Postavljanje...' : 'Postavi pitanje'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(courseId ? `/courses/${courseId}` : '/questions')}
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
