import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../providers/ThemeProvider'

const ProofNarrative = () => {
  const { isDark } = useTheme()

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : '#64748b'
  const cardBg = isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.6)'
  const cardBorder = isDark ? 'rgba(99,102,241,0.2)' : 'rgba(0, 0, 0, 0.08)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      {/* Headline */}
      <div style={{
        fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
        color: '#10b981', textTransform: 'uppercase', textAlign: 'center',
        marginBottom: '8px',
      }}>
        THE FIRST SENTINEL
      </div>
      <h2 style={{
        fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
        fontWeight: '800', textAlign: 'center', margin: '0 0 8px 0',
        background: isDark
          ? 'linear-gradient(135deg, #fff, #a5b4fc)'
          : 'linear-gradient(135deg, #1e293b, #6366f1)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }} key={isDark ? 'pd' : 'pl'}>
        The Great Salt Lake Proved It Works
      </h2>
      <p style={{
        textAlign: 'center', color: textSecondary, margin: '0 auto 12px',
        fontSize: '15px', maxWidth: '600px', lineHeight: '1.6',
      }}>
        Three independent nodes — Hydro, Atmo, Wind — each watching a different line of evidence.
        The first environmental health sentinel on the network.
      </p>
      <p style={{
        textAlign: 'center', color: textMuted, margin: '0 auto 28px',
        fontSize: '13px', maxWidth: '460px', lineHeight: '1.5', fontStyle: 'italic',
      }}>
        Not because the lake is the only body that matters — because every network needs
        a first proof. This is ours.
      </p>

      {/* Core comparison — the loudest visual */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 'clamp(16px, 4vw, 40px)', marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Single Model
          </div>
          <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: '800', color: '#6366f1', lineHeight: 1 }}>
            81%
          </div>
          <div style={{ fontSize: '12px', color: textSecondary }}>26/32 events</div>
        </div>
        <div style={{
          fontSize: '24px', fontWeight: '800', color: '#f59e0b',
          padding: '8px 16px', borderRadius: '10px',
          background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.05)',
        }}>
          →
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Network
          </div>
          <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: '800', color: '#10b981', lineHeight: 1 }}>
            91%
          </div>
          <div style={{ fontSize: '12px', color: textSecondary }}>29/32 events &middot; 0 lost</div>
        </div>
      </div>

      {/* PM10=375 story */}
      <div style={{
        padding: '20px', borderRadius: '14px',
        background: isDark ? 'rgba(239, 68, 68, 0.06)' : 'rgba(239, 68, 68, 0.03)',
        border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'}`,
        marginBottom: '20px',
      }}>
        <div style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
          color: '#ef4444', textTransform: 'uppercase', marginBottom: '6px',
        }}>
          THE EVENT THAT PROVES THE NETWORK
        </div>
        <p style={{ fontSize: '14px', color: textPrimary, lineHeight: '1.7', margin: '0 0 6px 0' }}>
          <strong style={{ color: '#ef4444' }}>March 1, 2024 — PM10 hit 375 &micro;g/m&sup3;</strong>.
          Nearly 5x the EPA threshold. A single model missed it completely. Three independent nodes
          caught it through consensus.
        </p>
        <p style={{ fontSize: '13px', color: textSecondary, margin: 0, lineHeight: '1.5' }}>
          Not a simulation — measured on historical EPA data.
        </p>
      </div>

      {/* Bridge — from GSL to YOU */}
      <div style={{
        padding: '20px', borderRadius: '14px',
        background: isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.02)',
        border: `1px solid ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'}`,
      }}>
        <div style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
          color: '#6366f1', textTransform: 'uppercase', marginBottom: '10px',
        }}>
          WHY THIS MATTERS WHEREVER YOU ARE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            {
              text: 'Every drying lake, polluted airshed, or flood-prone river can have its own sentinel — same architecture.',
              color: '#10b981',
            },
            {
              text: 'The network encodes your air quality, weather, and pollutants into a 128-number fingerprint — the same math that reads the lake.',
              color: '#6366f1',
            },
            {
              text: 'Add your breathing and the network sees both layers: the air outside and the lungs inside. When pollution spikes and your breathing shifts, it connects the dots and warns you before symptoms hit.',
              color: '#8b5cf6',
            },
          ].map((item, i) => (
            <p key={i} style={{
              fontSize: '13px', color: textSecondary, lineHeight: '1.6', margin: 0,
              paddingLeft: '12px', borderLeft: `3px solid ${item.color}`,
            }}>
              {item.text}
            </p>
          ))}
        </div>
        <p style={{
          fontSize: '14px', color: textPrimary, lineHeight: '1.5',
          margin: '14px 0 0 0', textAlign: 'center', fontWeight: '600',
        }}>
          Every body is a frequency. The sentinel proved it. Your body is next.
        </p>
      </div>
    </motion.div>
  )
}

export default ProofNarrative
