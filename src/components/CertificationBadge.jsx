import { motion } from 'framer-motion'
import { CERTIFICATION_TIERS } from '../data/mockBuilderData'

export default function CertificationBadge({ tier, size = 'md', animate = false, showLabel = true }) {
  const info = CERTIFICATION_TIERS[tier]
  if (!info) return null

  const sizes = {
    sm: { icon: 20, font: 11, pad: '4px 10px', gap: 6 },
    md: { icon: 28, font: 13, pad: '6px 14px', gap: 8 },
    lg: { icon: 40, font: 16, pad: '10px 20px', gap: 10 },
    xl: { icon: 56, font: 20, pad: '14px 28px', gap: 12 },
  }

  const s = sizes[size] || sizes.md
  const isPlatinum = tier === 'platinum'

  const badge = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${s.gap}px`,
        padding: s.pad,
        borderRadius: '999px',
        background: info.bg,
        border: `1px solid ${info.border}`,
        ...(isPlatinum && {
          boxShadow: '0 0 20px rgba(99,102,241,0.3), 0 0 40px rgba(139,92,246,0.15)',
        }),
      }}
    >
      <div
        style={{
          width: `${s.icon}px`,
          height: `${s.icon}px`,
          borderRadius: '50%',
          background: isPlatinum ? info.gradient : info.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${s.icon * 0.5}px`,
          ...(isPlatinum && {
            border: `2px solid ${info.badgeColor}`,
          }),
        }}
      >
        {tier === 'bronze' && '🥉'}
        {tier === 'silver' && '🥈'}
        {tier === 'gold' && '🥇'}
        {tier === 'platinum' && '💎'}
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: `${s.font}px`,
            fontWeight: '700',
            color: isPlatinum ? '#a5b4fc' : info.color,
            letterSpacing: '0.03em',
          }}
        >
          {info.label}
        </span>
      )}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
      >
        {badge}
      </motion.div>
    )
  }

  return badge
}
