import React, { createContext, useContext, useState, useEffect } from 'react'
import { Magic } from 'magic-sdk'
import { api, setAuthToken, setCurrentUser, removeAuthToken } from '../services/api'

// Magic instance (singleton)
let magic = null

// Initialize Magic (client-side only)
const getMagic = () => {
  if (typeof window === 'undefined') return null
  
  if (!magic) {
    const apiKey = import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY
    
    if (!apiKey) {
      console.error('❌ Magic publishable key not found')
      return null
    }
    
    try {
      magic = new Magic(apiKey)
      console.log('✅ Magic SDK initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Magic.link:', error)
      return null
    }
  }
  
  return magic
}

// Magic context
const MagicContext = createContext(null)

export function MagicProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const magicInstance = getMagic()

  // Initialize and check for existing login
  useEffect(() => {
    const initMagic = async () => {
      try {
        // First check localStorage for existing token
        const existingToken = localStorage.getItem('sso_token') || localStorage.getItem('paragondao_token')
        if (existingToken) {
          try {
            const result = await api.getMe()
            if (result.user) {
              setUser(result.user)
              setIsLoggedIn(true)
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.log('Existing token invalid, checking Magic...')
            removeAuthToken()
          }
        }

        // Check Magic.link authentication
        if (magicInstance) {
          try {
            const isAuthenticated = await magicInstance.user.isLoggedIn()
            
            if (isAuthenticated) {
              const userInfo = await magicInstance.user.getInfo()
              const magicToken = await magicInstance.user.getIdToken()
              
              // Exchange Magic token for our SSO token
              try {
                const loginResult = await api.login(userInfo.email, magicToken)
                if (loginResult.access_token) {
                  setUser(loginResult.user)
                  setIsLoggedIn(true)
                }
              } catch (ssoError) {
                console.warn('SSO exchange failed:', ssoError)
                // Still set user from Magic
                setUser({
                  email: userInfo.email,
                  id: userInfo.issuer
                })
                setIsLoggedIn(true)
              }
            }
          } catch (error) {
            console.error('Error checking Magic authentication:', error)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initMagic()
  }, [magicInstance])

  // Check for auth changes periodically (for Magic Link callback)
  useEffect(() => {
    if (!magicInstance) return

    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = await magicInstance.user.isLoggedIn()
        
        if (isAuthenticated && !isLoggedIn) {
          const userInfo = await magicInstance.user.getInfo()
          const magicToken = await magicInstance.user.getIdToken()
          
          // Exchange for SSO token
          try {
            const loginResult = await api.login(userInfo.email, magicToken)
            if (loginResult.access_token) {
              setUser(loginResult.user)
              setIsLoggedIn(true)
            }
          } catch (e) {
            setUser({ email: userInfo.email, id: userInfo.issuer })
            setIsLoggedIn(true)
          }
        } else if (!isAuthenticated && isLoggedIn && !localStorage.getItem('sso_token')) {
          setUser(null)
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
      }
    }

    // Check on mount and periodically
    checkAuthStatus()
    const interval = setInterval(checkAuthStatus, 10000)
    
    return () => clearInterval(interval)
  }, [magicInstance, isLoggedIn])

  // Check on window focus
  useEffect(() => {
    const handleFocus = async () => {
      if (magicInstance && !isLoggedIn) {
        try {
          const isAuthenticated = await magicInstance.user.isLoggedIn()
          if (isAuthenticated) {
            const userInfo = await magicInstance.user.getInfo()
            const magicToken = await magicInstance.user.getIdToken()
            
            const loginResult = await api.login(userInfo.email, magicToken)
            if (loginResult.access_token) {
              setUser(loginResult.user)
              setIsLoggedIn(true)
            }
          }
        } catch (error) {
          console.error('Error checking auth on focus:', error)
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [magicInstance, isLoggedIn])

  // Login with Magic Link
  const login = async (email) => {
    if (!magicInstance) {
      throw new Error('Magic not initialized')
    }

    try {
      setIsLoading(true)
      
      // Send Magic Link (user clicks link in email)
      await magicInstance.auth.loginWithMagicLink({ email })
      
      console.log('✅ Magic Link sent!')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true)
      
      if (magicInstance) {
        try {
          await magicInstance.user.logout()
        } catch (e) {
          console.warn('Magic logout error:', e)
        }
      }
      
      // Clear our tokens
      removeAuthToken()
      
      setUser(null)
      setIsLoggedIn(false)
      
      console.log('✅ Logged out')
    } catch (error) {
      console.error('Logout error:', error)
      removeAuthToken()
      setUser(null)
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    magic: magicInstance,
    user,
    isLoggedIn,
    isLoading,
    setUser,
    setIsLoggedIn,
    login,
    logout
  }

  return (
    <MagicContext.Provider value={value}>
      {children}
    </MagicContext.Provider>
  )
}

export function useMagic() {
  const context = useContext(MagicContext)
  if (!context) {
    // Fallback during HMR
    if (import.meta.hot) {
      return {
        magic: null,
        user: null,
        isLoggedIn: false,
        isLoading: false,
        setUser: () => {},
        setIsLoggedIn: () => {},
        login: async () => {},
        logout: async () => {}
      }
    }
    throw new Error('useMagic must be used within a MagicProvider')
  }
  return context
}










