import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'
import { useMagic } from '../providers/MagicProvider'
import { getCurrentUser } from '../services/api'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import CertificationBadge from '../components/CertificationBadge'
import { getModelById, STATUS_CONFIG } from '../data/verifyModels'
import { getVerifyColors } from '../components/verify/verifyStyles'
import verificationAPI from '../services/verification'

// Tab components
import VerifyResultsTab from '../components/verify/VerifyResultsTab'
import VerifyDataTab from '../components/verify/VerifyDataTab'
import VerifyPrivacyTab from '../components/verify/VerifyPrivacyTab'
import VerifyPlaygroundTab from '../components/verify/VerifyPlaygroundTab'
import VerifyCertificateTab from '../components/verify/VerifyCertificateTab'

const TAB_CONFIG = [
  { id: 'results', label: 'Results', color: 'green', alwaysShow: true },
  { id: 'data', label: 'Data', color: 'green', requiresEndpoints: true },
  { id: 'privacy', label: 'Privacy', color: 'purple', requiresPrivacy: true },
  { id: 'playground', label: 'Playground', color: 'green', requiresEndpoints: true },
  { id: 'certificate', label: 'Certificate', color: 'green', alwaysShow: true },
]

export default function VerifyModelPage() {
  const { modelId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { isLoggedIn } = useMagic()
  const storedUser = getCurrentUser()
  const isAuthenticated = isLoggedIn || !!storedUser

  const c = getVerifyColors(isDark)
  const model = getModelById(modelId)

  // API state
  const [results, setResults] = useState(null)
  const [benchmark, setBenchmark] = useState(null)
  const [loading, setLoading] = useState(true)
  const [privacyResults, setPrivacyResults] = useState(null)
  const [privacyLoading, setPrivacyLoading] = useState(true)
  const [rerunning, setRerunning] = useState(false)

  // Tab state from URL
  const activeTab = searchParams.get('tab') || 'results'
  const setActiveTab = (tab) => {
    setSearchParams(tab === 'results' ? {} : { tab })
  }

  // Determine visible tabs
  const visibleTabs = TAB_CONFIG.filter(t => {
    if (t.alwaysShow) return true
    if (t.requiresEndpoints) return !!model?.endpoints
    if (t.requiresPrivacy) return !!(model?.privacy || model?.endpoints)
    return true
  })

  // Fetch data for models with live endpoints
  useEffect(() => {
    if (!model?.endpoints) {
      setLoading(false)
      setPrivacyLoading(false)
      return
    }

    async function fetchData() {
      try {
        const [r, b] = await Promise.all([
          verificationAPI.getResults().catch(() => null),
          verificationAPI.getBenchmark().catch(() => null),
        ])
        setResults(r)
        setBenchmark(b)
      } catch (e) {
        // Fall back to fallback data
      } finally {
        setLoading(false)
      }
    }

    async function fetchPrivacy() {
      try {
        const p = await verificationAPI.getPrivacyResults().catch(() => null)
        setPrivacyResults(p)
      } catch (e) {
        // Privacy results optional
      } finally {
        setPrivacyLoading(false)
      }
    }

    fetchData()
    fetchPrivacy()
  }, [model])

  const handleRerun = async () => {
    if (!model?.endpoints) return
    setRerunning(true)
    try {
      const fresh = await verificationAPI.runVerification()
      setResults(fresh)
    } catch (e) {
      // keep existing results
    } finally {
      setRerunning(false)
    }
  }

  const handlePredict = async (data) => {
    return await verificationAPI.predict(data)
  }

  const handlePrivacyAudit = async (setStep) => {
    setStep(1)
    const mi = await verificationAPI.runMembershipInference()
    setStep(2)
    const inv = await verificationAPI.runModelInversion()
    setStep(3)
    const attr = await verificationAPI.runAttributeInference()

    const grades = [mi.grade, inv.grade, attr.grade]
    const gradeOrder = { WEAK: 0, MODERATE: 1, STRONG: 2 }
    const overall = grades.reduce((a, b) => gradeOrder[a] <= gradeOrder[b] ? a : b)

    const combined = {
      membership_inference: mi,
      model_inversion: inv,
      attribute_inference: attr,
      overall_grade: overall,
      privacy_certified: overall !== 'WEAK',
      tested_at: new Date().toISOString(),
    }
    setPrivacyResults(combined)
  }

  // 404 handling
  if (!model) {
    return (
      <div style={{
        minHeight: '100vh', position: 'relative',
        background: isDark ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      }}>
        <Background />
        <Header searchQuery="" lastSearchedTerm="" setSearchQuery={() => {}} handleSearch={() => {}} isSearching={false} isSearchExpanded={false} setIsSearchExpanded={() => {}} isAuthenticated={isAuthenticated} onLoginClick={() => navigate('/login')} onSignupClick={() => navigate('/login')} />
        <main style={{ position: 'relative', zIndex: 5, paddingTop: '140px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: c.textPrimary }}>Model Not Found</h1>
          <p style={{ color: c.textSecondary, marginBottom: '24px' }}>No model with ID "{modelId}" exists in the verification registry.</p>
          <button onClick={() => navigate('/verify')} style={{
            padding: '10px 24px', borderRadius: '10px', background: c.green, color: '#fff',
            border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          }}>Back to Verify Hub</button>
        </main>
        <Footer />
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[model.status] || STATUS_CONFIG.pending

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      background: isDark ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    }}>
      <SEO
        title={`Verify — ${model.name}`}
        description={model.description}
        path={`/verify/${model.id}`}
      />
      <Background />
      <Header searchQuery="" lastSearchedTerm="" setSearchQuery={() => {}} handleSearch={() => {}} isSearching={false} isSearchExpanded={false} setIsSearchExpanded={() => {}} isAuthenticated={isAuthenticated} onLoginClick={() => navigate('/login')} onSignupClick={() => navigate('/login')} />

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes shimmer { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }
      `}</style>

      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <button onClick={() => navigate('/verify')} style={{
              background: 'none', border: 'none', color: c.green, cursor: 'pointer',
              fontSize: '14px', fontWeight: '500', padding: 0,
            }}>Verify</button>
            <span style={{ color: c.textSecondary, fontSize: '14px' }}>/</span>
            <span style={{ color: c.textPrimary, fontSize: '14px', fontWeight: '600' }}>{model.shortName || model.name}</span>
          </div>

          {/* Model Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
            }}
          >
            <div>
              <h1 style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: '800',
                color: c.textPrimary, margin: '0 0 8px 0', lineHeight: '1.1',
              }}>
                {model.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ color: c.textSecondary, fontSize: '14px' }}>{model.modality}</span>
                <span style={{
                  padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                  background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`,
                }}>{statusCfg.label}</span>
                {model.privacy && (
                  <span style={{
                    padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                    background: c.purpleBg, color: c.purple, border: `1px solid ${c.purpleBorder}`,
                  }}>Privacy: {model.privacy.overallGrade}</span>
                )}
              </div>
            </div>
            {model.certificationTier && (
              <CertificationBadge tier={model.certificationTier} size="lg" animate />
            )}
          </motion.div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '32px',
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            borderRadius: '14px', padding: '4px',
            border: `1px solid ${c.cardBorder}`,
            overflowX: 'auto',
          }}>
            {visibleTabs.map(tab => {
              const isActive = activeTab === tab.id
              const tabColor = tab.color === 'purple' ? c.purple : c.green
              const tabBg = tab.color === 'purple' ? c.purpleBg : c.greenBg
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: '1 0 auto', padding: '10px 20px', borderRadius: '10px', border: 'none',
                    background: isActive ? tabBg : 'transparent',
                    color: isActive ? tabColor : c.textSecondary,
                    fontSize: '14px', fontWeight: '650', cursor: 'pointer',
                    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                    borderBottom: isActive ? `2px solid ${tabColor}` : '2px solid transparent',
                  }}
                >{tab.label}</button>
              )
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'results' && (
            <VerifyResultsTab
              model={model}
              results={results}
              benchmark={benchmark}
              loading={loading}
              rerunning={rerunning}
              onRerun={handleRerun}
            />
          )}

          {activeTab === 'data' && (
            <VerifyDataTab
              model={model}
              onPredict={handlePredict}
            />
          )}

          {activeTab === 'privacy' && (
            <VerifyPrivacyTab
              model={model}
              privacyResults={privacyResults}
              privacyLoading={privacyLoading}
              onRunAudit={handlePrivacyAudit}
            />
          )}

          {activeTab === 'playground' && (
            <VerifyPlaygroundTab
              model={model}
              onPredict={handlePredict}
            />
          )}

          {activeTab === 'certificate' && (
            <VerifyCertificateTab model={model} />
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginTop: '48px', marginBottom: '40px' }}
          >
            <div style={{
              background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)'}`,
              borderRadius: '16px', padding: '40px', textAlign: 'center',
            }}>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: c.textPrimary, margin: '0 0 12px 0' }}>
                Every Model. Accuracy + Privacy. Independently Verifiable.
              </h3>
              <p style={{ color: c.textSecondary, fontSize: '15px', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 24px' }}>
                The ParagonDAO Verification Network ensures every health model is both accurate and privacy-safe — backed by reproducible evidence.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} href="/verify" style={{
                  padding: '12px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
                  background: `linear-gradient(135deg, ${c.green}, #059669)`, color: '#fff',
                  textDecoration: 'none', boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                }}>View All Models</motion.a>
                <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} href="/verify/methodology" style={{
                  padding: '12px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                  background: `linear-gradient(135deg, ${c.indigo}, #8b5cf6)`, color: '#fff', textDecoration: 'none',
                }}>Methodology</motion.a>
                <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} href="/forge/submit?mode=simulation" style={{
                  padding: '12px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
                  textDecoration: 'none', boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                }}>Submit Your Model</motion.a>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
