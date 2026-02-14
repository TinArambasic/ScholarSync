import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { API_URL } from '../config'
import AnswerCard from '../components/AnswerCard'

export default function QuestionDetail(){
  const { id } = useParams()
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  if(!question) return <div className="container py-5">Učitavanje...</div>

  return (
    <div className="container py-5 mx-auto max-w-3xl">
      <h2>{question.title}</h2>
      <p className="text-muted">{question.author.username} • {new Date(question.createdAt).toLocaleString()}</p>
      <div className="mb-4">{question.content}</div>
      
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
                className="w-full h-96 rounded-lg border border-gray-300"
                title={question.attachment.originalName}
              />
            </div>
          )}
        </div>
      )}

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

      <h4>Odgovori</h4>
      {answers.map(a => <AnswerCard key={a._id} content={a.content} author={a.author.username} date={new Date(a.createdAt).toLocaleString()} role={a.author.role} highlighted={a.isHighlighted} />)}
    </div>
  )
}
