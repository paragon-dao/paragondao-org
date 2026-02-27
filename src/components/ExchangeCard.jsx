import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import { CERTIFICATION_TIERS } from '../data/mockBuilderData'
import CertificationBadge from './CertificationBadge'

export default function ExchangeCard({ model, index = 0 }) {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const tier = CERTIFICATION_TIERS[model.certificationTier]

  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.12)' }}
      onClick={() => navigate(`/exchange/${model.id}`)}
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
      {tier && (
        <div
          style={{
            height: '3px',
            background: tier.gradient || tier.color,
            width: '100%',
          }}
        />
      )}

      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: textPrimary }}>
              {model.name}
            </h3>
            <div style={{ fontSize: '13px', color: textSecondary, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {model.builder}
              {model.builderVerified && (
                <span style={{ color: '#6366f1', fontSize: '12px' }}>✓</span>
              )}
            </div>
          </div>
          <CertificationBadge tier={model.certificationTier} size="sm" />
        </div>

        {/* Description */}
        {model.listing?.description && (
          <p style={{
            margin: '0 0 16px',
            fontSize: '13px',
            color: textSecondary,
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {model.listing.description}
          </p>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Accuracy
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
              {(model.accuracy * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Invariance
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#6366f1' }}>
              {(model.subjectInvariance * 100).toFixed(1)}%
            </div>
          </div>
          {model.listing?.downloads != null && (
            <div>
              <div style={{ fontSize: '11px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Downloads
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: textPrimary }}>
                {model.listing.downloads.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          <span style={{
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: '600',
            background: 'rgba(99,102,241,0.12)',
            color: '#818cf8',
          }}>
            {model.modality}
          </span>
          <span style={{
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: '600',
            background: 'rgba(16,185,129,0.12)',
            color: '#10b981',
          }}>
            {model.disease}
          </span>
        </div>

        {/* On-chain hash */}
        {model.onChain && (
          <div style={{
            fontSize: '11px',
            color: textSecondary,
            fontFamily: 'monospace',
            opacity: 0.6,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {model.onChain.txHash}
          </div>
        )}
      </div>
    </motion.div>
  )
}
