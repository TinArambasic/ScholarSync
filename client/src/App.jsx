import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Questions from './pages/Questions'
import QuestionDetail from './pages/QuestionDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import YearCourses from './pages/YearCourses'
import StudyPrograms from './pages/StudyPrograms'
import ProgramCourses from './pages/ProgramCourses'
import CourseQuestions from './pages/CourseQuestions'
import AskQuestion from './pages/AskQuestion'
import AddAnswer from './pages/AddAnswer'
import AnswerDetail from './pages/AnswerDetail'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import EditProfile from './pages/EditProfile'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/questions" element={<Questions />} />
              <Route path="/questions/:id" element={<QuestionDetail />} />
              <Route path="/questions/:id/answer" element={<AddAnswer />} />
              <Route path="/answers/:id" element={<AnswerDetail />} />
              <Route path="/years/:year" element={<YearCourses />} />
              <Route path="/programs/:studyType/:programId/years/:year" element={<YearCourses />} />
              <Route path="/study-types/:studyType" element={<StudyPrograms />} />
              <Route path="/programs/:studyType/:programId" element={<ProgramCourses />} />
              <Route path="/courses/:courseId" element={<CourseQuestions />} />
              <Route path="/courses/:courseId/ask" element={<AskQuestion />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/users/:userId" element={<UserProfile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ErrorBoundary>
    </AuthProvider>
  )
}
