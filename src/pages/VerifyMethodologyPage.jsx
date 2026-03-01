import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'
import { useMagic } from '../providers/MagicProvider'
import { getCurrentUser } from '../services/api'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { CERTIFICATION_TIERS } from '../data/mockBuilderData'
import { getVerifyColors, cardStyle, sectionAnim } from '../components/verify/verifyStyles'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'competition', label: 'Competition Protocol' },
  { id: 'metric', label: 'Normalized Error' },
  { id: 'splits', label: 'Subject-Level Splits' },
  { id: 'privacy', label: 'Privacy Testing' },
  { id: 'tiers', label: 'Certification Tiers' },
  { id: 'data-format', label: 'Data Format' },
  { id: 'faq', label: 'FAQ' },
]

export default function VerifyMethodologyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()
  const { isLoggedIn } = useMagic()
  const storedUser = getCurrentUser()
  const isAuthenticated = isLoggedIn || !!storedUser
  const c = getVerifyColors(isDark)

  // Scroll to anchor on load
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      background: isDark ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    }}>
      <SEO title="Verification Methodology — ParagonDAO" description="How ParagonDAO verifies health models: NeurIPS-grade benchmarks, subject-level splits, privacy attacks, and on-chain certification." path="/verify/methodology" />
      <Background />
      <Header searchQuery="" lastSearchedTerm="" setSearchQuery={() => {}} handleSearch={() => {}} isSearching={false} isSearchExpanded={false} setIsSearchExpanded={() => {}} isAuthenticated={isAuthenticated} onLoginClick={() => navigate('/login')} onSignupClick={() => navigate('/login')} />

      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <button onClick={() => navigate('/verify')} style={{ background: 'none', border: 'none', color: c.green, cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: 0 }}>Verify</button>
            <span style={{ color: c.textSecondary, fontSize: '14px' }}>/</span>
            <span style={{ color: c.textPrimary, fontSize: '14px', fontWeight: '600' }}>Methodology</span>
          </div>

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '48px' }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800',
              background: isDark ? 'linear-gradient(135deg, #fff 0%, #6ee7b7 60%, #10b981 100%)' : 'linear-gradient(135deg, #1e293b 0%, #059669 60%, #10b981 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              margin: '0 0 16px 0', lineHeight: '1.1',
            }}>
              Verification Methodology
            </h1>
            <p style={{ color: c.textSecondary, fontSize: '16px', lineHeight: '1.65', maxWidth: '700px', margin: 0 }}>
              How ParagonDAO verifies health models — from competition-grade benchmarks to privacy attacks to on-chain certification. Every step is transparent and reproducible.
            </p>
          </motion.div>

          {/* Quick nav */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '48px' }}>
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${c.cardBorder}`, color: c.textSecondary, textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}>{s.label}</a>
            ))}
          </div>

          {/* ── Section 1: Overview ── */}
          <Section id="overview" title="1. Overview" isDark={isDark} c={c}>
            <p>Model verification is the process of independently confirming that a health AI model performs as claimed — on data it has never seen, under conditions that prevent gaming.</p>
            <p>The ParagonDAO verification pipeline follows a 7-step process:</p>
            <PipelineSteps isDark={isDark} c={c} />
            <p>Every step produces auditable artifacts. Results are published on-chain so they cannot be altered retroactively.</p>
          </Section>

          {/* ── Section 2: Competition Protocol ── */}
          <Section id="competition" title="2. Competition Protocol" isDark={isDark} c={c}>
            <p>Our verification methodology is based on the <strong>NeurIPS 2025 EEG Foundation Model Challenge</strong>, one of the largest open benchmarks for biosignal AI. The competition attracted 1,183 teams worldwide.</p>
            <p>Key rules we follow from the NeurIPS protocol:</p>
            <ul>
              <li><strong>Subject-level splits</strong> — test subjects are completely unseen during training</li>
              <li><strong>Normalized error metric</strong> — enables comparison across different tasks and datasets</li>
              <li><strong>Standardized preprocessing</strong> — no custom augmentation of test data allowed</li>
              <li><strong>Reproducible evaluation</strong> — same evaluation script for all submissions</li>
            </ul>
            <p>
              <a href="https://eeg-foundation.github.io/challenge/" target="_blank" rel="noopener noreferrer" style={{ color: c.green, textDecoration: 'none', fontWeight: '600' }}>Official NeurIPS Challenge Page →</a>
            </p>
          </Section>

          {/* ── Section 3: Normalized Error ── */}
          <Section id="metric" title="3. Normalized Error Metric" isDark={isDark} c={c}>
            <p>The primary metric is <strong>Normalized Root Mean Square Error (NRMSE)</strong>:</p>
            <div style={{
              padding: '20px', borderRadius: '10px', background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${c.cardBorder}`, fontFamily: 'monospace', fontSize: '15px',
              textAlign: 'center', color: c.textPrimary, marginBottom: '16px',
            }}>
              NRMSE = RMSE(model) / RMSE(mean_baseline)
            </div>
            <ul>
              <li><strong>1.0</strong> = model performs same as always predicting the mean (no improvement)</li>
              <li><strong>&lt; 1.0</strong> = model outperforms the baseline (lower is better)</li>
              <li><strong>0.709</strong> = ParagonDAO's GLE encoder (29.1% better than baseline)</li>
              <li><strong>0.978</strong> = NeurIPS 2025 winner (2.2% better than baseline)</li>
            </ul>
            <p>ParagonDAO improved <strong>13.5x more</strong> below baseline than the winning team. Both beat baseline, but our improvement margin was dramatically larger.</p>
          </Section>

          {/* ── Section 4: Subject-Level Splits ── */}
          <Section id="splits" title="4. Subject-Level Splits" isDark={isDark} c={c}>
            <p>The most important design choice in biosignal AI evaluation is the data split strategy. There are two approaches:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div style={cardStyle(isDark, { padding: '20px', borderColor: '#ef4444' })}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>Sample-Level Splits (WRONG)</div>
                <p style={{ fontSize: '13px', margin: 0 }}>Randomly shuffle all samples across train/test. The model sees other samples from the same person during training → inflated accuracy that doesn't generalize.</p>
              </div>
              <div style={cardStyle(isDark, { padding: '20px', borderColor: c.green })}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: c.green, marginBottom: '8px' }}>Subject-Level Splits (CORRECT)</div>
                <p style={{ fontSize: '13px', margin: 0 }}>All samples from a subject go into one split only. If subject 18 is in test, zero samples from subject 18 appear in train or validation. This tests true generalization.</p>
              </div>
            </div>
            <p>Our <code>verify_subject_splits.py</code> script programmatically checks for any overlap between splits and fails verification if found. The current split: 14 train / 3 validation / 3 test subjects with zero overlap.</p>
          </Section>

          {/* ── Section 5: Privacy Testing ── */}
          <Section id="privacy" title="5. Privacy Testing" isDark={isDark} c={c}>
            <p>Every verified model undergoes three standard privacy attacks from the academic literature:</p>
            {[
              { name: 'Membership Inference Attack', desc: 'Tests whether an attacker can determine if a specific individual\'s data was used in training. Based on Shokri et al. (2017). A model that memorizes training data will have lower error on training samples.', result: 'Our model: 0.512 accuracy (random chance = 0.500). No memorization detected.' },
              { name: 'Model Inversion Attack', desc: 'Tests whether an attacker can reconstruct input data from model outputs using gradient-based optimization. Based on Fredrikson et al. (2015). Reconstructed inputs should bear no resemblance to originals.', result: 'Our model: 0.034 correlation (zero = no recovery). Inputs cannot be reverse-engineered.' },
              { name: 'Attribute Inference Attack', desc: 'Tests whether an attacker can identify which subject produced the data from model embeddings. Our GradientReversalLayer (Ganin & Lempitsky, 2015) explicitly trains the model to be subject-invariant.', result: 'Our model: 3.9% advantage over random. Subject identity is effectively erased.' },
            ].map((a, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <h4 style={{ color: c.textPrimary, fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0' }}>{a.name}</h4>
                <p style={{ fontSize: '14px', margin: '0 0 6px 0' }}>{a.desc}</p>
                <div style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', background: c.purpleBg, color: c.purple, display: 'inline-block' }}>{a.result}</div>
              </div>
            ))}
          </Section>

          {/* ── Section 6: Certification Tiers ── */}
          <Section id="tiers" title="6. Certification Tiers" isDark={isDark} c={c}>
            <p>Models that pass verification receive a certification tier based on their performance level:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${c.cardBorder}` }}>
                  {['Tier', 'Requirement', 'Min. Accuracy', 'Privacy Required'].map(h => (
                    <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: c.textSecondary }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(CERTIFICATION_TIERS).map(([key, info]) => (
                  <tr key={key} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <td style={{ padding: '10px', fontWeight: '700', color: info.color }}>{info.label}</td>
                    <td style={{ padding: '10px', color: c.textSecondary }}>{info.requirement}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: c.textPrimary }}>{(info.minAccuracy * 100).toFixed(0)}%</td>
                    <td style={{ padding: '10px', color: c.textSecondary }}>{key === 'platinum' || key === 'gold' ? 'Yes' : 'Optional'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>Platinum certification additionally requires that the model passes all three privacy attacks with a "STRONG" grade.</p>
          </Section>

          {/* ── Section 7: Data Format ── */}
          <Section id="data-format" title="7. Data Format" isDark={isDark} c={c}>
            <p>For EEG models, the standard input format is:</p>
            <div style={{
              padding: '16px', borderRadius: '10px', background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${c.cardBorder}`, fontFamily: 'monospace', fontSize: '13px',
              color: c.textPrimary, marginBottom: '16px',
            }}>
              <div>Shape: [4, 200] — 4 channels x 200 samples</div>
              <div>Channels: TP9, AF7, AF8, TP10 (Muse headband placement)</div>
              <div>Sampling rate: 100 Hz</div>
              <div>Window: 2 seconds</div>
              <div>Units: microvolts (raw)</div>
              <div>Frequency bands captured: Delta (0.5-4Hz), Theta (4-8Hz), Alpha (8-13Hz), Beta (13-30Hz)</div>
            </div>
            <p>The GLE encoding pipeline transforms this raw signal through:</p>
            <ol>
              <li><strong>HFTP (frequency domain)</strong> — DCT-II based harmonic decomposition into 128 frequency coefficients</li>
              <li><strong>CNN (time domain)</strong> — 1D convolutional extraction of temporal patterns</li>
              <li><strong>Cross-domain attention</strong> — fuses frequency and time representations</li>
              <li><strong>Domain adversarial layer</strong> — GradientReversalLayer removes subject-specific information</li>
            </ol>
            <p>The <code>verify_data_compliance.py</code> script checks that submitted data conforms to these format requirements before verification runs.</p>
          </Section>

          {/* ── Section 8: FAQ ── */}
          <Section id="faq" title="8. FAQ" isDark={isDark} c={c}>
            {[
              { q: 'Can I verify these results myself?', a: 'Yes. The verification API is public. Send EEG data to the /predict endpoint and compare results. The benchmark script and evaluation metrics are documented above.' },
              { q: 'Is this a third-party audit?', a: 'No. These are self-administered tests following standard academic methodologies. We publish all methodology so third parties can replicate. ParagonDAO validators independently confirm results, but we do not claim third-party audit status.' },
              { q: 'Does the model need FDA clearance?', a: 'The GLE encoder itself is not a medical device. Applications built on top of GLE that make clinical claims (diagnosis, treatment recommendations) would independently need to pursue SaMD (Software as a Medical Device) classification.' },
              { q: 'How do I submit my own model for verification?', a: 'Use the Forge submission page (/forge/submit). You can run in simulation mode without uploading weights. For full verification, upload your model artifact and select benchmarks.' },
              { q: 'What happens after verification?', a: 'Verified models receive a certification tier (Bronze through Platinum) and their results are published on-chain. They can then be listed on the Exchange for other builders to integrate.' },
              { q: 'How often is re-verification required?', a: 'Models are re-verified when new benchmark datasets become available or when the model is updated. The on-chain record preserves the history of all verification runs.' },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <h4 style={{ color: c.textPrimary, fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0' }}>{item.q}</h4>
                <p style={{ fontSize: '14px', margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </Section>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function Section({ id, title, isDark, c, children }) {
  return (
    <motion.section {...sectionAnim} id={id} style={{ marginBottom: '48px', scrollMarginTop: '120px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: c.textPrimary, marginBottom: '16px', marginTop: 0 }}>{title}</h2>
      <div style={{ fontSize: '14px', color: c.textSecondary, lineHeight: '1.75' }}>
        {children}
      </div>
    </motion.section>
  )
}

function PipelineSteps({ isDark, c }) {
  const steps = [
    { num: '1', label: 'Register Model', desc: 'Upload metadata and select benchmarks' },
    { num: '2', label: 'Upload Artifact', desc: 'Model weights stored encrypted on IPFS' },
    { num: '3', label: 'Select Benchmarks', desc: 'Choose from standard evaluation suites' },
    { num: '4', label: 'Independent Verification', desc: '5 validators run evaluation independently' },
    { num: '5', label: 'Results + Certification', desc: 'Tier awarded based on performance' },
    { num: '6', label: 'On-Chain Publication', desc: 'Results hash published to Ethereum' },
    { num: '7', label: 'List on Exchange', desc: 'Verified model available to builders' },
  ]

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
      {steps.map((s, i) => (
        <div key={i} style={{
          flex: '1 0 120px', padding: '12px', borderRadius: '10px',
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${c.cardBorder}`, textAlign: 'center',
        }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: c.green, marginBottom: '4px' }}>{s.num}</div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: c.textPrimary, marginBottom: '2px' }}>{s.label}</div>
          <div style={{ fontSize: '11px', color: c.textSecondary }}>{s.desc}</div>
        </div>
      ))}
    </div>
  )
}
