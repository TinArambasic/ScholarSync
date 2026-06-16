import React, { useState } from 'react'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'

export default function Register(){
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isPageLoading = usePageLoading()
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleRegister(e){
    e.preventDefault()
    setError('')

    if(password.length < 6) return setError('Lozinka mora imati najmanje 6 znakova')
    if(password !== confirm) return setError('Lozinke se ne podudaraju')

    setLoading(true)
    try{
      const res = await api.post('/api/register', { username, email, password })
      if(res.data.success){
        // Auto-login after register
        login(res.data.user, res.data.token)
        navigate('/')
      } else {
        setError(res.data.message || 'Greška pri registracij')
      }
    } catch(err){
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {isPageLoading ? (
        <LoadingSkeleton />
      ) : (
        <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow">
          <h2 className="text-2xl font-bold mb-2 text-center">Registracija</h2>
          <p className="text-sm text-gray-500 mb-6 text-center">Napravite račun da biste pristupili kolegijima i pitanjima</p>

          {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Korisničko ime</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lozinka</label>
              <div className="relative">
                <input type={showPasswords ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pr-12 px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-200" />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPasswords ? 'Sakrij lozinku' : 'Prikazi lozinku'}
                >
                  {showPasswords ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.477 10.477a3 3 0 004.243 4.243" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.093A9.96 9.96 0 0112 5c5 0 9.27 3.11 11 7-0.74 1.667-2.08 3.111-3.78 4.167" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.228 6.228C4.197 7.373 2.723 9.083 1 12c1.73 3.89 6 7 11 7 1.2 0 2.36-0.2 3.45-0.57" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12c1.73-3.89 6-7 11-7s9.27 3.11 11 7c-1.73 3.89-6 7-11 7S2.73 15.89 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Potvrdite lozinku</label>
              <div className="relative">
                <input type={showPasswords ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="w-full pr-12 px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-primary-200" />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPasswords ? 'Sakrij lozinku' : 'Prikazi lozinku'}
                >
                  {showPasswords ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.477 10.477a3 3 0 004.243 4.243" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 5.093A9.96 9.96 0 0112 5c5 0 9.27 3.11 11 7-0.74 1.667-2.08 3.111-3.78 4.167" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.228 6.228C4.197 7.373 2.723 9.083 1 12c1.73 3.89 6 7 11 7 1.2 0 2.36-0.2 3.45-0.57" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12c1.73-3.89 6-7 11-7s9.27 3.11 11 7c-1.73 3.89-6 7-11 7S2.73 15.89 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button disabled={loading} className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold">
              {loading ? 'Registracija...' : 'Registriraj se'}
            </button>
          </form>

          <div className="mt-4 text-sm text-center text-gray-600">
            Već imate račun? <Link to="/login" className="text-primary-200 font-semibold">Prijava</Link>
          </div>
        </div>
      </div>
    </main>
      )}
    </>
  )
}
