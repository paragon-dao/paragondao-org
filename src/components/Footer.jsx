import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'

const Footer = () => {
  const { isDark } = useTheme()
  const [isMobile, setIsMobile] = useState(false)

  // Theme-aware colors
  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    inputBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    inputBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const footerSections = [
    {
      title: 'Health',
      links: [
        { label: 'Connect Your Health', href: '/health' },
        { label: 'Disease Models', href: '/models' },
        { label: 'GLE Encoder', href: '/models' },
        { label: 'Environment Data', href: '/' }
      ]
    },
    {
      title: 'Network',
      links: [
        { label: 'Health Apps', href: '/apps' },
        { label: 'HFTP Network', href: '/network' },
        { label: 'Verification Network', href: '/verify' },
        { label: 'Proof Exchange', href: '/exchange' },
        { label: 'Economic Impact', href: '/economic-impact' },
        { label: 'Ecosystem', href: '/ecosystem' }
      ]
    },
    {
      title: 'Governance',
      links: [
        { label: 'Proposals', href: '/network' },
        { label: 'Cast Your Vote', href: '/community' },
        { label: 'DAO Structure', href: '/governance' },
        { label: 'Three Kingdom Council', href: '/network' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Learn', href: '/learn' },
        { label: 'Essays', href: '/essays' },
        { label: 'HFTP Whitepaper', href: '/whitepaper' },
        { label: 'Proof Pipeline', href: '/proof-pipeline' },
        { label: 'Submit a Model', href: '/forge/submit?mode=simulation' },
        { label: 'GitHub', href: 'https://github.com/paragon-dao', external: true },
        { label: 'About', href: '/about' },
        { label: 'Community', href: '/community' }
      ]
    }
  ]

  return (
    <footer style={{
      background: isDark 
        ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
      borderTop: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(0,0,0,0.08)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.3s ease'
    }}>
      {/* Background gradient orbs */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '20%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '0',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Navigation Links */}
      <div style={{
        padding: isMobile ? '40px 16px' : '60px 24px',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1.5fr repeat(4, 1fr)',
          gap: isMobile ? '24px' : '48px'
        }}>
          {/* Brand Column */}
          <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <img
                src="/favicon.svg"
                alt="ParagonDAO"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(212, 160, 23, 0.3)'
                }}
              />
              <div>
                <div style={{ 
                  fontSize: '22px', 
                  fontWeight: '700', 
                  color: isDark ? '#fff' : '#1e293b',
                  letterSpacing: '-0.02em',
                  transition: 'color 0.3s ease'
                }}>
                  ParagonDAO
                </div>
              </div>
            </div>
            <p style={{
              color: colors.textMuted,
              fontSize: '14px',
              lineHeight: '1.7',
              marginBottom: '24px',
              maxWidth: '280px'
            }}>
              One encoder. Every biosignal. Building the infrastructure for population-scale health screening.
              Health is a right.
            </p>

            {/* Social Links */}
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              {[
                { icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22', label: 'GitHub', href: 'https://github.com/paragon-dao' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textMuted,
                    transition: 'all 0.2s ease'
                  }}
                  title={social.label}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {footerSections.map((section, i) => (
            <div key={i}>
              <h4 style={{
                color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(30,41,59,0.5)',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '20px',
                transition: 'color 0.3s ease'
              }}>
                {section.title}
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                {section.links.map((link, j) => (
                  <li key={j}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: colors.textSecondary,
                          textDecoration: 'none',
                          fontSize: '14px',
                          transition: 'color 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#a5b4fc'}
                        onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
                      >
                        {link.label}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                        </svg>
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        style={{
                          color: colors.textSecondary,
                          textDecoration: 'none',
                          fontSize: '14px',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#a5b4fc'}
                        onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        padding: isMobile ? '20px 16px' : '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: '16px'
      }}>
        <p style={{
          color: colors.textMuted,
          fontSize: isMobile ? '12px' : '13px',
          margin: 0
        }}>
          © 2026 ParagonDAO. Health models powering the AI-Native economy.
        </p>
        
        <div style={{
          display: 'flex',
          gap: isMobile ? '16px' : '24px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <a href="mailto:contact@paragondao.org" style={{ color: colors.textMuted, textDecoration: 'none', fontSize: '12px' }}>Contact</a>
          {!isMobile && <span style={{ color: colors.textMuted }}>•</span>}
          <Link to="/about" style={{ color: colors.textMuted, textDecoration: 'none', fontSize: '12px' }}>About</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer

