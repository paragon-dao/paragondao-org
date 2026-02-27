import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'
import { BreathingCapture } from '../agent/breathing-capture'
import { BreathingAuth } from '../agent/breathing-auth'

const BreathingEnrollment = ({ onComplete }) => {
  const { isDark } = useTheme()
  const [phase, setPhase] = useState('intro') // intro | capturing | processing | done | error
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const captureRef = useRef(null)
  const authRef = useRef(null)

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#64748b'

  useEffect(() => {
    return () => {
      if (captureRef.current) captureRef.current.destroy()
    }
  }, [])

  const startEnrollment = async () => {
    setPhase('capturing')
    setProgress(0)
    setError(null)

    try {
      captureRef.current = new BreathingCapture()
      await captureRef.current.init()

      authRef.current = new BreathingAuth()

      const audio = await captureRef.current.capture('enroll', (p) => {
        setProgress(p)
      })

      setPhase('processing')

      const result = await authRef.current.enroll(audio)

      if (result.success) {
        setPhase('done')
        setTimeout(() => {
          if (onComplete) onComplete(result)
        }, 1500)
      } else {
        setError(result.error || 'Enrollment failed')
        setPhase('error')
      }
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }

  // Progress ring
  const ringSize = 200
  const strokeWidth = 8
  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: isDark ? 'rgba(30, 30, 50, 0.9)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px',
        border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`,
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
        maxWidth: '480px',
        margin: '0 auto',
        textAlign: 'center'
      }}
    >
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🫁</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: textPrimary, margin: '0 0 12px 0' }}>
              Create Your Breathing Identity
            </h2>
            <p style={{ fontSize: '16px', color: textSecondary, lineHeight: '1.6', margin: '0 0 24px 0' }}>
              Breathe naturally for 30 seconds. Your breathing pattern becomes your unique identity —
              Frequency coefficients that authenticate you and monitor your health.
            </p>
            <p style={{ fontSize: '14px', color: textSecondary, margin: '0 0 32px 0' }}>
              Find a quiet space. Breathe normally through your nose.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startEnrollment}
              style={{
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
              }}
            >
              Begin Enrollment
            </motion.button>
          </motion.div>
        )}

        {phase === 'capturing' && (
          <motion.div key="capturing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ position: 'relative', width: ringSize, height: ringSize, margin: '0 auto 24px' }}>
              <svg width={ringSize} height={ringSize} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background ring */}
                <circle
                  cx={ringSize / 2} cy={ringSize / 2} r={radius}
                  fill="none"
                  stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                  strokeWidth={strokeWidth}
                />
                {/* Progress ring */}
                <circle
                  cx={ringSize / 2} cy={ringSize / 2} r={radius}
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center text */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#6366f1' }}>
                  {Math.round(progress * 30)}s
                </div>
                <div style={{ fontSize: '13px', color: textSecondary }}>of 30s</div>
              </div>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: '0 0 8px 0' }}>
              Breathe Naturally
            </h3>
            <p style={{ fontSize: '14px', color: textSecondary, margin: 0 }}>
              Capturing your breathing frequency pattern...
            </p>

            {/* Animated breathing indicator */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '12px', height: '12px',
                borderRadius: '50%',
                background: '#10b981',
                margin: '16px auto 0',
                boxShadow: '0 0 20px rgba(16,185,129,0.5)'
              }}
            />
          </motion.div>
        )}

        {phase === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: '0 0 8px 0' }}>
              Encoding Your Identity
            </h3>
            <p style={{ fontSize: '14px', color: textSecondary, margin: 0 }}>
              Frequency-domain encoding → encrypted vault
            </p>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', margin: '0 0 8px 0' }}>
              Identity Created
            </h3>
            <p style={{ fontSize: '14px', color: textSecondary, margin: 0 }}>
              Your personal AI is now active. Redirecting to dashboard...
            </p>
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#f87171', margin: '0 0 8px 0' }}>
              Enrollment Failed
            </h3>
            <p style={{ fontSize: '14px', color: textSecondary, margin: '0 0 24px 0' }}>
              {error}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPhase('intro')}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default BreathingEnrollment
