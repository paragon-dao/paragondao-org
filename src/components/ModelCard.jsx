import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'

const ModelCard = ({
  name,
  accuracy,
  modality,
  status = 'available',
  comparison,
  sampleInfo,
  actionLabel = 'Learn More',
  onAction,
  delay = 0
}) => {
  const { isDark } = useTheme()

  const statusConfig = {
    available: { label: 'Available', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
    research: { label: 'Research', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', color: '#6366f1' },
    coming_soon: { label: 'Coming Soon', bg: 'rgba(156,163,175,0.15)', border: 'rgba(156,163,175,0.3)', color: '#9ca3af' }
  }

  const s = statusConfig[status] || statusConfig.coming_soon
  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#64748b'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.3)'}`,
        boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, margin: 0 }}>{name}</h4>
        <span style={{
          padding: '4px 10px',
          background: s.bg,
          border: `1px solid ${s.border}`,
          borderRadius: '100px',
          fontSize: '11px',
          fontWeight: '600',
          color: s.color,
          whiteSpace: 'nowrap'
        }}>
          {s.label}
        </span>
      </div>

      {/* Accuracy */}
      {accuracy && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {accuracy}
          </span>
          <span style={{ fontSize: '14px', color: textSecondary }}>accuracy</span>
        </div>
      )}

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '13px', color: textSecondary }}>
          <strong style={{ color: textPrimary }}>Modality:</strong> {modality}
        </div>
        {comparison && (
          <div style={{ fontSize: '13px', color: textSecondary }}>
            <strong style={{ color: textPrimary }}>vs. Clinical:</strong> {comparison}
          </div>
        )}
        {sampleInfo && (
          <div style={{ fontSize: '13px', color: textSecondary }}>
            {sampleInfo}
          </div>
        )}
      </div>

      {/* Action */}
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          style={{
            marginTop: 'auto',
            padding: '10px 16px',
            background: status === 'available'
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: status === 'available' ? '#fff' : textSecondary,
            border: status === 'available' ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}

export default ModelCard
