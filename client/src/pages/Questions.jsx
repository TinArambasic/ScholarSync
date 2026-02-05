import React, { useEffect, useState } from 'react'
import QuestionCard from '../components/QuestionCard'
import axios from 'axios'

export default function Questions() {
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/api/questions')
        setQuestions(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <div className="container py-5">
      <h2 className="mb-4">Pitanja</h2>
      {questions.map(q => (
        <QuestionCard key={q._id} id={q._id} title={q.title} content={q.content} author={q.author.username} course={q.courseId} date={new Date(q.createdAt).toLocaleString()} answersCount={q.answersCount || 0} />
      ))}
    </div>
  )
}
