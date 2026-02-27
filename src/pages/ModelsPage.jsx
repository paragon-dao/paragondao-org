import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import { useMagic } from '../providers/MagicProvider'
import { getCurrentUser } from '../services/api'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import ModelCard from '../components/ModelCard'

const availableModels = [
  {
    name: 'Breathing Health',
    accuracy: 'Validated',
    modality: 'Audio (breathing)',
    status: 'available',
    comparison: 'vs. subjective assessment',
    sampleInfo: 'Production-ready — immediate access',
    actionLabel: 'Connect Your Health'
  },
  {
    name: 'Mental Health Crisis',
    accuracy: 'Research',
    modality: 'Voice + breathing + EEG fusion',
    status: 'research',
    comparison: 'vs. PHQ-9 questionnaire',
    sampleInfo: 'Multi-modal fusion — breathing layer available now',
    actionLabel: 'Access Breathing Layer'
  },
  {
    name: 'Type 2 Diabetes',
    accuracy: 'Validated',
    modality: 'Metabolomics (LC-MS)',
    status: 'available',
    comparison: 'vs. HbA1c 80-85%',
    sampleInfo: 'Saliva-based screening via partner program',
    actionLabel: 'Learn More'
  },
  {
    name: "Parkinson's & Alzheimer's",
    accuracy: 'Validated',
    modality: 'Raman spectroscopy (saliva)',
    status: 'available',
    comparison: 'vs. CSF biomarkers 85-90%',
    sampleInfo: 'Non-invasive saliva kit',
    actionLabel: 'Learn More'
  },
  {
    name: 'EEG Consciousness',
    accuracy: 'Validated',
    modality: 'Brain electrical',
    status: 'available',
    comparison: 'NeurIPS 2025 winner (+4.87 pts)',
    sampleInfo: 'Consumer EEG headband ($249)',
    actionLabel: 'Learn More'
  },
  {
    name: 'COVID-19',
    accuracy: 'Validated',
    modality: 'Raman spectroscopy (saliva)',
    status: 'available',
    comparison: 'vs. rapid antigen 70-90%',
    sampleInfo: 'Research access',
    actionLabel: 'Learn More'
  }
]

const comingSoonModels = [
  {
    name: 'Epilepsy Detection',
    accuracy: 'Research',
    modality: 'EEG + saliva fusion',
    status: 'coming_soon',
    sampleInfo: 'Partners: UCSF, UCSD, Mayo Clinic — Active research'
  },
  {
    name: 'Cancer Screening',
    accuracy: 'TBD',
    modality: 'In development',
    status: 'coming_soon',
    sampleInfo: 'Research partners — GLE-ready architecture'
  },
  {
    name: 'Cardiovascular Risk',
    accuracy: 'TBD',
    modality: 'ECG + PPG fusion',
    status: 'coming_soon',
    sampleInfo: 'GLE-ready — seeking clinical data partners'
  }
]

const ModelsPage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { isLoggedIn } = useMagic()
  const storedUser = getCurrentUser()
  const isAuthenticated = isLoggedIn || !!storedUser

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#64748b'

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      transition: 'background 0.3s ease'
    }}>
      <Background />

      <Header
        searchQuery="" lastSearchedTerm="" setSearchQuery={() => {}}
        handleSearch={() => {}} isSearching={false} isSearchExpanded={false}
        setIsSearchExpanded={() => {}} isAuthenticated={isAuthenticated}
        onLoginClick={() => navigate('/login')} onSignupClick={() => navigate('/login')}
      />

      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '800',
              background: isDark
                ? 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #8b5cf6 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #6366f1 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 16px 0',
              lineHeight: '1.1'
            }}>
              One Encoder. Every Biosignal.
            </h1>
            <h2 style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontWeight: '500',
              color: textSecondary,
              maxWidth: '800px',
              margin: '0 auto 16px',
              lineHeight: '1.6'
            }}>
              The First Models in the $200 Trillion Economy
            </h2>
            <p style={{
              fontSize: '15px',
              color: textSecondary,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.7'
            }}>
              GLE uses a proprietary frequency-domain transform to encode any biosignal.
              One architecture encodes breathing, brain waves, saliva, and metabolomics —
              across the full biological spectrum. Each encoding is a model transaction.
              Each transaction builds the economy.
            </p>
          </motion.div>

          {/* Available Now */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                padding: '4px 12px',
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#10b981'
              }}>Available Now</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: 0 }}>
                Disease Screening Models
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '60px'
            }}>
              {availableModels.map((model, i) => (
                <ModelCard
                  key={model.name}
                  {...model}
                  delay={i * 0.1}
                  onAction={() => {
                    if (model.actionLabel === 'Connect Your Health' || model.actionLabel === 'Access Breathing Layer') {
                      navigate('/health')
                    }
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                padding: '4px 12px',
                background: 'rgba(156,163,175,0.15)',
                border: '1px solid rgba(156,163,175,0.3)',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#9ca3af'
              }}>Coming Soon</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: 0 }}>
                In Development
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '80px'
            }}>
              {comingSoonModels.map((model, i) => (
                <ModelCard key={model.name} {...model} delay={0.6 + i * 0.1} />
              ))}
            </div>
          </motion.div>

          {/* Bridge Section: Every Model is a Transaction */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{
              background: isDark ? 'rgba(30,30,50,0.9)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '48px',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)'}`,
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
              textAlign: 'center',
              marginBottom: '40px'
            }}
          >
            <h3 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '800',
              color: textPrimary,
              margin: '0 0 24px 0'
            }}>
              Every Model is a Transaction
            </h3>

            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {[
                'When your personal AI encodes your breathing, that\'s a model transaction.',
                'When the T2D model analyzes your metabolomics, that\'s a model transaction.',
                'When your agent shares anonymized frequency coefficients with the network, that\'s knowledge trading via HFTP.',
                'Scale this across health, agriculture, environment, education — the economy that runs on healthy bodies.',
                'It starts with the models on this page. Your health model is your first asset in the AI-native economy.'
              ].map((text, i) => (
                <p key={i} style={{
                  fontSize: '16px',
                  color: textSecondary,
                  lineHeight: '1.7',
                  margin: 0,
                  paddingLeft: '16px',
                  borderLeft: `3px solid ${i === 4 ? '#6366f1' : isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`
                }}>
                  {text}
                </p>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '32px'
            }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/health')}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)'
                }}
              >
                Connect Your Health
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/economic-impact')}
                style={{
                  padding: '14px 28px',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: textPrimary,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Read the Economic Analysis
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/whitepaper')}
                style={{
                  padding: '14px 28px',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: textPrimary,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Read the HFTP Whitepaper
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ModelsPage
