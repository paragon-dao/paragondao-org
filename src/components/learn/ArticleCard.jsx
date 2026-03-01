import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function ArticleCard({ article, isDark, index = 0 }) {
  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    green: isDark ? '#6ee7b7' : '#059669',
    greenBg: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.06)',
    greenBorder: isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link
        to={`/learn/${article.slug}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <motion.div
          style={{
            background: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${colors.cardBorder}`,
            boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.06)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          whileHover={{
            scale: 1.02,
            boxShadow: isDark
              ? '0 8px 32px rgba(16,185,129,0.12)'
              : '0 8px 32px rgba(16,185,129,0.1)',
            borderColor: colors.greenBorder,
          }}
        >
          {/* Order badge + meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: colors.greenBg,
              border: `1px solid ${colors.greenBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '800',
              color: colors.green,
              flexShrink: 0,
            }}>
              {article.order}
            </div>
            <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '500' }}>
              {article.readingTime}
            </span>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: colors.greenBg,
              color: colors.green,
              fontWeight: '600',
            }}>
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: '8px',
            lineHeight: '1.3',
            margin: '0 0 8px 0',
          }}>
            {article.title}
          </h3>

          {/* Excerpt */}
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            lineHeight: '1.6',
            margin: '0 0 16px 0',
            flex: 1,
          }}>
            {article.excerpt}
          </p>

          {/* Read link */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.green,
          }}>
            Read article
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
