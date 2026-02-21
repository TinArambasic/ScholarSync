import React, { useState, useEffect } from 'react'
import StudyTypeCard from '../components/StudyTypeCard'
import QuestionCard from '../components/QuestionCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import api from '../api'
import { API_URL } from '../config'
import { useAuth } from '../context/AuthContext'
import { usePageLoading } from '../hooks/usePageLoading'

export default function Home(){
  const [questions, setQuestions] = useState([])
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({users:0, questions:0, answers:0, courses:15})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ questions: [], users: [], courses: [] })
  const [isSearching, setIsSearching] = useState(false)
  const { user } = useAuth()
  const isLoading = usePageLoading()

  // Poll stats always (visible even if user not logged in)
  useEffect(() => {
    let mounted = true

    async function fetchStats(){
      try{
        const [uRes, qRes, aRes, cRes] = await Promise.all([
          api.get('/api/users'),
          api.get('/api/questions'),
          api.get('/api/answers'),
          api.get('/api/courses')
        ])

        if(!mounted) return

        const usersData = uRes.data || []
        const questionsData = qRes.data || []
        const answersData = aRes.data || []
        const coursesData = cRes.data || []

        setCourses(coursesData)
        setStats({ users: usersData.length, questions: questionsData.length, answers: answersData.length, courses: coursesData.length })
      } catch(err){
        console.warn('Ne mogu dohvatiti statistiku', err)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  // Fetch recent questions only when user is logged in
  useEffect(() => {
    if(!user){
      setQuestions([])
      return
    }

    let mounted = true

    async function fetchQuestions(){
      try{
        // fyp
        const qRes = await api.get('/api/questions', { params: { forYou: 'true' } })
        if(!mounted) return
        const sorted = (qRes.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setQuestions(sorted.slice(0,6))
      } catch(err){
        console.warn('Ne mogu dohvatiti pitanja', err)
        if(!mounted) return
        setQuestions([])
      }
    }

    fetchQuestions()
    const interval = setInterval(fetchQuestions, 5000)
    return () => { mounted = false; clearInterval(interval) }
  }, [user])

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ questions: [], users: [], courses: [] })
      return
    }

    let mounted = true
    setIsSearching(true)

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/api/search', { params: { q: searchQuery } })
        if (mounted) {
          setSearchResults(res.data)
        }
      } catch (err) {
        console.warn('Search error:', err)
        if (mounted) setSearchResults({ questions: [], users: [], courses: [] })
      } finally {
        if (mounted) setIsSearching(false)
      }
    }, 300)

    return () => { mounted = false; clearTimeout(timer) }
  }, [searchQuery])

  const studyTypes = [
    { id: 'preddiplomski', name: 'Prijediplomski studij', description: 'Osnovni programi matematike i računarstva', programs: 2 },
    { id: 'diplomski', name: 'Diplomski studij', description: 'Specijalizirani programi i nastavnički studij', programs: 3 }
  ]

  const getCourseName = (courseId) => {
    const course = courses.find(c => c._id === courseId)
    return course ? course.title : courseId
  }

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Zajednica znanja za<br />
                <span className="text-secondary-400">mathos studente</span>
              </h1>
              <p className="text-lg text-primary-100 max-w-lg">
                Postavljaj pitanja, dijeli znanje i rastite zajedno. Platforma za studente Fakulteta primijenjene matematike i informatike Osijek.
              </p>
              <div className="flex gap-4 pt-4">
                <a href="#study-types" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 backdrop-blur-sm">
                  Pregledaj programe
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {user ? (
        <>
          {/* Search */}
          <section className="bg-white border-b border-gray-200 py-8 px-4 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="10" cy="10" r="6" />
              <line x1="14" y1="14" x2="20" y2="20" strokeLinecap="round" />
            </svg>
            <input 
              type="text" 
              id="searchInput" 
              placeholder="Pretraži ScholarSync" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition text-lg shadow-sm" 
            />
            
            {/* Search Results Dropdown */}
            {searchQuery && (searchResults.questions.length > 0 || searchResults.users.length > 0 || searchResults.courses.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                
                {/* Questions */}
                {searchResults.questions.length > 0 && (
                  <div className="border-b border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Pitanja</h3>
                    <div className="space-y-2">
                      {searchResults.questions.map(q => (
                        <a 
                          key={q._id}
                          href={`/questions/${q._id}`}
                          onClick={() => setSearchQuery('')}
                          className="block p-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                        >
                          <div className="font-medium text-gray-800 text-sm truncate">{q.title}</div>
                          <div className="text-xs text-gray-500 mt-1">od {q.author.username} • {q.courseName}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Users */}
                {searchResults.users.length > 0 && (
                  <div className="border-b border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Korisnici</h3>
                    <div className="space-y-2">
                      {searchResults.users.map(u => (
                        <a 
                          key={u._id}
                          href={`/users/${u._id}`}
                          onClick={() => setSearchQuery('')}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                        >
                          {u.profilePicture ? (
                            <img src={u.profilePicture.startsWith('http') ? u.profilePicture : `${API_URL}${u.profilePicture}`} alt={u.username} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{u.username.charAt(0).toUpperCase()}</div>
                          )}
                          <span className="text-sm font-medium text-gray-800">{u.username}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Courses */}
                {searchResults.courses.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Kolegiji</h3>
                    <div className="space-y-2">
                      {searchResults.courses.map(c => (
                        <a 
                          key={c._id}
                          href={`/courses/${c._id}`}
                          onClick={() => setSearchQuery('')}
                          className="block p-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                        >
                          <div className="font-medium text-gray-800 text-sm">{c.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{c.description || 'Nema opisa'}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Study Types */}
      <section id="study-types" className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Vrste studija
            </h2>
            <span className="text-sm text-gray-500">Odaberite vrstu studija za pregled programa</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="studyTypesGrid">
            {studyTypes.map(st => <StudyTypeCard key={st.id} id={st.id} name={st.name} description={st.description} programs={st.programs} />)}
          </div>
        </div>
      </section>

      {/* For You Questions */}
      <section className="py-12 px-4 bg-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Pitanja
            </h2>
            <a href="/questions" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
              Sva pitanja →
            </a>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Nema pitanja još</h3>
              <p className="text-gray-500 mb-6">Pridružite se kolegijima da vidite pitanja koja vas zanimaju</p>
              <a href="#study-types" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                Pregledaj kolegije
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="recentQuestions">
              {questions.map(q => (
                <QuestionCard key={q._id} id={q._id} title={q.title} content={q.content} author={q.author.username} authorId={q.userId} course={getCourseName(q.courseId)} date={new Date(q.createdAt).toLocaleString()} answersCount={q.answersCount || 0} isCompleted={q.isCompleted} />
              ))}
            </div>
          )}
        </div>
      </section>
        </>
      ) : (
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Trebate pristup?</h2>
            <p className="text-gray-600 mb-8">Prijavite se kako biste vidjeli pitanja.</p>
            <a href="/login" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-bold inline-block">
              Prijava sada
            </a>
          </div>
        </section>
      )}
      <section className="py-12 px-4 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-secondary-400" id="statUsers">{stats.users}</div>
              <div className="text-sm text-primary-200">Registriranih studenata</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-secondary-400" id="statQuestions">{stats.questions}</div>
              <div className="text-sm text-primary-200">Postavljenih pitanja</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-secondary-400" id="statAnswers">{stats.answers}</div>
              <div className="text-sm text-primary-200">Odgovora</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-secondary-400" id="statCourses">{stats.courses}</div>
              <div className="text-sm text-primary-200">Kolegija</div>
            </div>
          </div>
        </div>
      </section>
    </main>
      )}
    </>
  )
}
