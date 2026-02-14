import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    try{ return JSON.parse(localStorage.getItem('currentUser')) || null } catch(e){ return null }
  })
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('authToken') || null
  })

  // Keep localStorage in sync
  useEffect(() => {
    if(user) localStorage.setItem('currentUser', JSON.stringify(user))
    else localStorage.removeItem('currentUser')
  }, [user])
  
  useEffect(() => {
    if(token) localStorage.setItem('authToken', token)
    else localStorage.removeItem('authToken')
  }, [token])

  // Listen to storage events (sync across tabs)
  useEffect(() => {
    function onStorage(e){
      if(e.key === 'currentUser'){
        try{ setUser(JSON.parse(e.newValue)) } catch { setUser(null) }
      }
      if(e.key === 'authToken'){
        setToken(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function login(u, t){ 
    setUser(u)
    setToken(t)
  }
  
  function logout(){ 
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){ return useContext(AuthContext) }
