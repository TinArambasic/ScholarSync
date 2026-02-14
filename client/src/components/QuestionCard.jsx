import React from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../config'

export default function QuestionCard({ id, title, content, author, course, date, answersCount, attachment }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h5 className="font-bold text-lg"><Link to={`/questions/${id}`} className="text-primary-600 hover:text-primary-700">{title}</Link></h5>
          {attachment && (
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Ima prilog">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </div>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{course}</span>
      </div>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{content}</p>
      
      {attachment?.mimetype?.startsWith('image/') && (
        <div className="mb-3">
          <img 
            src={`${API_URL}${attachment.path}`}
            alt={attachment.originalName}
            className="w-full h-32 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}
      
      {attachment?.mimetype === 'application/pdf' && (
        <div className="mb-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              <path d="M8 10a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 018 10zm0 3a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 018 13z" />
            </svg>
            <span className="text-sm font-semibold text-red-700">PDF Prilog</span>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>{author} • {date}</div>
        <div className="text-green-600 font-semibold">{answersCount} odgovora</div>
      </div>
    </div>
  )
}
