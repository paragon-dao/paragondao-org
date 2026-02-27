import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'

export default function ModeToggle({ mode, onToggle }) {
  const { isDark } = useTheme()
  const isSimulation = mode === 'simulation'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          display: 'inline-flex',
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          borderRadius: '12px',
          padding: '4px',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        {['simulation', 'production'].map((m) => (
          <button
            key={m}
            onClick={() => onToggle(m)}
            style={{
              position: 'relative',
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.02em',
              textTransform: 'capitalize',
              background: mode === m
                ? (m === 'simulation' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)')
                : 'transparent',
              color: mode === m
                ? '#fff'
                : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'),
              transition: 'all 0.2s ease',
            }}
          >
            {m === 'simulation' ? '⚡ Simulation' : '🔒 Production'}
          </button>
        ))}
      </div>
      {isSimulation && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '12px',
            color: '#f59e0b',
            fontWeight: '500',
          }}
        >
          Simulation mode — all data is mock, no backend required
        </motion.div>
      )}
    </div>
  )
}
