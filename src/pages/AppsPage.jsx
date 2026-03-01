import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import AppCard from '../components/AppCard'
import { storeApps, APP_CATEGORIES, HARDWARE_FILTERS, FEATURED_APP } from '../data/appStoreData'
import SEO from '../components/SEO'

const sectionAnim = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All Apps' },
  { value: 'live', label: 'Live' },
  { value: 'coming-soon', label: 'Coming Soon' },
  { value: 'seeking-builder', label: 'Seeking Builder' },
]

const AppsPage = () => {
  const { isDark } = useTheme()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [hardware, setHardware] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const selectStyle = {
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: '10px',
    padding: '10px 14px',
    color: textPrimary,
    fontSize: '13px',
    outline: 'none',
    minWidth: '140px',
    cursor: 'pointer',
    WebkitAppearance: 'none',
  }

  const filteredApps = useMemo(() => {
    let apps = [...storeApps]

    if (search) {
      const q = search.toLowerCase()
      apps = apps.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.builder.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      )
    }
    if (category !== 'All') apps = apps.filter(a => a.category === category)
    if (hardware !== 'All') apps = apps.filter(a => a.hardware === hardware)
    if (statusFilter !== 'all') apps = apps.filter(a => a.status === statusFilter)

    // Featured first, then live, then coming-soon, then seeking-builder
    const order = { live: 0, 'coming-soon': 1, 'seeking-builder': 2 }
    apps.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return (order[a.status] || 3) - (order[b.status] || 3)
    })

    return apps
  }, [search, category, hardware, statusFilter])

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      transition: 'background 0.3s ease',
    }}>
      <SEO
        title="Health Apps — ParagonDAO App Store"
        description="Browse certified health apps built on the GLE protocol. Every app independently reviewed and certified. Crisis screening, respiratory monitoring, neurological assessment, and more."
        path="/apps"
      />
      <Background />
      <Header />
      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

          {/* Hero */}
          <motion.div {...sectionAnim} style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: '800',
              margin: '0 0 16px',
              background: 'linear-gradient(135deg, #34d399, #059669, #047857)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Health Apps
            </h1>
            <p style={{
              fontSize: '18px',
              color: textSecondary,
              maxWidth: '640px',
              margin: '0 auto 12px',
              lineHeight: '1.6',
            }}>
              Certified health applications built on the GLE protocol.
              Every app uses the BAGLE API for signal encoding and is independently reviewed by ParagonDAO validators.
            </p>
            <p style={{
              fontSize: '14px',
              color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8',
              margin: '0 auto',
            }}>
              {storeApps.filter(a => a.status === 'live').length} live &middot; {storeApps.filter(a => a.status === 'coming-soon').length} coming soon &middot; {storeApps.filter(a => a.status === 'seeking-builder').length} seeking builders
            </p>
          </motion.div>

          {/* Featured App Banner */}
          {FEATURED_APP && (
            <motion.div {...sectionAnim} style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(5,150,105,0.05))'
                : 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(5,150,105,0.03))',
              border: `1px solid ${isDark ? 'rgba(52,211,153,0.2)' : 'rgba(5,150,105,0.15)'}`,
              borderRadius: '16px',
              padding: isMobile ? '24px' : '32px',
              marginBottom: '40px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #34d399, #059669, #047857)',
              }} />
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(52,211,153,0.15)',
                color: '#34d399',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '12px',
              }}>
                Flagship App
              </div>
              <h2 style={{
                fontSize: isMobile ? '22px' : '28px',
                fontWeight: '700',
                color: textPrimary,
                margin: '0 0 8px',
              }}>
                {FEATURED_APP.name}
              </h2>
              <p style={{
                fontSize: '15px',
                color: textSecondary,
                lineHeight: '1.6',
                maxWidth: '700px',
                margin: '0 0 16px',
              }}>
                {FEATURED_APP.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {FEATURED_APP.models.map((m, i) => (
                  <span key={i} style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                    color: isDark ? '#a5b4fc' : '#6366f1',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {m}
                  </span>
                ))}
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: isDark ? 'rgba(52,211,153,0.15)' : 'rgba(5,150,105,0.1)',
                  color: isDark ? '#34d399' : '#059669',
                  fontSize: '12px',
                  fontWeight: '600',
                }}>
                  {FEATURED_APP.hardware}
                </span>
              </div>
              <p style={{
                fontSize: '13px',
                color: isDark ? '#34d399' : '#059669',
                fontWeight: '600',
                margin: 0,
              }}>
                {FEATURED_APP.keyFeature}
              </p>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div {...sectionAnim} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '32px',
            alignItems: 'center',
          }}>
            <input
              type="text"
              placeholder="Search apps, builders, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                ...selectStyle,
                flex: isMobile ? '1 1 100%' : '1 1 240px',
                minWidth: isMobile ? '100%' : '240px',
              }}
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
              {APP_CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
            <select value={hardware} onChange={(e) => setHardware(e.target.value)} style={selectStyle}>
              {HARDWARE_FILTERS.map(h => <option key={h} value={h}>{h === 'All' ? 'All Hardware' : h}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
              {STATUS_FILTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </motion.div>

          {/* App Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px',
            marginBottom: '64px',
          }}>
            {filteredApps.map((app, i) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </div>

          {filteredApps.length === 0 && (
            <motion.div {...sectionAnim} style={{
              textAlign: 'center',
              padding: '60px 40px',
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
            }}>
              <h3 style={{ fontSize: '20px', color: textPrimary, margin: '0 0 8px' }}>No apps found</h3>
              <p style={{ fontSize: '14px', color: textSecondary }}>
                Try adjusting your filters or search terms.
              </p>
            </motion.div>
          )}

          {/* Builder CTA */}
          <motion.div {...sectionAnim} style={{
            textAlign: 'center',
            padding: '48px 40px',
            background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
            border: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`,
            borderRadius: '16px',
            marginBottom: '64px',
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: textPrimary,
              margin: '0 0 12px',
            }}>
              Build on the GLE Protocol
            </h2>
            <p style={{
              fontSize: '15px',
              color: textSecondary,
              maxWidth: '560px',
              margin: '0 auto 20px',
              lineHeight: '1.6',
            }}>
              Submit your health app to the ParagonDAO app store. Use the BAGLE API
              to encode any biosignal into 128 GLE coefficients. Get certified. Reach users.
            </p>
            <a
              href="/forge/submit"
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Submit Your App
            </a>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AppsPage
