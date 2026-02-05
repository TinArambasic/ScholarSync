import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('currentUser')) || null } catch(e){ return null }
  })

  // Keep localStorage in sync
  useEffect(() => {
    if(user) localStorage.setItem('currentUser', JSON.stringify(user))
    else localStorage.removeItem('currentUser')
  }, [user])

  // Listen to storage events (sync across tabs)
  useEffect(() => {
    function onStorage(e){
      if(e.key === 'currentUser'){
        try{ setUser(JSON.parse(e.newValue)) } catch { setUser(null) }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function login(u){ setUser(u) }
  function logout(){ setUser(null) }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){ return useContext(AuthContext) }
