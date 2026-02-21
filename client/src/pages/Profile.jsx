import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { API_URL } from '../config'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isLoading = usePageLoading()
  
  const [stats, setStats] = useState({ questionsCount: 0, answersCount: 0 })
  const [userCourses, setUserCourses] = useState([])
  const [userQuestions, setUserQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState([])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    loadUserData()
  }, [user, navigate])

  async function loadUserData() {
    try {
      const [questionsRes, answersRes, coursesRes] = await Promise.all([
        api.get('/api/questions'),
        api.get('/api/answers'),
        api.get('/api/courses')
      ])
      
      const questions = questionsRes.data.filter(q => q.userId === user._id)
      const answers = answersRes.data.filter(a => a.userId === user._id)
      
      setUserQuestions(questions)
      setUserAnswers(answers)
      
      setStats({
        questionsCount: questions.length,
        answersCount: answers.length
      })
      
      if (user.joinedCourses && user.joinedCourses.length > 0) {
        const courses = coursesRes.data.filter(c => user.joinedCourses.includes(c._id))
        setUserCourses(courses)
      }
    } catch (err) {
      console.error('Error loading user data:', err)
    }
  }



  if (!user) return null

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header */}
              <div className="p-8 pb-0">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil</h1>
                  <p className="text-gray-600">Upravljajte vašim računom i podacima</p>
                </div>

                {/* User Info Card */}
                <div className="mb-6 p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {user.profilePicture ? (
                    <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${API_URL}${user.profilePicture}`} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                  <p className="text-gray-600 capitalize">{user.role || 'student'}</p>
                </div>
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition shadow-sm"
                  title="Uredi profil"
                >
                  ✏️
                </button>
              </div>

                  {/* Bio */}
                  {user.bio && (
                    <div className="mb-4 p-3 bg-white rounded-lg">
                      <p className="text-gray-700 text-sm">{user.bio}</p>
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
                <div className="space-y-8" id="content-section">
                  {/* Joined Courses */}
                  {userCourses.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Pridruženi kolegiji</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {userCourses.map(course => (
                          <Link
                            key={course._id}
                            to={`/courses/${course._id}`}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-md transition block"
                          >
                            <div className="font-semibold text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-600">{course._id} • {course.year}. godina</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Questions */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Moja pitanja ({userQuestions.length})
                    </h3>
                    {userQuestions.length === 0 ? (
                      <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                        Niste još postavili nijedno pitanje
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userQuestions.slice(0, 5).map(question => (
                          <Link
                            key={question._id}
                            to={`/questions/${question._id}`}
                            className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition"
                          >
                            <h4 className="font-semibold text-gray-900 mb-2">{question.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
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
                        {userQuestions.length > 5 && (
                          <div className="text-center text-sm text-gray-500 pt-2">
                            i još {userQuestions.length - 5} pitanja...
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Answers */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Moji odgovori ({userAnswers.length})
                    </h3>
                    {userAnswers.length === 0 ? (
                      <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                        Niste još dali nijedan odgovor
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userAnswers.slice(0, 5).map(answer => (
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
                        {userAnswers.length > 5 && (
                          <div className="text-center text-sm text-gray-500 pt-2">
                            i još {userAnswers.length - 5} odgovora...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Logout Button */}
                <div className="flex justify-end pt-8 border-t border-gray-200">
                  <button
                    onClick={() => { 
                      localStorage.removeItem('authToken')
                      localStorage.removeItem('currentUser')
                      navigate('/login')
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Odjava
                  </button>
                </div>
            </div>
          </div>
            </div>
          </div>
      )}
    </>
  )
}
