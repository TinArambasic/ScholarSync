import React, { useEffect, useState } from 'react'
import QuestionCard from '../components/QuestionCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import api from '../api'
import { usePageLoading } from '../hooks/usePageLoading'

export default function Questions() {
  const [questions, setQuestions] = useState([])
  const [courses, setCourses] = useState([])
  const isLoading = usePageLoading()

  useEffect(() => {
    async function load() {
      try {
        const [qRes, cRes] = await Promise.all([
          api.get('/api/questions'),
          api.get('/api/courses')
        ])
        setCourses(cRes.data)
        const sorted = qRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setQuestions(sorted)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  const getCourseName = (courseId) => {
    const course = courses.find(c => c._id === courseId)
    return course ? course.title : courseId
  }

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="container mx-auto py-5 p-5">
      <h2 className="mb-4">Pitanja</h2>
      {questions.map(q => (
        <QuestionCard key={q._id} id={q._id} title={q.title} content={q.content} author={q.author.username} authorId={q.userId} course={getCourseName(q.courseId)} date={new Date(q.createdAt).toLocaleString()} answersCount={q.answersCount || 0} isCompleted={q.isCompleted} />
      ))}
    </div>
      )}
    </>
  )
}
