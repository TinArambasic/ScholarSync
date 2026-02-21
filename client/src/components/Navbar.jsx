import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link className="font-bold text-xl text-primary-600 flex items-center gap-2" to="/">
            <img src="/ScholarSync%20Logo.png" alt="ScholarSync Logo" className="w-8 h-8" />
            ScholarSync
          </Link>
          
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <Link to="/profile" className="flex gap-3 items-center border p-1 bg-white rounded-lg shadow-md hover:border-primary-500 transition">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-200">
                    {user.profilePicture ? (
                      <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${API_URL}${user.profilePicture}`} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{user.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">{user.username}</span>
                </Link>
              </>
            ) : (
              <>
                <Link className="text-sm bg-primary-600 text-white px-3 py-2 rounded hover:bg-primary-700" to="/login">Prijava</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
