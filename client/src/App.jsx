import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Questions from './pages/Questions'
import QuestionDetail from './pages/QuestionDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import YearCourses from './pages/YearCourses'
import feather from 'feather-icons'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  useEffect(() => {
    feather.replace()
  }, [])

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
            <Route path="/years/:year" element={<YearCourses />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
