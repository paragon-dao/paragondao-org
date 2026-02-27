import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'

export default function ValidationProgress({ validators, overallProgress }) {
  const { isDark } = useTheme()

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const barBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Overall progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: textPrimary }}>
            Overall Verification
          </span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#6366f1' }}>
            {overallProgress}%
          </span>
        </div>
        <div style={{
          height: '8px',
          borderRadius: '4px',
          background: barBg,
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Individual validators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {validators.map((v) => (
          <div key={v.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: v.status === 'complete'
                    ? '#10b981'
                    : v.status === 'running'
                      ? '#6366f1'
                      : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'),
                  ...(v.status === 'running' && {
                    boxShadow: '0 0 8px rgba(99,102,241,0.5)',
                  }),
                }} />
                <span style={{ fontSize: '13px', fontWeight: '500', color: textPrimary }}>
                  {v.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: 'rgba(245,158,11,0.1)',
                  color: '#f59e0b',
                  fontWeight: '600',
                }}>
                  {v.stake}
                </span>
                <span style={{ fontSize: '11px', color: textSecondary }}>
                  {v.location}
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: v.status === 'complete' ? '#10b981' : '#6366f1',
                  minWidth: '36px',
                  textAlign: 'right',
                }}>
                  {v.progress}%
                </span>
              </div>
            </div>
            <div style={{
              height: '4px',
              borderRadius: '2px',
              background: barBg,
              overflow: 'hidden',
            }}>
              <motion.div
                style={{
                  height: '100%',
                  borderRadius: '2px',
                  background: v.status === 'complete'
                    ? '#10b981'
                    : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                }}
                animate={{ width: `${v.progress}%` }}
                transition={{ duration: 0.2, ease: 'linear' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
