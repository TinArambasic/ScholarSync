import React, { useEffect, useState } from 'react'
import YearCard from '../components/YearCard'
import QuestionCard from '../components/QuestionCard'
import api from '../api'
import feather from 'feather-icons'
import { useAuth } from '../context/AuthContext'

export default function Home(){
  const [questions, setQuestions] = useState([])
  const [stats, setStats] = useState({users:0, questions:0, answers:0, courses:15})
  const { user } = useAuth()

  useEffect(() => {
    // Run feather replace once on mount
    feather.replace()
  }, [])

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
        const qRes = await api.get('/api/questions')
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

  const years = [
    { id: 1, name: '1. godina', description: 'Osnove matematike i programiranja', courses: 11 },
    { id: 2, name: '2. godina', description: 'Napredna matematika i računarstvo', courses: 18 },
    { id: 3, name: '3. godina', description: 'Specijalizacija i završni projekti', courses: 12 }
  ]

  return (
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
                Postavljaj pitanja, dijeli znanje i rastite zajedno. Platforma za studente matematike i računarstva na Fakultetu primijenjene matematike i informatike Osijek.
              </p>
              <div className="flex gap-4 pt-4">
                <a href="#years" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 backdrop-blur-sm">
                  <i data-feather="book-open" className="w-5 h-5"></i>
                  Pregledaj kolegije
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
            <i data-feather="search" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></i>
            <input type="text" id="searchInput" placeholder="Pretraži pitanja po naslovu, sadržaju ili kolegiju..." 
                   className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition text-lg shadow-sm" />
          </div>
        </div>
      </section>

      {/* Years */}
      <section id="years" className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <i data-feather="layers" className="text-primary-600"></i>
              Godine studija
            </h2>
            <span className="text-sm text-gray-500">Odaberite godinu za pregled kolegija</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="yearsGrid">
            {years.map(y => <YearCard key={y.id} year={y.id} name={y.name} description={y.description} courses={y.courses} />)}
          </div>
        </div>
      </section>

      {/* Recent Questions */}
      <section className="py-12 px-4 bg-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <i data-feather="message-circle" className="text-primary-600"></i>
              Najnovija pitanja
            </h2>
            <a href="/questions" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
              Sva pitanja <i data-feather="arrow-right" className="w-4 h-4"></i>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="recentQuestions">
            {questions.map(q => (
              <QuestionCard key={q._id} id={q._id} title={q.title} content={q.content} author={q.author.username} course={q.courseId} date={new Date(q.createdAt).toLocaleString()} answersCount={q.answersCount || 0} />
            ))}
          </div>
        </div>
      </section>
        </>
      ) : (
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Trebate pristup?</h2>
            <p className="text-gray-600 mb-8">Prijavite se kako biste vidjeli godine studija i pitanja od kolegija.</p>
            <a href="/login" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold inline-block">
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
  )
}
