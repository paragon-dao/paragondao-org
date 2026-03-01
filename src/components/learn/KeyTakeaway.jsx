import { motion } from 'framer-motion'

export default function KeyTakeaway({ text, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        padding: '24px 28px',
        borderRadius: '12px',
        background: isDark
          ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.05))'
          : 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(5,150,105,0.03))',
        border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)'}`,
        margin: '32px 0',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: isDark ? '#6ee7b7' : '#059669',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        Key Takeaway
      </div>
      <p style={{
        fontSize: '17px',
        fontWeight: '600',
        lineHeight: '1.6',
        color: isDark ? '#e2e8f0' : '#1e293b',
        margin: 0,
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}>
        {text}
      </p>
    </motion.div>
  )
}
