import React from 'react'

export default function AnswerCard({ content, author, date, role, highlighted }) {
  return (
    <div className={`card mb-3 ${highlighted ? 'border-warning' : ''}`}>
      <div className="card-body">
        {highlighted && <div className="badge bg-warning text-dark mb-2">Istaknuto</div>}
        <p className="card-text">{content}</p>
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted">{author} • {date} {role && <span className="badge bg-light text-dark ms-2">{role}</span>}</div>
        </div>
      </div>
    </div>
  )
}
