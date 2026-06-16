import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config'
import { io } from 'socket.io-client'
import api from '../api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications, setNotifications] = useState([])
  const [toasts, setToasts] = useState([])
  const toastTimersRef = useRef(new Map())

  const unreadCount = notifications.filter((note) => !note.read).length

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    logout()
    navigate('/')
  }

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setToasts([])
      return
    }

    const token = localStorage.getItem('authToken')
    if (!token) return

    let mounted = true

    async function loadNotifications() {
      try {
        const res = await api.get('/api/notifications')
        if (mounted) {
          setNotifications(res.data || [])
        }
      } catch (err) {
        console.warn('Ne mogu dohvatiti notifikacije', err)
      }
    }

    loadNotifications()

    const socket = io(API_URL, { auth: { token } })

    socket.on('notification', (payload) => {
      const normalized = { ...payload, read: payload.read ?? false }
      setNotifications((prev) => [normalized, ...prev].slice(0, 50))
      setToasts((prev) => [normalized, ...prev].slice(0, 5))
      const timeoutId = setTimeout(() => {
        setToasts((prev) => prev.filter((note) => note._id !== normalized._id))
        toastTimersRef.current.delete(normalized._id)
      }, 4000)
      toastTimersRef.current.set(normalized._id, timeoutId)
    })

    return () => {
      mounted = false
      toastTimersRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
      toastTimersRef.current.clear()
      socket.disconnect()
    }
  }, [user, location.pathname])

  const markRead = async (id) => {
    setNotifications((prev) => prev.map((note) => (note._id === id ? { ...note, read: true } : note)))
    try {
      await api.patch(`/api/notifications/${id}`, { read: true })
    } catch (err) {
      console.warn('Ne mogu oznaciti notifikaciju kao procitanu', err)
    }
  }

  const dismissToast = (id) => {
    const timeoutId = toastTimersRef.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      toastTimersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((note) => note._id !== id))
  }

  return (
    <nav className="bg-white border-b border-gray-200  shadow-sm">
      <div className="container max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link className="font-bold text-xl text-primary-600 flex items-center gap-2" to="/">
            <img src="/ScholarSync%20Logo.png" alt="ScholarSync Logo" className="w-8 h-8" />
            ScholarSync
          </Link>
          
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <Link
                  to="/notifications"
                  className="relative w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm hover:border-primary-500 transition"
                  aria-label="Notifikacije"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.91V4a1 1 0 10-2 0v1.09A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
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
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[1000] flex flex-col gap-3">
          {toasts.map((toast) => (
            <div key={toast._id} className="toast w-80">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{toast.message}</div>
                  <button
                    onClick={() => {
                      markRead(toast._id)
                      dismissToast(toast._id)
                      navigate(toast.link)
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold mt-2"
                  >
                    Otvori
                  </button>
                </div>
                <button
                  onClick={() => dismissToast(toast._id)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Zatvori"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}
