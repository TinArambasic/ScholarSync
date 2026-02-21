import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { API_URL } from '../config'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { usePageLoading } from '../hooks/usePageLoading'

export default function EditProfile() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const isLoading = usePageLoading()
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    setUsername(user.username || '')
    setEmail(user.email || '')
    setBio(user.bio || '')
    if (user.profilePicture) {
      const fullUrl = user.profilePicture.startsWith('http') ? user.profilePicture : `${API_URL}${user.profilePicture}`
      setProfilePicturePreview(fullUrl)
    }
  }, [user, navigate])

  function handlePictureChange(e) {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Slika ne smije biti veća od 5MB')
        return
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Molimo uploadajte samo slike')
        return
      }
      setProfilePicture(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'UPOZORENJE: Ova radnja je nepovratna!\n\n' +
      'Jeste li apsolutno sigurni da želite obrisati vaš profil?\n\n' +
      'Ovo će trajno obrisati:\n' +
      '- Vaš korisnički račun\n' +
      '- Sva vaša pitanja\n' +
      '- Sve vaše odgovore\n' +
      '- Sve vaše podatke\n\n' +
      'Ova akcija se NE MOŽE povratiti!'
    )
    
    if (!confirmed) return
    
    const doubleConfirm = window.confirm(
      'Molimo potvrdite još jednom:\n\n' +
      'Da li ste potpuno sigurni da želite TRAJNO OBRISATI svoj profil?'
    )
    
    if (!doubleConfirm) return
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      await api.delete('/api/profile')
      
      // Clear all auth data
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      
      // Redirect to home with message
      alert('Vaš profil je uspješno obrisan.')
      window.location.href = '/'
    } catch (err) {
      console.error('Error deleting account:', err)
      setError(err.response?.data?.message || 'Greška pri brisanju profila')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'UPOZORENJE: Ova radnja je nepovratna!\n\n' +
      'Jeste li apsolutno sigurni da želite obrisati vaš profil?\n\n' +
      'Ovo će trajno obrisati:\n' +
      '- Vaš korisnički račun\n' +
      '- Sva vaša pitanja\n' +
      '- Sve vaše odgovore\n' +
      '- Sve vaše podatke\n\n' +
      'Ova akcija se NE MOŽE povratiti!'
    )
    
    if (!confirmed) return
    
    const doubleConfirm = window.confirm(
      'Molimo potvrdite još jednom:\n\n' +
      'Da li ste potpuno sigurni da želite TRAJNO OBRISATI svoj profil?'
    )
    
    if (!doubleConfirm) return
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      await api.delete('/api/profile')
      
      // Clear all auth data
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      
      // Redirect to home with message
      alert('Vaš profil je uspješno obrisan.')
      window.location.href = '/'
    } catch (err) {
      console.error('Error deleting account:', err)
      setError(err.response?.data?.message || 'Greška pri brisanju profila')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const formData = new FormData()
      
      // Add basic fields
      if (username !== user.username) {
        if (!username || username.length < 3) {
          setError('Korisničko ime mora imati najmanje 3 znakova')
          setLoading(false)
          return
        }
        formData.append('username', username)
      }
      
      if (email !== user.email) {
        if (!email || !email.includes('@')) {
          setError('Molimo unesite važeću email adresu')
          setLoading(false)
          return
        }
        formData.append('email', email)
      }
      
      if (bio !== (user.bio || '')) {
        if (bio.length > 500) {
          setError('Biografija ne smije biti duža od 500 znakova')
          setLoading(false)
          return
        }
        formData.append('bio', bio)
      }
      
      // Add profile picture if changed
      if (profilePicture) {
        // Check if it's already a base64 string (from preview) or a File object
        formData.append('profilePicture', profilePicture)
      }
      
      // Add password if provided
      if (newPassword) {
        if (newPassword.length < 6) {
          setError('Nova lozinka mora imati najmanje 6 znakova')
          setLoading(false)
          return
        }
        if (newPassword !== confirmPassword) {
          setError('Lozinke se ne podudaraju')
          setLoading(false)
          return
        }
        if (!currentPassword) {
          setError('Molimo unesite trenutnu lozinku')
          setLoading(false)
          return
        }
        formData.append('currentPassword', currentPassword)
        formData.append('newPassword', newPassword)
      }

      if (Array.from(formData.keys()).length === 0) {
        setError('Nema promjena za spremanje')
        setLoading(false)
        return
      }

      console.log('Sending form data with fields:', Array.from(formData.keys()))
      
      const res = await api.patch('/api/profile', formData)
      
      console.log('Server response:', res.data)
      
      if (res.data.success) {
        setSuccess('Profil uspješno ažuriran!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setProfilePicture(null)
        
        // Update user context
        const updatedUser = { ...user }
        if (res.data.user) {
          Object.assign(updatedUser, res.data.user)
        }
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
        
        // Osvježi stranicu nakon 1.5 sekunde da vidiš promjene
        setTimeout(() => {
          window.location.href = '/profile'
        }, 1500)
      }
    } catch (err) {
      console.error('Profile update error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Greška pri ažuriranju profila'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Natrag"
            >
              ← Natrag
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Uredi Profil</h1>
              <p className="text-gray-600">Ažurirajte vaše podatke</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Profilna slika
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview.startsWith('data:') ? profilePicturePreview : (profilePicturePreview.startsWith('http') ? profilePicturePreview : `${API_URL}${profilePicturePreview}`)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePictureChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-600 file:text-white
                      hover:file:bg-primary-700"
                  />
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF do 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Korisničko ime
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="Vaše korisničko ime"
              />
              <p className="text-xs text-gray-500 mt-1">Najmanje 3 znakova</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email adresa
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="vasa@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Biografija
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength="500"
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Napišite nešto o sebi..."
              />
              <p className="text-xs text-gray-500 mt-1">{bio.length}/500 znakova</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Promijeni lozinku</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trenutna lozinka
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    placeholder="Unesite trenutnu lozinku"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nova lozinka
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    placeholder="Nova lozinka (najmanje 6 znakova)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Potvrdi novu lozinku
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    placeholder="Ponovi novu lozinku"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Spremanje...' : 'Spremi promjene'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Poništi
              </button>
            </div>
          </form>

          {/* Delete Account Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Zona opasnosti</h3>
            <p className="text-sm text-gray-600 mb-4">
              Brisanje profila je trajna radnja koja ne može biti poništena. Svi vaši podaci, pitanja i odgovori bit će trajno obrisani.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Obriši profil
            </button>
          </div>
        </div>
      </div>
      </div>
      )}
    </>
  )
}
