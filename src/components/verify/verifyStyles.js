/**
 * Shared style helpers and constants for verify pages
 */

export function getVerifyColors(isDark) {
  return {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
    cardBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    green: '#10b981',
    greenBg: 'rgba(16,185,129,0.1)',
    greenBorder: 'rgba(16,185,129,0.3)',
    indigo: '#6366f1',
    purple: '#8b5cf6',
    purpleBg: 'rgba(139,92,246,0.1)',
    purpleBorder: 'rgba(139,92,246,0.3)',
  }
}

export function cardStyle(isDark, extra = {}) {
  const { cardBg, cardBorder } = getVerifyColors(isDark)
  return {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ...extra,
  }
}

export const sectionAnim = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}
