import React from 'react'
import { Link } from 'react-router-dom'

export default function AnswerCard({ id, content, author, authorId, date, role, highlighted, hasAttachment, isQuestionAuthor }) {
  return (
    <Link to={`/answers/${id}`} className="block mb-3 p-2 border rounded-lg hover:shadow-lg">
      <div className={`card ${highlighted ? 'border-warning' : ''}  transition`}>
        <div className="card-body">
          {highlighted && <div className="badge bg-warning text-dark mb-2">Istaknuto</div>}
          <p className="card-text text-gray-700 hover:text-primary-600 transition">{content}</p>
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted text-sm">
              
              {' • '}{date} {role && <span className="badge bg-light text-dark ms-2">{role}</span>}
              {hasAttachment && (
                <span className="ms-1 text-primary-600">
                  <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </span>
              )}
              {authorId ? (
                <Link to={`/users/${authorId}`} onClick={(e) => e.stopPropagation()} className="text-primary-600 hover:text-primary-700 font-medium">
                  {author}
                </Link>
              ) : (
                author
              )}
              {isQuestionAuthor && (
                <span className="ms-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold">
                  Autor pitanja
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

