import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import ModeToggle from '../components/ModeToggle'
import PipelineStepIndicator from '../components/PipelineStepIndicator'
import ValidationProgress from '../components/ValidationProgress'
import CertificationBadge from '../components/CertificationBadge'
import OnChainRecord from '../components/OnChainRecord'
import ExchangeCard from '../components/ExchangeCard'
import useForgeSimulation from '../hooks/useForgeSimulation'
import { BENCHMARKS, CERTIFICATION_TIERS, VALIDATORS, getCertificationTier, simulationProjectedImpact } from '../data/mockBuilderData'

const sectionAnim = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

const ForgeSubmitPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isDark } = useTheme()
  const [mode, setMode] = useState(searchParams.get('mode') || 'simulation')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const sim = useForgeSimulation()

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const indigo = '#6366f1'
  const green = '#10b981'

  const cardStyle = (extra = {}) => ({
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
    ...extra,
  })

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: `1px solid ${inputBorder}`,
    background: inputBg,
    color: textPrimary,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  }

  const primaryBtnStyle = {
    padding: '12px 28px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
  }

  const secondaryBtnStyle = {
    padding: '12px 28px',
    borderRadius: '12px',
    border: `1px solid ${cardBorder}`,
    background: cardBg,
    color: textPrimary,
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  }

  // Build a mock exchange model from draft for preview
  const previewModel = {
    id: 'preview',
    name: sim.modelDraft.name || 'Untitled Model',
    builder: 'You',
    builderVerified: true,
    modality: sim.modelDraft.modality || 'EEG',
    disease: sim.modelDraft.disease || 'Unknown',
    architecture: sim.modelDraft.architecture || '',
    certificationTier: sim.certificationTier || 'gold',
    accuracy: sim.results?.['neurips-eeg']?.accuracy || sim.modelDraft.claimedAccuracy || 0.95,
    subjectInvariance: sim.results?.['neurips-eeg']?.subject_invariance || 0.94,
    publishedAt: new Date(),
    onChain: {
      txHash: '0x' + 'a'.repeat(40),
      blockNumber: 18_100_000,
      timestamp: new Date(),
      network: 'Ethereum Mainnet (Simulated)',
      contract: '0x7a3B...ParagonVerify',
      certificationTier: sim.certificationTier,
      validatorSignatures: [],
      ipfsHash: 'Qm' + 'X'.repeat(44),
    },
    listing: {
      description: sim.modelDraft.description || 'A health AI model verified on the ParagonDAO network.',
      license: sim.modelDraft.license || 'ParagonDAO Open Research License',
      tags: sim.modelDraft.tags || ['eeg'],
      downloads: 0,
      citations: 0,
    },
  }

  // Simulated on-chain record for results step
  const simulatedOnChain = sim.certificationTier ? {
    txHash: '0x7f3a' + Array.from({ length: 36 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    blockNumber: 18_142_847,
    timestamp: new Date(),
    network: 'Ethereum Mainnet (Simulated)',
    contract: '0x7a3B...ParagonVerify',
    certificationTier: sim.certificationTier,
    validatorSignatures: VALIDATORS.map(v => ({
      validator: v.name,
      signature: `0x${v.id}sig${Math.random().toString(36).slice(2, 10)}`,
      timestamp: new Date().toISOString(),
    })),
    ipfsHash: 'QmSim' + Math.random().toString(36).slice(2, 42).padEnd(40, 'X'),
  } : null

  const renderStep = () => {
    switch (sim.currentStep) {
      case 1:
        return (
          <StepRegister
            draft={sim.modelDraft}
            onUpdate={sim.updateDraft}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
            cardStyle={cardStyle}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isMobile={isMobile}
          />
        )
      case 2:
        return (
          <StepUpload
            uploadProgress={sim.uploadProgress}
            uploadHash={sim.uploadHash}
            onSimulateUpload={sim.simulateUpload}
            cardStyle={cardStyle}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isDark={isDark}
            primaryBtnStyle={primaryBtnStyle}
          />
        )
      case 3:
        return (
          <StepBenchmarks
            selected={sim.selectedBenchmarks}
            onToggle={sim.toggleBenchmark}
            cardStyle={cardStyle}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isDark={isDark}
            indigo={indigo}
          />
        )
      case 4:
        return (
          <StepVerification
            validators={sim.verificationProgress}
            overallProgress={sim.overallProgress}
            isRunning={sim.isRunning}
            verificationComplete={sim.verificationComplete}
            onStart={sim.startVerification}
            onFastForward={sim.fastForward}
            simulationSpeed={sim.simulationSpeed}
            cardStyle={cardStyle}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isDark={isDark}
            primaryBtnStyle={primaryBtnStyle}
            secondaryBtnStyle={secondaryBtnStyle}
          />
        )
      case 5:
        return (
          <StepResults
            results={sim.results}
            certificationTier={sim.certificationTier}
            onChain={simulatedOnChain}
            cardStyle={cardStyle}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isDark={isDark}
            green={green}
            indigo={indigo}
            isMobile={isMobile}
          />
        )
      case 6:
        return (
          <StepPublish
            draft={sim.modelDraft}
            onUpdate={sim.updateDraft}
            previewModel={previewModel}
            inputStyle={inputStyle}
            labelStyle={labelStyle}
            cardStyle={cardStyle}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isMobile={isMobile}
          />
        )
      case 7:
        return (
          <StepSuccess
            modelDraft={sim.modelDraft}
            certificationTier={sim.certificationTier}
            onReset={sim.reset}
            navigate={navigate}
            cardStyle={cardStyle}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            isDark={isDark}
            indigo={indigo}
            primaryBtnStyle={primaryBtnStyle}
            secondaryBtnStyle={secondaryBtnStyle}
          />
        )
      default:
        return null
    }
  }

  // Can advance logic
  const canAdvance = () => {
    switch (sim.currentStep) {
      case 1: return sim.modelDraft.name && sim.modelDraft.modality && sim.modelDraft.disease
      case 2: return sim.uploadProgress >= 100
      case 3: return sim.selectedBenchmarks.length > 0
      case 4: return sim.verificationComplete
      case 5: return sim.certificationTier != null
      case 6: return sim.modelDraft.description
      case 7: return false // last step
      default: return false
    }
  }

  return (
    <>
      <Background />
      <Header />
      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

          {/* Header */}
          <motion.div {...sectionAnim} style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: '800',
              margin: '0 0 12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              The Forge
            </h1>
            <p style={{ fontSize: '15px', color: textSecondary, maxWidth: '560px', margin: '0 auto 20px' }}>
              Seven steps from submission to independently verified, on-chain certified, and published to the world.
            </p>
            <ModeToggle mode={mode} onToggle={(m) => { setMode(m); if (m === 'simulation') sim.reset() }} />
          </motion.div>

          {mode === 'production' ? (
            <motion.div {...sectionAnim} style={{
              textAlign: 'center',
              padding: '80px 40px',
              ...cardStyle(),
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: textPrimary, margin: '0 0 12px' }}>
                Early Access
              </h2>
              <p style={{ fontSize: '15px', color: textSecondary, maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                Model submission opens with the BAGLE API. Switch to Simulation mode to
                experience the full 7-step verification process with pre-filled sample data.
              </p>
              <button onClick={() => setMode('simulation')} style={primaryBtnStyle}>
                Try Simulation Mode
              </button>
            </motion.div>
          ) : (
            /* Wizard layout */
            <div style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-start',
              flexDirection: isMobile ? 'column' : 'row',
              marginBottom: '80px',
            }}>
              {/* Sidebar */}
              <div style={{
                ...cardStyle(),
                width: isMobile ? '100%' : '220px',
                flexShrink: 0,
                position: isMobile ? 'static' : 'sticky',
                top: '120px',
              }}>
                <PipelineStepIndicator
                  currentStep={sim.currentStep}
                  onStepClick={(n) => sim.goToStep(n)}
                  compact
                />
              </div>

              {/* Main content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={sim.currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation buttons */}
                {sim.currentStep < 7 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '24px',
                    gap: '12px',
                  }}>
                    <button
                      onClick={() => sim.goToStep(sim.currentStep - 1)}
                      disabled={sim.currentStep === 1}
                      style={{
                        ...secondaryBtnStyle,
                        opacity: sim.currentStep === 1 ? 0.4 : 1,
                        cursor: sim.currentStep === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Back
                    </button>
                    {sim.currentStep !== 4 && (
                      <motion.button
                        whileHover={canAdvance() ? { scale: 1.03 } : {}}
                        whileTap={canAdvance() ? { scale: 0.97 } : {}}
                        onClick={() => canAdvance() && sim.advanceStep()}
                        disabled={!canAdvance()}
                        style={{
                          ...primaryBtnStyle,
                          opacity: canAdvance() ? 1 : 0.4,
                          cursor: canAdvance() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {sim.currentStep === 6 ? 'Publish Model' : 'Continue'}
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

// ─── Step 1: Register ─────────────────────────────────────────────────────────
function StepRegister({ draft, onUpdate, inputStyle, labelStyle, cardStyle, textPrimary, textSecondary, isMobile }) {
  const fields = [
    { key: 'name', label: 'Model Name', placeholder: 'e.g. Sleep-Stage Classifier v3' },
    { key: 'modality', label: 'Data Modality', placeholder: 'e.g. EEG, Audio, ECG' },
    { key: 'disease', label: 'Disease Target', placeholder: 'e.g. Sleep Disorders, Epilepsy' },
    { key: 'architecture', label: 'Architecture', placeholder: 'e.g. Transformer + GLE Encoder' },
    { key: 'dataset', label: 'Training Dataset', placeholder: 'e.g. MESA Polysomnography (n=2,056)' },
    { key: 'claimedAccuracy', label: 'Claimed Accuracy', placeholder: 'e.g. 0.952', type: 'number' },
  ]

  return (
    <div style={cardStyle()}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
        Tell Us About Your Model
      </h2>
      <p style={{ fontSize: '13px', color: textSecondary, margin: '0 0 24px', lineHeight: '1.5' }}>
        This metadata becomes your model's permanent identity on the network. In simulation mode, fields are pre-filled so you can experience the full pipeline.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '16px',
      }}>
        {fields.map(f => (
          <div key={f.key} style={f.key === 'name' ? { gridColumn: isMobile ? '1' : '1 / -1' } : {}}>
            <label style={labelStyle}>{f.label}</label>
            <input
              type={f.type || 'text'}
              value={draft[f.key] || ''}
              onChange={(e) => onUpdate(f.key, f.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
              placeholder={f.placeholder}
              style={inputStyle}
              step={f.type === 'number' ? '0.001' : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: Upload ───────────────────────────────────────────────────────────
function StepUpload({ uploadProgress, uploadHash, onSimulateUpload, cardStyle, textPrimary, textSecondary, isDark, primaryBtnStyle }) {
  return (
    <div style={cardStyle()}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
        Upload Your Model Artifact
      </h2>
      <p style={{ fontSize: '13px', color: textSecondary, margin: '0 0 24px', lineHeight: '1.5' }}>
        Your model artifact is uploaded to an encrypted staging area. A SHA-256 hash locks your submission — if anyone alters your model, the hash breaks and verification fails. Validators access your artifact only inside isolated sandboxes, and the artifact is purged after scoring.
      </p>

      {/* Drop zone */}
      <div style={{
        border: `2px dashed ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        marginBottom: '20px',
      }}>
        {uploadProgress === 0 && !uploadHash ? (
          <>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📤</div>
            <div style={{ fontSize: '14px', color: textSecondary, marginBottom: '16px' }}>
              Drag & drop your model file, or click to browse
            </div>
            <button onClick={onSimulateUpload} style={primaryBtnStyle}>
              Simulate Upload
            </button>
          </>
        ) : uploadProgress < 100 ? (
          <>
            <div style={{ fontSize: '14px', color: textPrimary, marginBottom: '12px' }}>
              Uploading... {Math.round(uploadProgress)}%
            </div>
            <div style={{
              height: '8px',
              borderRadius: '4px',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              overflow: 'hidden',
              maxWidth: '400px',
              margin: '0 auto',
            }}>
              <motion.div
                style={{
                  height: '100%',
                  borderRadius: '4px',
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>
              Upload Complete
            </div>
            <div style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: textSecondary,
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'inline-block',
            }}>
              SHA-256: {uploadHash}
            </div>
          </>
        )}
      </div>

      {/* Trust callout */}
      <div style={{
        padding: '14px 18px',
        borderRadius: '12px',
        background: isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.03)',
        border: '1px solid rgba(16,185,129,0.2)',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px' }}>🛡️</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: textPrimary }}>Your Weights Are Protected</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            'Artifact encrypted in transit (TLS 1.3)',
            'Validators access weights only in isolated sandboxes',
            'Artifact purged after verification completes',
            'Validators stake 28K-50K PGON — slashed if they retain your model',
          ].map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: textSecondary }}>
              <span style={{ color: '#10b981', fontSize: '10px' }}>✓</span>
              {line}
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '11px', color: textSecondary, lineHeight: '1.5', opacity: 0.7 }}>
        In simulation mode, no actual file is uploaded. The hash is generated to demonstrate the verification flow.
      </div>
    </div>
  )
}

// ─── Step 3: Benchmark Selection ──────────────────────────────────────────────
function StepBenchmarks({ selected, onToggle, cardStyle, textPrimary, textSecondary, isDark, indigo }) {
  return (
    <div style={cardStyle()}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
        Choose Your Benchmarks
      </h2>
      <p style={{ fontSize: '13px', color: textSecondary, margin: '0 0 24px', lineHeight: '1.5' }}>
        Each benchmark your model passes strengthens its certification. Builders who run all three benchmarks are eligible for Platinum certification — the highest tier on the network.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {BENCHMARKS.map(b => {
          const isSelected = selected.includes(b.id)
          return (
            <motion.div
              key={b.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onToggle(b.id)}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                border: `2px solid ${isSelected ? indigo : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                background: isSelected
                  ? (isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)')
                  : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                border: `2px solid ${isSelected ? indigo : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}`,
                background: isSelected ? indigo : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700',
                flexShrink: 0,
              }}>
                {isSelected && '✓'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary }}>
                  {b.name}
                </div>
                <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>
                  {b.description}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    color: textSecondary,
                  }}>
                    {b.subjects} subjects
                  </span>
                  {b.metrics.map(m => (
                    <span key={m} style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                      color: textSecondary,
                    }}>
                      {m.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      <div style={{ marginTop: '16px', fontSize: '12px', color: textSecondary }}>
        {selected.length} benchmark{selected.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  )
}

// ─── Step 4: Verification Progress ───────────────────────────────────────────
function StepVerification({
  validators, overallProgress, isRunning, verificationComplete,
  onStart, onFastForward, simulationSpeed,
  cardStyle, textPrimary, textSecondary, isDark, primaryBtnStyle, secondaryBtnStyle,
}) {
  return (
    <div style={cardStyle()}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
        Independent Verification
      </h2>

      {!isRunning && !verificationComplete ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p style={{ fontSize: '14px', color: textSecondary, maxWidth: '440px', margin: '0 auto 24px', lineHeight: '1.5' }}>
            Five validators, each staking tens of thousands of PGON tokens, will independently evaluate your model in isolated environments. No validator sees another's results. Consensus across all five is required. In simulation, this completes in ~8 seconds.
          </p>
          <button onClick={onStart} style={primaryBtnStyle}>
            Start Verification
          </button>
        </div>
      ) : (
        <>
          <ValidationProgress
            validators={validators}
            overallProgress={overallProgress}
          />

          {/* Status timeline */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          }}>
            <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Status Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <StatusLine done isDark={isDark} text="Model artifact loaded and hash verified" />
              <StatusLine done={overallProgress > 10} isDark={isDark} text="Benchmark datasets loaded" />
              <StatusLine done={overallProgress > 30} isDark={isDark} text="Validator environments initialized" />
              <StatusLine done={overallProgress > 50} isDark={isDark} text="Cross-validation in progress" />
              <StatusLine done={overallProgress > 80} isDark={isDark} text="Subject invariance testing" />
              <StatusLine done={verificationComplete} isDark={isDark} text="Consensus reached — results finalized" />
              <StatusLine done={verificationComplete} isDark={isDark} text="Model artifacts purged from all validator environments" />
            </div>
          </div>

          {/* Controls */}
          {isRunning && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'center' }}>
              {simulationSpeed === 1 && (
                <button onClick={onFastForward} style={secondaryBtnStyle}>
                  ⚡ Fast Forward (10x)
                </button>
              )}
              {simulationSpeed > 1 && (
                <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                  ⚡ Running at 10x speed...
                </div>
              )}
            </div>
          )}

          {verificationComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>
                Verification Complete — All validators reached consensus
              </div>
              <div style={{ fontSize: '12px', color: textSecondary, marginTop: '4px' }}>
                Advancing to results...
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

function StatusLine({ done, isDark, text }) {
  const doneColor = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)'
  const pendingColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(30,41,59,0.3)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: done ? '#10b981' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'),
        transition: 'background 0.3s ease',
      }} />
      <span style={{
        fontSize: '12px',
        color: done ? doneColor : pendingColor,
        transition: 'color 0.3s ease',
      }}>
        {text}
      </span>
    </div>
  )
}

// ─── Step 5: Results ──────────────────────────────────────────────────────────
function StepResults({ results, certificationTier, onChain, cardStyle, textPrimary, textSecondary, isDark, green, indigo, isMobile }) {
  if (!results) return null

  const tierInfo = CERTIFICATION_TIERS[certificationTier]

  return (
    <div style={cardStyle()}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
        Your Results Are In
      </h2>

      {/* Certification award */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{
          textAlign: 'center',
          padding: '32px',
          marginBottom: '24px',
          borderRadius: '16px',
          background: tierInfo
            ? `${tierInfo.bg}`
            : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
          border: tierInfo
            ? `1px solid ${tierInfo.border}`
            : `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
        }}
      >
        <CertificationBadge tier={certificationTier} size="xl" animate />
        <div style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, marginTop: '16px' }}>
          {tierInfo?.label} Certification Awarded
        </div>
        <div style={{ fontSize: '13px', color: textSecondary, marginTop: '4px' }}>
          {tierInfo?.requirement}
        </div>
        <div style={{ fontSize: '12px', color: textSecondary, marginTop: '12px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
          This certification is permanent. Recorded on Ethereum, signed by all five validators, and publicly verifiable by anyone — forever.
        </div>
      </motion.div>

      {/* Benchmark results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {Object.entries(results).map(([benchId, metrics]) => {
          const bench = BENCHMARKS.find(b => b.id === benchId)
          return (
            <div key={benchId} style={{
              padding: '16px',
              borderRadius: '12px',
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, marginBottom: '12px' }}>
                {bench?.name || benchId}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '8px',
              }}>
                {Object.entries(metrics).filter(([, v]) => typeof v === 'number').map(([key, val]) => (
                  <div key={key} style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  }}>
                    <div style={{ fontSize: '10px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: val >= 0.9 ? green : indigo }}>
                      {typeof val === 'number' && val < 1 ? (val * 100).toFixed(1) + '%' : val.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* On-chain record preview */}
      {onChain && <OnChainRecord record={onChain} compact />}
    </div>
  )
}

// ─── Step 6: Publish ──────────────────────────────────────────────────────────
function StepPublish({ draft, onUpdate, previewModel, inputStyle, labelStyle, cardStyle, textPrimary, textSecondary, isMobile }) {
  return (
    <div>
      <div style={cardStyle({ marginBottom: '24px' })}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
          Publish to The Exchange
        </h2>
        <p style={{ fontSize: '13px', color: textSecondary, margin: '0 0 24px', lineHeight: '1.5' }}>
          This is where your model meets the world. Researchers, builders, and app developers will discover it here. Write a description that explains what your model does and why it matters.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={draft.description || ''}
              onChange={(e) => onUpdate('description', e.target.value)}
              placeholder="Describe what your model does and why it matters..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label style={labelStyle}>License</label>
              <select
                value={draft.license || 'ParagonDAO Open Research License'}
                onChange={(e) => onUpdate('license', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option>ParagonDAO Open Research License</option>
                <option>Commercial License</option>
                <option>Research Only</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tags (comma separated)</label>
              <input
                type="text"
                value={Array.isArray(draft.tags) ? draft.tags.join(', ') : (draft.tags || '')}
                onChange={(e) => onUpdate('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                placeholder="e.g. sleep, eeg, gle"
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Live Preview — Your Exchange Card
        </div>
        <div style={{ maxWidth: '380px' }}>
          <ExchangeCard model={previewModel} />
        </div>
      </div>
    </div>
  )
}

// ─── Step 7: Success ──────────────────────────────────────────────────────────
function StepSuccess({ modelDraft, certificationTier, onReset, navigate, cardStyle, textPrimary, textSecondary, isDark, indigo, primaryBtnStyle, secondaryBtnStyle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        style={cardStyle({ textAlign: 'center', padding: '48px 32px' })}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
          style={{ fontSize: '64px', marginBottom: '20px' }}
        >
          ✅
        </motion.div>

        <h2 style={{ fontSize: '28px', fontWeight: '800', color: textPrimary, margin: '0 0 8px' }}>
          Your Model Is Live
        </h2>
        <p style={{ fontSize: '15px', color: textSecondary, maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          <strong>{modelDraft.name}</strong> is now independently verified, on-chain certified, and published to the Exchange. Researchers and builders worldwide can find it, evaluate it, and build on it.
        </p>

        {certificationTier && (
          <div style={{ marginBottom: '24px' }}>
            <CertificationBadge tier={certificationTier} size="lg" animate />
          </div>
        )}

        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          maxWidth: '400px',
          margin: '0 auto',
        }}>
          <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '4px' }}>Exchange URL</div>
          <div style={{ fontSize: '14px', color: indigo, fontFamily: 'monospace' }}>
            paragondao.org/exchange/preview
          </div>
        </div>
      </motion.div>

      {/* Projected impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={cardStyle({ padding: '24px 28px' })}
      >
        <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, marginBottom: '4px' }}>
          What Happens Next
        </div>
        <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '16px' }}>
          Projected impact based on average growth of certified models on the Exchange
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}>
          {simulationProjectedImpact.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.15 }}
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: isDark ? 'rgba(245,158,11,0.04)' : 'rgba(245,158,11,0.03)',
                border: `1px solid ${isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)'}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
                {row.month}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: textPrimary }}>
                {row.people >= 1000 ? (row.people / 1000).toFixed(0) + 'K' : row.people.toLocaleString()}
              </div>
              <div style={{ fontSize: '10px', color: textSecondary }}>people screened</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, marginTop: '4px' }}>
                {row.apps} apps · ${row.revenue >= 1000 ? (row.revenue / 1000).toFixed(1) + 'K' : row.revenue.toFixed(0)}
              </div>
            </motion.div>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: textSecondary, marginTop: '12px', textAlign: 'center', opacity: 0.7 }}>
          Projections based on average growth of Gold-certified sleep staging models. Actual results depend on model quality and market demand.
        </div>
      </motion.div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/exchange')} style={primaryBtnStyle}>
          See Your Listing
        </button>
        <button onClick={() => navigate('/proof-pipeline')} style={secondaryBtnStyle}>
          How Verification Works
        </button>
        <button onClick={onReset} style={secondaryBtnStyle}>
          Submit Another Model
        </button>
      </div>
    </div>
  )
}

export default ForgeSubmitPage
