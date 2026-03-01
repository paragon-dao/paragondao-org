import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'

const CERTIFICATION_COLORS = {
  platinum: { color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', label: 'Platinum' },
  gold: { color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', label: 'Gold' },
  silver: { color: '#94a3b8', gradient: 'linear-gradient(135deg, #94a3b8, #64748b)', label: 'Silver' },
  bronze: { color: '#d97706', gradient: 'linear-gradient(135deg, #d97706, #b45309)', label: 'Bronze' },
  pending: { color: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280, #4b5563)', label: 'Pending' },
}

export default function AppCard({ app, index = 0 }) {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const tier = CERTIFICATION_COLORS[app.certificationTier] || CERTIFICATION_COLORS.pending

  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const accentColor = isDark ? '#34d399' : '#059669'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.12)' }}
      onClick={() => navigate(`/apps/${app.id}`)}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
      }}
    >
      {/* Certification tier color strip */}
      <div style={{ height: '3px', background: tier.gradient, width: '100%' }} />

      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, margin: '0 0 4px' }}>
              {app.name}
            </h3>
            <p style={{ fontSize: '12px', color: textSecondary, margin: 0 }}>
              by {app.builder}
            </p>
          </div>
          <div style={{
            padding: '4px 10px',
            borderRadius: '20px',
            background: `${tier.color}20`,
            color: tier.color,
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {tier.label}
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '13px',
          color: textSecondary,
          lineHeight: '1.5',
          margin: '0 0 16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {app.description}
        </p>

        {/* Models used */}
        {app.models && app.models.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {app.models.map((model, i) => (
              <span key={i} style={{
                padding: '3px 8px',
                borderRadius: '6px',
                background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                color: isDark ? '#a5b4fc' : '#6366f1',
                fontSize: '11px',
                fontWeight: '600',
              }}>
                {model}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: textSecondary }}>
          {app.category && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: accentColor }}>&#9679;</span> {app.category}
            </span>
          )}
          {app.hardware && (
            <span>{app.hardware}</span>
          )}
          {app.status === 'live' && (
            <span style={{ color: accentColor, fontWeight: '600' }}>Live</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
