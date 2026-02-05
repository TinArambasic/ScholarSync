import React from 'react'
import { Link } from 'react-router-dom'

export default function QuestionCard({ id, title, content, author, course, date, answersCount }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h5 className="font-bold text-lg"><Link to={`/questions/${id}`} className="text-primary-600 hover:text-primary-700">{title}</Link></h5>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{course}</span>
      </div>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{content}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>{author} • {date}</div>
        <div className="text-green-600 font-semibold">{answersCount} odgovora</div>
      </div>
    </div>
  )
}
