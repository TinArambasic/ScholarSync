import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'

export default function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isLoading = usePageLoading()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    async function loadNotifications() {
      try {
        const res = await api.get('/api/notifications')
        setNotifications(res.data || [])
      } catch (err) {
        console.warn('Ne mogu dohvatiti notifikacije', err)
      }
    }

    loadNotifications()
  }, [user, navigate])

  const markRead = async (id) => {
    setNotifications((prev) => prev.map((note) => (note._id === id ? { ...note, read: true } : note)))
    try {
      await api.patch(`/api/notifications/${id}`, { read: true })
    } catch (err) {
      console.warn('Ne mogu označiti notifikaciju kao pročitanu', err)
    }
  }

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((note) => ({ ...note, read: true })))
    try {
      await api.post('/api/notifications/read-all')
    } catch (err) {
      console.warn('Ne mogu označiti sve notifikacije kao pročitane', err)
    }
  }

  const unreadCount = notifications.filter((note) => !note.read).length

  if (!user) return null

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="container max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Notifikacije</h1>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Označi kao pročitano
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  Nema notifikacija.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((note) => (
                    <Link
                      key={note._id}
                      to={note.link}
                      onClick={() => markRead(note._id)}
                      className={`block px-6 py-4 hover:bg-gray-50 transition ${note.read ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{note.message}</div>
                          <div className="text-xs text-gray-500 mt-1">{new Date(note.createdAt).toLocaleString()}</div>
                        </div>
                        {!note.read && (
                          <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-semibold">
                            Novo
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
