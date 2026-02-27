import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api, getAuthToken, getCurrentUser } from '../services/api'
import { useMagic } from '../providers/MagicProvider'
import { useTheme } from '../providers/ThemeProvider'

/**
 * InviteGate Component
 * Shows invite code input form for new users, magic link for returning users
 */
export default function InviteGate() {
  const { isDark } = useTheme()
  const [inviteCode, setInviteCode] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [userStatus, setUserStatus] = useState(null) // { exists, is_admin, has_account }
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const { isLoggedIn, login: magicLogin, isLoading: magicLoading } = useMagic()
  const emailCheckTimeoutRef = useRef(null)
  
  // Theme-aware colors
  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBg: isDark ? 'rgba(30, 30, 50, 0.95)' : 'rgba(255,255,255,0.95)',
    cardBorder: isDark ? 'rgba(212,160,23,0.3)' : 'rgba(184,134,11,0.2)',
    inputBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    inputBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  }

  // Check if user already has access
  useEffect(() => {
    const checkAccess = () => {
      const token = getAuthToken()
      const user = getCurrentUser()
      if (token && user) {
        navigate(redirectTo, { replace: true })
      }
    }
    const timer = setTimeout(checkAccess, 100)
    return () => clearTimeout(timer)
  }, [navigate, isLoggedIn])

  // Auto-suggest username from email (only for new users)
  useEffect(() => {
    if (email && !userStatus?.exists) {
      const emailPrefix = email.split('@')[0]
      if (!username || username === email.split('@')[0]) {
        setUsername(emailPrefix)
      }
    }
  }, [email, userStatus])

  // Check if user exists (debounced)
  useEffect(() => {
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current)
    }

    if (!email || !email.trim()) {
      setUserStatus(null)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setUserStatus(null)
      return
    }

    setIsCheckingEmail(true)
    emailCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await api.checkUserExists(email.trim())
        setUserStatus(result)
      } catch (err) {
        setUserStatus(null)
      } finally {
        setIsCheckingEmail(false)
      }
    }, 500)

    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current)
      }
    }
  }, [email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setMagicLinkSent(false)

    if (!email || !email.trim()) {
      setError('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      // Check if user exists
      const userCheck = await api.checkUserExists(email.trim())
      
      // If user exists (has account or is admin by env), send magic link
      if (userCheck.exists) {
        try {
          await magicLogin(email.trim())
          setMagicLinkSent(true)
          setError(null)
          return
        } catch (magicError) {
          setError(magicError.message || 'Failed to send magic link')
          return
        } finally {
          setIsLoading(false)
        }
      }

      // New user - require invite code
      if (!inviteCode?.trim()) {
        setError('Invite code is required for new users')
        setIsLoading(false)
        return
      }

      const trimmedCode = inviteCode.trim().toUpperCase()
      const codePattern = /^(PARAGON|DAO|ADMIN|USER|VIP)-[A-Z0-9]{4,8}-[A-Z0-9]{4,8}$/
      if (!codePattern.test(trimmedCode)) {
        setError('Invalid invite code format. Expected: PARAGON-XXXX-XXXX')
        setIsLoading(false)
        return
      }

      // Validate invite code and create user
      const result = await api.validateInvite(
        inviteCode.trim(),
        email.trim(),
        username.trim() || null
      )

      if (result.ok && result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate(redirectTo, { replace: true })
        }, 1500)
      } else {
        setError(result.error || 'Invalid invite code')
      }
    } catch (err) {
      if (err.code_already_used) {
        setError('You have already used this invite code.')
      } else {
        setError(err.message || 'Failed to process request')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (e) => {
    let value = e.target.value.toUpperCase()
    value = value.replace(/[^A-Z0-9-]/g, '')
    setInviteCode(value)
  }

  // Determine UI state
  const isReturningUser = userStatus?.exists === true
  const isNewUser = userStatus && !userStatus.exists

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: isDark
        ? 'linear-gradient(135deg, #0f0d08 0%, #1a1207 50%, #1a1a2e 100%)'
        : 'linear-gradient(135deg, #fffef9 0%, #fef9e7 50%, #f5f0e0 100%)',
      transition: 'background 0.3s ease'
    },
    wrapper: {
      width: '100%',
      maxWidth: '420px'
    },
    logoSection: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    frogGif: {
      width: '160px',
      height: '160px',
      borderRadius: '20px',
      marginBottom: '8px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: '8px'
    },
    tagline: {
      fontSize: '12px',
      color: isDark ? 'rgba(240,187,51,0.8)' : '#b8860b',
      fontWeight: '600',
      letterSpacing: '0.04em',
      marginBottom: '4px'
    },
    subtitle: {
      fontSize: '14px',
      color: colors.textMuted
    },
    card: {
      borderRadius: '20px',
      padding: '32px',
      background: colors.cardBg,
      border: `1px solid ${colors.cardBorder}`,
      backdropFilter: 'blur(20px)',
      boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    messageBox: (type) => ({
      marginBottom: '24px',
      padding: '16px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 
                  type === 'info' ? 'rgba(0, 212, 255, 0.1)' : 
                  'rgba(239, 68, 68, 0.1)',
      border: `1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 
               type === 'info' ? 'rgba(0, 212, 255, 0.3)' : 
               'rgba(239, 68, 68, 0.3)'}`
    }),
    messageText: (type) => ({
      fontSize: '14px',
      color: type === 'success' ? '#4ade80' : 
             type === 'info' ? '#22d3ee' : 
             '#f87171'
    }),
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    fieldLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#d1d5db',
      marginBottom: '8px'
    },
    required: {
      color: '#ef4444'
    },
    optional: {
      color: '#6b7280'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: (hasSuccess = false) => ({
      width: '100%',
      padding: '14px 16px',
      paddingRight: '48px',
      borderRadius: '12px',
      fontSize: '15px',
      color: colors.textPrimary,
      background: colors.inputBg,
      border: hasSuccess ? '1px solid rgba(34, 197, 94, 0.5)' : `1px solid ${colors.inputBorder}`,
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxSizing: 'border-box'
    }),
    inputIcon: {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid rgba(212, 160, 23, 0.3)',
      borderTop: '2px solid #f0bb33',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    hint: {
      marginTop: '8px',
      fontSize: '12px',
      color: '#6b7280'
    },
    hintSuccess: {
      marginTop: '8px',
      fontSize: '12px',
      color: '#4ade80'
    },
    hintInfo: {
      marginTop: '8px',
      fontSize: '12px',
      color: '#f0bb33'
    },
    divider: {
      position: 'relative',
      textAlign: 'center',
      margin: '8px 0'
    },
    dividerLine: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '1px',
      background: 'rgba(255, 255, 255, 0.1)'
    },
    dividerText: {
      position: 'relative',
      display: 'inline-block',
      padding: '0 16px',
      fontSize: '13px',
      color: '#6b7280',
      background: 'rgba(20, 20, 35, 0.95)'
    },
    button: {
      width: '100%',
      padding: '14px 20px',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      color: '#ffffff',
      background: 'linear-gradient(135deg, #f0bb33 0%, #b8860b 100%)',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(212, 160, 23, 0.3)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#6b7280'
    },
    link: {
      color: '#f0bb33',
      textDecoration: 'none'
    },
    termsText: {
      textAlign: 'center',
      fontSize: '12px',
      color: '#4b5563',
      marginTop: '24px'
    }
  }

  // Add keyframes for spinner animation
  const spinnerKeyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `

  if (magicLoading) {
    return (
      <div style={styles.container}>
        <style>{spinnerKeyframes}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            ...styles.spinner,
            width: '48px',
            height: '48px',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#9ca3af' }}>Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={styles.wrapper}
      >
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <img
            src="/social-media/paragon-frog-breathing.gif"
            alt="ParagonDAO — Breathe with us"
            style={styles.frogGif}
          />
          <h1 style={styles.title}>ParagonDAO</h1>
          <p style={styles.tagline}>The Health Economy</p>
          <p style={styles.subtitle}>Your breathing is your key. Connect to the global health network.</p>
        </div>

        {/* Login Card */}
        <div style={styles.card}>
          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.messageBox('success')}
            >
              <svg width="20" height="20" fill="none" stroke="#4ade80" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span style={styles.messageText('success')}>Access granted! Redirecting...</span>
            </motion.div>
          )}

          {/* Magic Link Sent Message */}
          {magicLinkSent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.messageBox('info')}
            >
              <svg width="20" height="20" fill="none" stroke="#22d3ee" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span style={styles.messageText('info')}>Magic link sent! Check your email to login.</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.messageBox('error')}
            >
              <span style={styles.messageText('error')}>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email Field */}
            <div>
              <label style={styles.fieldLabel}>
                Email <span style={styles.required}>*</span>
              </label>
              <div style={styles.inputWrapper}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading || success || magicLinkSent}
                  style={{
                    ...styles.input(isReturningUser),
                    opacity: (isLoading || success || magicLinkSent) ? 0.5 : 1
                  }}
                />
                {isCheckingEmail && (
                  <div style={styles.inputIcon}>
                    <div style={styles.spinner}></div>
                  </div>
                )}
                {!isCheckingEmail && isReturningUser && (
                  <div style={styles.inputIcon}>
                    <svg width="20" height="20" fill="none" stroke="#4ade80" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
              {isReturningUser && (
                <p style={styles.hintSuccess}>✓ Welcome back! Click Continue to receive a magic link</p>
              )}
              {isNewUser && (
                <p style={styles.hintInfo}>📝 New user - enter your invite code below</p>
              )}
            </div>

            {/* Divider and Invite Fields (only show for new users) */}
            {isNewUser && (
              <>
                <div style={styles.divider}>
                  <div style={styles.dividerLine}></div>
                  <span style={styles.dividerText}>New user registration</span>
                </div>

                {/* Invite Code Field */}
                <div>
                  <label style={styles.fieldLabel}>
                    Invite Code <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={handleCodeChange}
                    placeholder="PARAGON-XXXX-XXXX"
                    maxLength={20}
                    disabled={isLoading || success}
                    style={{
                      ...styles.input(),
                      fontFamily: 'monospace',
                      opacity: (isLoading || success) ? 0.5 : 1
                    }}
                  />
                  <p style={styles.hint}>Format: PARAGON-XXXX-XXXX</p>
                </div>

                {/* Username Field */}
                <div>
                  <label style={styles.fieldLabel}>
                    Username <span style={styles.optional}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    disabled={isLoading || success}
                    style={{
                      ...styles.input(),
                      opacity: (isLoading || success) ? 0.5 : 1
                    }}
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || success || !email || magicLinkSent || (isNewUser && !inviteCode?.trim())}
              style={{
                ...styles.button,
                ...(isLoading || success || !email || magicLinkSent || (isNewUser && !inviteCode?.trim()) 
                  ? styles.buttonDisabled 
                  : {})
              }}
            >
              {isLoading ? (
                <>
                  <div style={{ ...styles.spinner, width: '18px', height: '18px' }}></div>
                  {isReturningUser ? 'Sending magic link...' : 'Creating account...'}
                </>
              ) : success ? (
                'Access Granted! ✓'
              ) : magicLinkSent ? (
                'Magic Link Sent ✓'
              ) : isReturningUser ? (
                'Continue with Magic Link'
              ) : isNewUser ? (
                'Join ParagonDAO'
              ) : (
                'Continue'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div style={styles.footer}>
            <button 
              onClick={() => setShowAccessModal(true)}
              style={{
                ...styles.link,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              How does the invite protocol work?
            </button>
          </div>
        </div>
      </motion.div>

      {/* Access Protocol Modal */}
      {showAccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px'
          }}
          onClick={() => setShowAccessModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.98), rgba(30, 30, 50, 0.98))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAccessModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: colors.cardBorder,
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <img
                src="/social-media/paragon-frog-breathing.gif"
                alt="ParagonDAO"
                style={{ width: '80px', height: '80px', borderRadius: '16px', margin: '0 auto 20px', display: 'block' }}
              />
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: '8px'
              }}>
                ParagonDAO Invite Protocol
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#9ca3af',
                lineHeight: '1.6'
              }}>
                How access to the network works
              </p>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '32px' }}>
              {/* Step 1 */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '20px',
                padding: '16px',
                background: 'rgba(212, 160, 23, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(212, 160, 23, 0.2)'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f0bb33, #b8860b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.textPrimary
                }}>
                  1
                </div>
                <div>
                  <h4 style={{ color: colors.textPrimary, fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                    Invite-Based Access
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.5' }}>
                    ParagonDAO operates on an invite protocol. Network admins invite new users and admins 
                    by generating unique invite codes that can be used once.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '20px',
                padding: '16px',
                background: 'rgba(45, 212, 191, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(45, 212, 191, 0.2)'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.textPrimary
                }}>
                  2
                </div>
                <div>
                  <h4 style={{ color: colors.textPrimary, fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                    Current Phase: Evangelist-Curated
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.5' }}>
                    During this bootstrap phase, network evangelists invite new members to ensure 
                    the community grows with passionate participants who share the vision.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                background: 'rgba(212, 160, 23, 0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(212, 160, 23, 0.15)'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4a017, #b8860b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors.textPrimary
                }}>
                  3
                </div>
                <div>
                  <h4 style={{ color: colors.textPrimary, fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                    Future: Community Governance
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.5' }}>
                    Once the network is officially deployed, the community will be able to vote on 
                    adding new users and admins through our DAO governance mechanism—true 
                    decentralized decision-making.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div style={{
              background: 'rgba(212, 160, 23, 0.1)',
              border: '1px solid rgba(212, 160, 23, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#9ca3af',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                Reach out to one of our evangelists for invite codes at{' '}
                <a
                  href="mailto:contact@paragondao.org"
                  style={{ color: '#f0bb33', textDecoration: 'none' }}
                >
                  contact@paragondao.org
                </a>
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowAccessModal(false)}
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: colors.textPrimary,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
