import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function LearningPath({ articles, isDark, isMobile }) {
  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    green: isDark ? '#6ee7b7' : '#059669',
    greenBg: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)',
    greenBorder: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)',
    lineBg: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
  }

  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 style={{
        fontSize: '14px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: colors.green,
        marginBottom: '20px',
        margin: '0 0 20px 0',
      }}>
        Learning Path
      </h2>

      <div style={{
        display: 'flex',
        gap: isMobile ? '8px' : '4px',
        overflowX: 'auto',
        paddingBottom: '8px',
        WebkitOverflowScrolling: 'touch',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
      }}>
        {articles.map((article, i) => (
          <Link
            key={article.slug}
            to={`/learn/${article.slug}`}
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: colors.greenBg,
                border: `1px solid ${colors.greenBorder}`,
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              whileHover={{
                background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
                borderColor: colors.green,
              }}
            >
              <span style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                background: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '800',
                color: colors.green,
              }}>
                {article.order}
              </span>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: colors.textPrimary,
              }}>
                {isMobile ? article.title.split(':')[0].split('?')[0].substring(0, 20) : article.title.length > 28 ? article.title.substring(0, 28) + '...' : article.title}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
