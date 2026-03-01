import { Link } from 'react-router-dom'
import KeyTakeaway from './KeyTakeaway'

export default function ArticleContent({ content, isDark, isMobile }) {
  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    green: isDark ? '#6ee7b7' : '#059669',
    greenBg: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)',
    greenBorder: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)',
    infoBg: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
    infoBorder: isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)',
    infoColor: isDark ? '#a5b4fc' : '#6366f1',
    warningBg: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.05)',
    warningBorder: isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.2)',
    warningColor: isDark ? '#fbbf24' : '#d97706',
  }

  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index} style={{
            fontSize: isMobile ? '17px' : '19px',
            lineHeight: '1.75',
            color: colors.textSecondary,
            marginBottom: '24px',
            fontFamily: "'Georgia', 'Times New Roman', serif",
          }}>
            {block.text}
          </p>
        )

      case 'heading':
        return (
          <h2 key={index} style={{
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: '700',
            color: colors.textPrimary,
            marginTop: '40px',
            marginBottom: '20px',
            lineHeight: '1.3',
            letterSpacing: '-0.01em',
          }}>
            {block.text}
          </h2>
        )

      case 'callout': {
        const isKey = block.variant === 'key'
        if (isKey) {
          return <KeyTakeaway key={index} text={block.text} isDark={isDark} />
        }
        const variantStyles = {
          info: { bg: colors.infoBg, border: colors.infoBorder, color: colors.infoColor },
          warning: { bg: colors.warningBg, border: colors.warningBorder, color: colors.warningColor },
        }
        const v = variantStyles[block.variant] || variantStyles.info
        return (
          <div key={index} style={{
            padding: '20px 24px',
            borderRadius: '12px',
            background: v.bg,
            border: `1px solid ${v.border}`,
            marginBottom: '24px',
          }}>
            {block.title && (
              <div style={{
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: v.color,
                marginBottom: '8px',
              }}>
                {block.title}
              </div>
            )}
            <p style={{
              fontSize: '15px',
              lineHeight: '1.7',
              color: colors.textSecondary,
              margin: 0,
            }}>
              {block.text}
            </p>
          </div>
        )
      }

      case 'formula':
        return (
          <div key={index} style={{ marginBottom: '24px' }}>
            <div style={{
              padding: '16px 20px',
              borderRadius: '10px',
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${colors.cardBorder}`,
              fontFamily: 'monospace',
              fontSize: '15px',
              color: colors.green,
              textAlign: 'center',
              marginBottom: '10px',
              whiteSpace: 'pre-wrap',
            }}>
              {block.expression}
            </div>
            {block.explanation && (
              <p style={{
                fontSize: '14px',
                color: colors.textMuted,
                lineHeight: '1.65',
                margin: 0,
                fontStyle: 'italic',
              }}>
                {block.explanation}
              </p>
            )}
          </div>
        )

      case 'comparison':
        return (
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(block.items.length, 2)}, 1fr)`,
            gap: '12px',
            marginBottom: '24px',
          }}>
            {block.items.map((item, i) => {
              const borderColor = item.variant === 'good' ? (isDark ? '#6ee7b7' : '#10b981')
                : item.variant === 'bad' ? '#ef4444'
                : colors.cardBorder
              return (
                <div key={i} style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: colors.cardBg,
                  border: `1px solid ${borderColor}`,
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: borderColor,
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: colors.textPrimary,
                    marginBottom: '6px',
                    fontFamily: 'monospace',
                  }}>
                    {item.value}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    lineHeight: '1.6',
                  }}>
                    {item.detail}
                  </div>
                </div>
              )
            })}
          </div>
        )

      case 'diagram':
        return (
          <div key={index} style={{
            padding: '20px 24px',
            borderRadius: '12px',
            background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${colors.cardBorder}`,
            fontFamily: 'monospace',
            fontSize: isMobile ? '11px' : '13px',
            lineHeight: '1.6',
            color: colors.textPrimary,
            whiteSpace: 'pre',
            overflowX: 'auto',
            marginBottom: '24px',
          }}>
            {block.content}
          </div>
        )

      case 'list': {
        const Tag = block.variant === 'ordered' ? 'ol' : 'ul'
        return (
          <Tag key={index} style={{
            paddingLeft: '24px',
            marginBottom: '24px',
            listStyleType: block.variant === 'ordered' ? 'decimal' : 'disc',
          }}>
            {block.items.map((item, i) => (
              <li key={i} style={{
                fontSize: '15px',
                color: colors.textSecondary,
                lineHeight: '1.7',
                marginBottom: '12px',
              }}>
                {item.title && (
                  <strong style={{ color: colors.textPrimary }}>{item.title}: </strong>
                )}
                {item.text}
              </li>
            ))}
          </Tag>
        )
      }

      case 'tryit':
        return (
          <div key={index} style={{ marginBottom: '24px' }}>
            <Link
              to={block.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))'
                  : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.06))',
                border: `1px solid ${colors.greenBorder}`,
                color: colors.green,
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '700',
                transition: 'all 0.15s ease',
              }}
            >
              {block.text}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        )

      case 'divider':
        return (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '40px 0',
            gap: '16px',
          }}>
            {[0.4, 0.6, 0.4].map((opacity, i) => (
              <div key={i} style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isDark ? `rgba(16,185,129,${opacity})` : `rgba(5,150,105,${opacity})`,
              }} />
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      {content.map((block, index) => renderBlock(block, index))}
    </div>
  )
}
