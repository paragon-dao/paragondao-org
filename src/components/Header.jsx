import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useMagic } from '../providers/MagicProvider'
import { useTheme } from '../providers/ThemeProvider'
import { getCurrentUser, removeAuthToken, api } from '../services/api'

const Header = ({ 
  searchQuery, 
  lastSearchedTerm, 
  setSearchQuery, 
  handleSearch, 
  isSearching, 
  isSearchExpanded,
  setIsSearchExpanded,
  isAuthenticated,
  onLoginClick,
  onSignupClick
}) => {
  const navigate = useNavigate()
  const { logout } = useMagic()
  const { theme, isDark, toggleTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const currentUser = getCurrentUser()

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => {
    setShowMobileMenu(false)
  }, [navigate])

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !currentUser) {
        setIsAdmin(false)
        return
      }
      try {
        const result = await api.checkAdmin()
        setIsAdmin(result.is_admin === true)
      } catch (err) {
        setIsAdmin(false)
      }
    }
    checkAdminStatus()
  }, [isAuthenticated, currentUser])

  const handleLogout = async () => {
    await logout()
    removeAuthToken()
    setShowUserMenu(false)
    setShowMobileMenu(false)
    navigate('/')
  }

  const handleNavClick = (path) => {
    navigate(path)
    setShowMobileMenu(false)
  }
  
  // Navigation items
  const navItems = [
    { label: 'Environment', path: '/' },
    { label: 'Health', path: '/health' },
    { label: 'Models', path: '/models' },
    { label: 'Apps', path: '/apps' },
    { label: 'Exchange', path: '/exchange' },
    { label: 'Network', path: '/network' },
    { label: 'Verify', path: '/verify' },
    { label: 'Essays', path: '/essays' },
    { label: 'Whitepaper', path: '/docs/THE_HEALTH_ECONOMY.html', external: true }
  ]

  // Unified nav link style
  const navLinkStyle = {
    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 0',
    transition: 'color 0.2s ease',
    whiteSpace: 'nowrap'
  }
  
  const navLinkHoverColor = isDark ? '#a5b4fc' : '#6366f1'

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: isDark 
          ? 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.95) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 16px',
          height: '64px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <Link 
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              transition: 'opacity 0.2s ease'
            }}
          >
            {/* Frog Logo Mark */}
            <img
              src="/favicon.svg"
              alt="ParagonDAO"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                flexShrink: 0,
                boxShadow: '0 4px 16px rgba(212, 160, 23, 0.3)'
              }}
            />
            {/* Logo Text - hide on very small screens */}
            <div style={{ display: isMobile ? 'none' : 'block' }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: isDark ? '#fff' : '#1e293b',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                transition: 'color 0.3s ease'
              }}>
                ParagonDAO
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: isDark ? 'rgba(240,187,51,0.8)' : '#b8860b',
                fontWeight: '500',
                letterSpacing: '0.02em',
                transition: 'color 0.3s ease'
              }}>
                The Health Economy
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - hidden on mobile */}
          {!isMobile && (
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px'
            }}>
              {navItems.map((item) => (
                item.external ? (
                  <a 
                    key={item.path}
                    href={item.path}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={navLinkStyle}
                    onMouseEnter={(e) => e.target.style.color = navLinkHoverColor}
                    onMouseLeave={(e) => e.target.style.color = navLinkStyle.color}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link 
                    key={item.path}
                    to={item.path}
                    style={navLinkStyle}
                    onMouseEnter={(e) => e.target.style.color = navLinkHoverColor}
                    onMouseLeave={(e) => e.target.style.color = navLinkStyle.color}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>
          )}

          {/* Right Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* Desktop Theme Toggle - always visible */}
            {!isMobile && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  padding: 0,
                  transition: 'background 0.2s ease, border-color 0.2s ease',
                }}
              >
                {isDark ? '☀️' : '🌙'}
              </motion.button>
            )}

            {/* Desktop: Auth Buttons / Mobile: Show in menu */}
            {!isMobile && (
              <>
                {/* Divider */}
                <div style={{
                  width: '1px',
                  height: '24px',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                }} />

                {/* Auth Buttons */}
                {isAuthenticated ? (
                  <div style={{ position: 'relative' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        color: isDark ? '#fff' : '#1e293b',
                        borderRadius: '8px',
                        border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {(currentUser?.email || currentUser?.username || 'U')[0].toUpperCase()}
                      </div>
                      <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentUser?.username || currentUser?.email?.split('@')[0] || 'User'}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            minWidth: '180px',
                            background: isDark ? 'rgba(20, 20, 35, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                            borderRadius: '12px',
                            padding: '8px',
                            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.12)',
                            backdropFilter: 'blur(20px)',
                            zIndex: 1000
                          }}
                        >
                          <div style={{
                            padding: '12px',
                            borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                            marginBottom: '8px'
                          }}>
                            <p style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#64748b', marginBottom: '4px' }}>Signed in as</p>
                            <p style={{ fontSize: '14px', color: isDark ? '#fff' : '#1e293b', fontWeight: '500', wordBreak: 'break-all' }}>
                              {currentUser?.email || 'User'}
                            </p>
                          </div>
                          <button
                            onClick={() => { navigate('/forge'); setShowUserMenu(false); }}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: 'transparent',
                              border: 'none',
                              borderRadius: '8px',
                              color: isDark ? '#d1d5db' : '#475569',
                              fontSize: '14px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => e.target.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                              <path d="M2 17l10 5 10-5"/>
                              <path d="M2 12l10 5 10-5"/>
                            </svg>
                            The Forge
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => { navigate('/admin'); setShowUserMenu(false); }}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                color: isDark ? '#d1d5db' : '#475569',
                                fontSize: '14px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                              onMouseEnter={(e) => e.target.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                              onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 4.5v15m7.5-7.5h-15"/>
                              </svg>
                              Admin Dashboard
                            </button>
                          )}
                          <button
                            onClick={toggleTheme}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: 'transparent',
                              border: 'none',
                              borderRadius: '8px',
                              color: isDark ? '#d1d5db' : '#475569',
                              fontSize: '14px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                            onMouseEnter={(e) => e.target.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {isDark ? '🌙' : '☀️'} Theme
                            </span>
                            <span style={{
                              padding: '2px 8px',
                              background: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(251,191,36,0.2)',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: isDark ? '#a5b4fc' : '#fbbf24'
                            }}>
                              {isDark ? 'Dark' : 'Light'}
                            </span>
                          </button>
                          <button
                            onClick={handleLogout}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: 'transparent',
                              border: 'none',
                              borderRadius: '8px',
                              color: isDark ? '#f87171' : '#dc2626',
                              fontSize: '14px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                              <polyline points="16,17 21,12 16,7"/>
                              <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onLoginClick}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Login
                    </motion.button>
                  </>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                style={{
                  width: '40px',
                  height: '40px',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  position: 'relative'
                }}
              >
                {showMobileMenu ? (
                  // X icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#fff' : '#1e293b'} strokeWidth="2.5" strokeLinecap="round">
                    <line x1="4" y1="4" x2="20" y2="20" />
                    <line x1="20" y1="4" x2="4" y2="20" />
                  </svg>
                ) : (
                  // Hamburger icon
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                    <line x1="0" y1="1" x2="18" y2="1" stroke={isDark ? '#fff' : '#1e293b'} strokeWidth="2" strokeLinecap="round" />
                    <line x1="0" y1="7" x2="18" y2="7" stroke={isDark ? '#fff' : '#1e293b'} strokeWidth="2" strokeLinecap="round" />
                    <line x1="0" y1="13" x2="18" y2="13" stroke={isDark ? '#fff' : '#1e293b'} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobile && showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              top: '64px',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 99
            }}
            onClick={() => setShowMobileMenu(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobile && showMobileMenu && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '64px',
              right: 0,
              bottom: 0,
              width: '280px',
              background: isDark 
                ? 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              borderLeft: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(0,0,0,0.08)',
              zIndex: 100,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background 0.3s ease'
            }}
          >
            {/* User Section */}
            {isAuthenticated && currentUser && (
              <div style={{
                padding: '20px',
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#fff'
                  }}>
                    {(currentUser?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: isDark ? '#fff' : '#1e293b', fontWeight: '600', fontSize: '14px', margin: 0 }}>
                      {currentUser?.username || currentUser?.email?.split('@')[0] || 'User'}
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0, wordBreak: 'break-all' }}>
                      {currentUser?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav style={{ padding: '16px', flex: 1 }}>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    if (item.external) {
                      window.open(item.path, '_blank')
                    } else {
                      handleNavClick(item.path)
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
                    fontSize: '15px',
                    fontWeight: '500',
                    textAlign: 'left',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.label}
                  {item.external && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', opacity: 0.5 }}>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  )}
                </button>
              ))}

              {/* Admin Link */}
              {isAdmin && (
                <button
                  onClick={() => handleNavClick('/admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 16px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '10px',
                    color: '#a5b4fc',
                    fontSize: '15px',
                    fontWeight: '600',
                    textAlign: 'left',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Admin Dashboard
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '14px 16px',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '10px',
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
                  fontSize: '15px',
                  fontWeight: '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginTop: '16px'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isDark ? '🌙' : '☀️'} Theme
                </span>
                <span style={{
                  padding: '4px 10px',
                  background: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(251,191,36,0.2)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDark ? '#a5b4fc' : '#fbbf24'
                }}>
                  {isDark ? 'Dark' : 'Light'}
                </span>
              </button>
            </nav>

            {/* Auth Actions */}
            <div style={{
              padding: '16px',
              borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              marginTop: 'auto'
            }}>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    color: '#f87171',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => { onLoginClick(); setShowMobileMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.3)'
                  }}
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
