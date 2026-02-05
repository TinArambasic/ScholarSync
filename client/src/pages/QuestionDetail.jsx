import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import AnswerCard from '../components/AnswerCard'

export default function QuestionDetail(){
  const { id } = useParams()
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])

  useEffect(() => {
    async function load(){
      try{
        const q = await axios.get(`/api/questions/${id}`)
        setQuestion(q.data)
        const a = await axios.get(`/api/answers?questionId=${id}`)
        setAnswers(a.data)
      } catch(err) { console.error(err) }
    }
    load()
  }, [id])

  if(!question) return <div className="container py-5">Učitavanje...</div>

  return (
    <div className="container py-5">
      <h2>{question.title}</h2>
      <p className="text-muted">{question.author.username} • {new Date(question.createdAt).toLocaleString()}</p>
      <div className="mb-4">{question.content}</div>

      <h4>Odgovori</h4>
      {answers.map(a => <AnswerCard key={a._id} content={a.content} author={a.author.username} date={new Date(a.createdAt).toLocaleString()} role={a.author.role} highlighted={a.isHighlighted} />)}
    </div>
  )
}
