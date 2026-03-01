import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import { STATUS_CONFIG } from '../data/verifyModels'
import CertificationBadge from './CertificationBadge'

export default function VerifyModelCard({ model }) {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const statusCfg = STATUS_CONFIG[model.status] || STATUS_CONFIG.pending
  const acc = model.accuracy

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/verify/${model.id}`)}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Header: name + tier */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, margin: '0 0 4px 0' }}>
            {model.shortName || model.name}
          </h3>
          <div style={{ fontSize: '12px', color: textSecondary }}>{model.modality}</div>
        </div>
        {model.certificationTier && (
          <CertificationBadge tier={model.certificationTier} size="sm" showLabel={false} />
        )}
      </div>

      {/* Disease target */}
      <div style={{ fontSize: '13px', color: textSecondary, marginBottom: '16px', lineHeight: '1.5' }}>
        {model.disease}
      </div>

      {/* Key metric */}
      {acc && (
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px',
        }}>
          <span style={{
            fontSize: '24px', fontWeight: '800', fontFamily: "'JetBrains Mono', monospace",
            color: statusCfg.color,
          }}>
            {typeof acc.value === 'number' ? acc.value.toFixed(acc.value < 1 ? 3 : 2) : acc.value}
          </span>
          <span style={{ fontSize: '11px', color: textSecondary }}>
            {acc.metric}
          </span>
        </div>
      )}

      {/* Bottom row: status + privacy */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
          background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`,
        }}>
          {statusCfg.label}
        </span>

        {model.privacy && (
          <span style={{
            padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
            background: 'rgba(139,92,246,0.12)', color: '#8b5cf6',
            border: '1px solid rgba(139,92,246,0.3)',
          }}>
            Privacy: {model.privacy.overallGrade}
          </span>
        )}

        {acc?.improvementRatio && (
          <span style={{
            padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
            background: 'rgba(16,185,129,0.1)', color: '#10b981',
          }}>
            {acc.improvementRatio} improvement
          </span>
        )}
      </div>
    </motion.div>
  )
}
