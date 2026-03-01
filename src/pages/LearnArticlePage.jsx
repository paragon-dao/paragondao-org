import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import ArticleContent from '../components/learn/ArticleContent'
import { getCurrentUser, getAuthToken } from '../services/api'
import { useTheme } from '../providers/ThemeProvider'
import { getArticleBySlug, getLearningPath } from '../data/learnArticles'

export default function LearnArticlePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const currentUser = getCurrentUser()
  const isAuthenticated = !!getAuthToken() && !!currentUser

  const article = getArticleBySlug(slug)
  const path = getLearningPath()
  const currentIndex = path.findIndex(a => a.slug === slug)
  const prev = currentIndex > 0 ? path[currentIndex - 1] : null
  const next = currentIndex < path.length - 1 ? path[currentIndex + 1] : null

  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    green: isDark ? '#6ee7b7' : '#059669',
    greenBg: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)',
    greenBorder: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!article) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        color: isDark ? '#fff' : '#1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px',
      }}>
        <h1 style={{ fontSize: '24px' }}>Article not found</h1>
        <Link to="/learn" style={{ color: colors.green, fontSize: '16px' }}>Back to Learn</Link>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      color: isDark ? '#fff' : '#1e293b',
      transition: 'all 0.3s ease',
    }}>
      <SEO
        title={`${article.title} — Learn`}
        description={article.excerpt}
        path={`/learn/${slug}`}
      />

      <Header
        searchQuery={searchQuery}
        lastSearchedTerm=""
        setSearchQuery={setSearchQuery}
        handleSearch={() => {}}
        isSearching={false}
        isSearchExpanded={isSearchExpanded}
        setIsSearchExpanded={setIsSearchExpanded}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => navigate('/login')}
        onSignupClick={() => navigate('/login')}
      />

      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', paddingBottom: '80px' }}>
        {/* Breadcrumb */}
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Link to="/learn" style={{
              color: colors.green,
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Learn
            </Link>
            <span style={{ color: colors.textMuted }}>/</span>
            <span style={{ color: colors.textPrimary, fontWeight: '600' }}>{article.title}</span>
            <span style={{
              marginLeft: 'auto',
              fontSize: '12px',
              color: colors.green,
              fontWeight: '600',
              background: colors.greenBg,
              padding: '3px 10px',
              borderRadius: '6px',
              border: `1px solid ${colors.greenBorder}`,
              whiteSpace: 'nowrap',
            }}>
              {article.order} of {path.length}
            </span>
          </div>
        </div>

        {/* Article */}
        <article style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Order + Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: colors.greenBg,
                border: `1px solid ${colors.greenBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: '800', color: colors.green,
              }}>
                {article.order}
              </div>
              <span style={{ fontSize: '14px', color: colors.textMuted, fontWeight: '500' }}>
                {article.readingTime}
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: colors.textMuted }} />
              <span style={{
                fontSize: '13px', padding: '3px 10px', borderRadius: '8px',
                background: colors.greenBg, color: colors.green, fontWeight: '600',
              }}>
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: isMobile ? '32px' : '42px',
              fontWeight: '800',
              color: colors.textPrimary,
              marginBottom: '16px',
              lineHeight: '1.15',
              letterSpacing: '-0.03em',
            }}>
              {article.title}
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: isMobile ? '18px' : '22px',
              color: colors.green,
              fontStyle: 'italic',
              lineHeight: '1.5',
              marginBottom: '20px',
              fontFamily: "'Georgia', 'Times New Roman', serif",
              opacity: 0.85,
            }}>
              {article.subtitle}
            </p>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {article.tags.map(tag => (
                <span key={tag} style={{
                  padding: '4px 12px',
                  background: colors.greenBg,
                  border: `1px solid ${colors.greenBorder}`,
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: colors.green,
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Decorative line */}
            <div style={{
              height: '2px',
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), rgba(16,185,129,0.6), rgba(16,185,129,0.4), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(5,150,105,0.3), rgba(5,150,105,0.5), rgba(5,150,105,0.3), transparent)',
              marginBottom: '48px',
            }} />
          </motion.div>

          {/* Body */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <ArticleContent content={article.content} isDark={isDark} isMobile={isMobile} />
          </motion.div>

          {/* End decoration */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '64px 0 48px', gap: '16px',
          }}>
            <div style={{
              height: '1px', flex: 1,
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3))'
                : 'linear-gradient(90deg, transparent, rgba(5,150,105,0.2))',
            }} />
            <img src="/favicon.svg" alt="ParagonDAO" style={{ width: '40px', height: '40px', borderRadius: '8px', opacity: 0.6 }} />
            <div style={{
              height: '1px', flex: 1,
              background: isDark
                ? 'linear-gradient(90deg, rgba(16,185,129,0.3), transparent)'
                : 'linear-gradient(90deg, rgba(5,150,105,0.2), transparent)',
            }} />
          </div>

          {/* Prev / Next Navigation */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: prev && next ? '1fr 1fr' : '1fr',
            gap: '16px',
            marginBottom: '48px',
          }}>
            {prev && (
              <Link to={`/learn/${prev.slug}`} style={{
                textDecoration: 'none',
                padding: '20px',
                borderRadius: '12px',
                background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.9)',
                border: `1px solid ${colors.cardBorder}`,
                transition: 'all 0.2s ease',
                display: 'block',
              }}>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '6px', fontWeight: '600' }}>
                  &larr; Previous ({prev.order} of {path.length})
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: colors.textPrimary }}>
                  {prev.title}
                </div>
              </Link>
            )}
            {next && (
              <Link to={`/learn/${next.slug}`} style={{
                textDecoration: 'none',
                padding: '20px',
                borderRadius: '12px',
                background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.9)',
                border: `1px solid ${colors.cardBorder}`,
                transition: 'all 0.2s ease',
                textAlign: 'right',
                display: 'block',
              }}>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '6px', fontWeight: '600' }}>
                  Next ({next.order} of {path.length}) &rarr;
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: colors.textPrimary }}>
                  {next.title}
                </div>
              </Link>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
