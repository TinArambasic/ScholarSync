import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { API_URL } from '../config'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'
import { useAuth } from '../context/AuthContext'

export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isLoading = usePageLoading()
  
  const [profileUser, setProfileUser] = useState(null)
  const [stats, setStats] = useState({ questionsCount: 0, answersCount: 0 })
  const [userQuestions, setUserQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState([])
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    // If user is viewing their own profile, redirect to /profile
    if (user && userId === user._id) {
      navigate('/profile')
      return
    }
    loadUserProfile()
  }, [userId, user, navigate])

  async function loadUserProfile() {
    try {
      const [usersRes, questionsRes, answersRes, coursesRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/questions'),
        api.get('/api/answers'),
        api.get('/api/courses')
      ])
      
      // Find the user by ID
      const user = usersRes.data.find(u => u._id === userId)
      if (!user) {
        setError('Korisnik nije pronađen')
        return
      }
      
      setProfileUser(user)
      setCourses(coursesRes.data)
      
      // Filter user's questions and answers
      const questions = questionsRes.data.filter(q => q.userId === userId)
      const answers = answersRes.data.filter(a => a.userId === userId)
      
      setUserQuestions(questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      setUserAnswers(answers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      
      setStats({
        questionsCount: questions.length,
        answersCount: answers.length
      })
    } catch (err) {
      console.error('Error loading user profile:', err)
      setError('Greška pri učitavanju profila')
    }
  }

  const getCourseName = (courseId) => {
    const course = courses.find(c => c._id === courseId)
    return course ? course.title : courseId
  }

  if (isLoading) return <LoadingSkeleton />
  if (error) return <div className="container mx-auto py-8 text-red-600 text-center">{error}</div>
  if (!profileUser) return <LoadingSkeleton />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil korisnika</h1>
            </div>

            {/* User Info Card */}
            <div className="mb-6 p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {profileUser.profilePicture ? (
                    <img src={profileUser.profilePicture.startsWith('http') ? profileUser.profilePicture : `${API_URL}${profileUser.profilePicture}`} alt={profileUser.username} className="w-full h-full object-cover" />
                  ) : (
                    profileUser.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{profileUser.username}</h2>
                  <p className="text-gray-600 capitalize">{profileUser.role || 'student'}</p>
                </div>
              </div>

              {/* Bio */}
              {profileUser.bio && (
                <div className="mb-4 p-3 bg-white rounded-lg">
                  <p className="text-gray-700 text-sm">{profileUser.bio}</p>
                </div>
              )}
              
              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-3xl font-bold text-primary-600">{stats.questionsCount}</div>
                  <div className="text-sm text-gray-600">Postavljenih pitanja</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{stats.answersCount}</div>
                  <div className="text-sm text-gray-600">Danih odgovora</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-8">
              {/* User Questions */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Pitanja ({userQuestions.length})
                </h3>
                {userQuestions.length === 0 ? (
                  <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                    Ovaj korisnik nije postavio nijedno pitanje
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userQuestions.map(question => (
                      <Link
                        key={question._id}
                        to={`/questions/${question._id}`}
                        className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">{question.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{getCourseName(question.courseId)}</span>
                          <span>•</span>
                          <span>{new Date(question.createdAt).toLocaleDateString('hr-HR')}</span>
                          <span>•</span>
                          <span>{question.answersCount} odgovora</span>
                          {question.isCompleted && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 font-semibold">✓ Dovršeno</span>
                            </>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* User Answers */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Odgovori ({userAnswers.length})
                </h3>
                {userAnswers.length === 0 ? (
                  <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                    Ovaj korisnik nije dao nijedno odgovore
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userAnswers.map(answer => (
                      <Link
                        key={answer._id}
                        to={`/questions/${answer.questionId}`}
                        className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition"
                      >
                        <p className="text-gray-700 mb-2 line-clamp-2">{answer.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{new Date(answer.createdAt).toLocaleDateString('hr-HR')}</span>
                          {answer.isHighlighted && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 font-semibold">✓ Istaknut odgovor</span>
                            </>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
