import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import LearningPath from '../components/learn/LearningPath'
import ArticleCard from '../components/learn/ArticleCard'
import { getCurrentUser, getAuthToken } from '../services/api'
import { useTheme } from '../providers/ThemeProvider'
import { getLearningPath, getCategories } from '../data/learnArticles'

export default function LearnHubPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterQuery, setFilterQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const currentUser = getCurrentUser()
  const isAuthenticated = !!getAuthToken() && !!currentUser

  const articles = getLearningPath()
  const categories = getCategories()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const filteredArticles = useMemo(() => {
    let result = articles
    if (selectedCategory) {
      result = result.filter(a => a.category === selectedCategory)
    }
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase()
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        a.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [articles, selectedCategory, filterQuery])

  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    green: isDark ? '#6ee7b7' : '#059669',
    greenBg: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)',
    greenBorder: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)',
    inputBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
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
        title="Learn — Why Verify Health AI?"
        description="A public education hub about health AI verification. Learn why models need testing, how verification works, and what the scores mean — no jargon required."
        path="/learn"
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

      <main style={{ position: 'relative', zIndex: 5, paddingTop: '120px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '56px' }}
          >
            <h1 key={isDark ? 'hd' : 'hl'} style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '800',
              background: isDark
                ? 'linear-gradient(135deg, #fff 0%, #6ee7b7 50%, #10b981 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #059669 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '20px',
            }}>
              Why Verify Health AI?
            </h1>
            <p style={{
              fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)',
              color: colors.textSecondary,
              maxWidth: '700px',
              margin: '0 auto 32px',
              lineHeight: '1.6',
              fontWeight: '500',
            }}>
              A plain-language guide to how health AI models get tested, scored, and certified. No PhD required.
            </p>

            {/* Search bar */}
            <div style={{
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative',
            }}>
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  borderRadius: '12px',
                  border: `1px solid ${colors.cardBorder}`,
                  background: colors.inputBg,
                  color: colors.textPrimary,
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = colors.green}
                onBlur={e => e.target.style.borderColor = colors.cardBorder}
              />
            </div>
          </motion.div>

          {/* Learning Path */}
          <LearningPath articles={articles} isDark={isDark} isMobile={isMobile} />

          {/* Category Filter */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '32px',
          }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                border: `1px solid ${!selectedCategory ? colors.green : colors.cardBorder}`,
                background: !selectedCategory ? colors.greenBg : 'transparent',
                color: !selectedCategory ? colors.green : colors.textMuted,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: `1px solid ${selectedCategory === cat ? colors.green : colors.cardBorder}`,
                  background: selectedCategory === cat ? colors.greenBg : 'transparent',
                  color: selectedCategory === cat ? colors.green : colors.textMuted,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Article Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '64px',
          }}>
            {filteredArticles.map((article, i) => (
              <ArticleCard key={article.slug} article={article} isDark={isDark} index={i} />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: colors.textMuted }}>
              No articles match your search.
            </div>
          )}

          {/* Quick Reference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 style={{
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: colors.green,
              marginBottom: '16px',
            }}>
              Quick Reference
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '16px',
            }}>
              {[
                {
                  title: 'Key Numbers',
                  items: [
                    'NRMSE Score: 0.709 (29% less error than baseline)',
                    'Over 13x more improvement than the challenge winner',
                    '20 subjects: 14 train / 3 val / 3 test',
                    '4 EEG channels, 100 Hz, 2s windows',
                    '128 GLE summary values per encoding',
                  ],
                },
                {
                  title: 'Glossary',
                  items: [
                    'GLE = General Learning Encoder',
                    'NRMSE = Normalized Root Mean Square Error',
                    'Subject-level split = Each person\u2019s data stays in one group only',
                    'Baseline = The simplest prediction (always guessing the average)',
                    'HBN = Healthy Brain Network dataset',
                  ],
                },
                {
                  title: 'External Resources',
                  items: [
                    { text: 'NeurIPS EEG Challenge', href: 'https://eeg-foundation.github.io/challenge/' },
                    { text: 'Healthy Brain Network', href: 'https://healthybrainnetwork.org/' },
                    { text: 'Proof Pipeline', href: '/proof-pipeline', internal: true },
                    { text: 'Verification Hub', href: '/verify', internal: true },
                    { text: 'Model Exchange', href: '/exchange', internal: true },
                  ],
                },
              ].map((section, i) => (
                <div key={i} style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${colors.cardBorder}`,
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: colors.textPrimary,
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                  }}>
                    {section.title}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {section.items.map((item, j) => {
                      const isLink = typeof item === 'object'
                      return (
                        <li key={j} style={{
                          fontSize: '13px',
                          color: isLink ? colors.green : colors.textSecondary,
                          lineHeight: '1.6',
                          marginBottom: '6px',
                        }}>
                          {isLink ? (
                            item.internal ? (
                              <a onClick={() => navigate(item.href)} style={{ color: colors.green, textDecoration: 'none', cursor: 'pointer' }}>
                                {item.text} &rarr;
                              </a>
                            ) : (
                              <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ color: colors.green, textDecoration: 'none' }}>
                                {item.text} &nearr;
                              </a>
                            )
                          ) : (
                            item
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
