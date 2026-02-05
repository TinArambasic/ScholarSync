import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link className="font-bold text-xl text-primary-600" to="/">ScholarSync</Link>
          
          <div className="flex gap-2 items-center">
            {user ? (
              <>
                <span className="text-sm text-gray-600 px-4">{'pozdrav, ' + user.username}</span>
                <button className="text-sm bg-primary-600 text-white px-3 py-2 rounded hover:bg-primary-700" onClick={() => { logout(); navigate('/') }}>Odjava</button>
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
