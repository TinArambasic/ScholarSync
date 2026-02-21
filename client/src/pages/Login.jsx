import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isPageLoading = usePageLoading()
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleLogin(e){
    e.preventDefault()
    setError('')
    setLoading(true)

    try{
      const res = await api.post('/api/login', { username, password })
      if(res.data.success){
        login(res.data.user, res.data.token)
        navigate('/')
      } else {
        setError(res.data.message || 'Greška pri prijavi')
      }
    } catch(err){
      setError('Greška pri prijavi: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {isPageLoading ? (
        <LoadingSkeleton />
      ) : (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Prijava</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Unesite vaše podatke za prijavu</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Korisničko ime</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Unesite korisničko ime"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lozinka</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Unesite lozinku"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Prijava u tijeku...' : 'Prijava'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">ili</span></div>
          </div>

          <Link to="/register" className="w-full block text-center bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
            Registriraj se
          </Link>
        </div>
      </div>
    </main>
      )}
    </>
  )
}
