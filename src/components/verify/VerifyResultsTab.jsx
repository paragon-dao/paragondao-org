import { motion } from 'framer-motion'
import { useTheme } from '../../providers/ThemeProvider'
import AnimatedNumber from './AnimatedNumber'
import Skeleton from './Skeleton'
import { getVerifyColors, cardStyle, sectionAnim } from './verifyStyles'

export default function VerifyResultsTab({ model, results, benchmark, loading, rerunning, onRerun }) {
  const { isDark } = useTheme()
  const c = getVerifyColors(isDark)

  const fallback = model.fallbackResults || {}
  const overall = results?.overall || fallback.overall || {}
  const leaderboard = benchmark?.leaderboard?.length > 0 ? benchmark.leaderboard : (fallback.leaderboard || [])
  const pScore = benchmark?.paragondao?.score || overall.normalized_error || model.accuracy?.value
  const totalTeams = benchmark?.total_teams || model.accuracy?.totalTeams || 0
  const perSubject = results?.per_subject?.length > 0 ? results.per_subject : (fallback.perSubject || [])

  const apiBaseUrl = import.meta.env.VITE_VERIFY_API_URL || 'http://localhost:2051'

  // For non-verified models, show claimed metrics
  if (model.status !== 'verified') {
    return (
      <div>
        <ClaimedMetricsCard model={model} isDark={isDark} c={c} />
        <MethodologySection model={model} isDark={isDark} c={c} />
      </div>
    )
  }

  return (
    <div>
      {/* Competition Benchmark */}
      <motion.div {...sectionAnim} style={{ marginBottom: '64px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textSecondary, marginBottom: '4px' }}>
          {model.accuracy?.competition || 'Competition Benchmark'}
        </div>
        <div style={{ fontSize: '14px', color: c.textSecondary, marginBottom: '24px' }}>
          Challenge 2: Subject-Invariant Representation
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Skeleton height="200px" style={{ flex: 3 }} isDark={isDark} />
            <Skeleton height="200px" style={{ flex: 2 }} isDark={isDark} />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Leaderboard table */}
            <div style={{ flex: '3 1 400px', minWidth: '300px' }}>
              <div style={cardStyle(isDark, { padding: '0', overflow: 'hidden' })}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.cardBorder}` }}>
                      {['Rank', 'Team', 'Normalized Error'].map(h => (
                        <th key={h} style={{
                          padding: '14px 20px', textAlign: h === 'Normalized Error' ? 'right' : 'left',
                          fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
                          letterSpacing: '0.06em', color: c.textSecondary,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, i) => (
                      <tr key={i} style={{ borderBottom: i < leaderboard.length - 1 ? `1px solid ${c.cardBorder}` : 'none' }}>
                        <td style={{ padding: '14px 20px', color: c.textSecondary, fontSize: '14px', fontFamily: 'monospace' }}>#{entry.rank}</td>
                        <td style={{ padding: '14px 20px', color: c.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                          {entry.team}
                          {entry.institution && <span style={{ color: c.textSecondary, fontSize: '12px', fontWeight: '400', marginLeft: '8px' }}>{entry.institution}</span>}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontFamily: 'monospace', fontSize: '17px', fontWeight: '600', color: c.textPrimary }}>
                          {entry.score.toFixed(5)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '12px 20px', fontSize: '12px', color: c.textSecondary, borderTop: `1px solid ${c.cardBorder}` }}>
                  Lower normalized error = better. 1.0 = no improvement over baseline.
                </div>
              </div>
            </div>

            {/* ParagonDAO hero card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.15 }}
              style={{
                flex: '2 1 280px', minWidth: '260px',
                ...cardStyle(isDark, {
                  border: `2px solid ${c.greenBorder}`,
                  background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  alignItems: 'center', textAlign: 'center', padding: '32px 24px',
                })
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: c.textPrimary, fontSize: '14px', fontWeight: '600' }}>ParagonDAO</span>
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', background: c.green, color: '#fff', letterSpacing: '0.04em' }}>VERIFIED</span>
              </div>
              <AnimatedNumber value={pScore} decimals={5} duration={1.4} style={{
                fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: '800',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                color: c.green, display: 'block', lineHeight: '1.1', margin: '8px 0',
              }} />
              <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: c.textSecondary, marginBottom: '12px' }}>
                Normalized Error (competition metric)
              </div>
              <div style={{ fontSize: '14px', color: c.textSecondary, marginBottom: '4px' }}>
                vs. {leaderboard[0]?.score?.toFixed(5) || '0.97843'} (1st place)
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: c.green, padding: '6px 16px', borderRadius: '8px', marginTop: '8px', background: 'rgba(16,185,129,0.1)' }}>
                {model.accuracy?.improvementRatio || '13.5x'} more improvement
              </div>
              <div style={{ fontSize: '12px', color: c.textSecondary, marginTop: '12px' }}>
                HFTP + Domain Adversarial Training
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Verification Dashboard */}
      {!loading && (
        <motion.div {...sectionAnim} style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ color: c.textPrimary, fontSize: '20px', fontWeight: '700', margin: 0 }}>Verification Dashboard</h3>
              <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: c.greenBg, color: c.green, border: `1px solid ${c.greenBorder}` }}>VERIFIED</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {results?.verified_at && (
                <span style={{ color: c.textSecondary, fontSize: '12px' }}>
                  Last verified: {new Date(results.verified_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              <button onClick={onRerun} disabled={rerunning} style={{
                padding: '6px 14px', borderRadius: '8px',
                background: rerunning ? 'rgba(255,255,255,0.03)' : c.greenBg,
                border: `1px solid ${c.greenBorder}`, color: c.green,
                fontSize: '12px', fontWeight: '600', cursor: rerunning ? 'not-allowed' : 'pointer',
              }}>
                {rerunning ? 'Running...' : 'Re-run Verification'}
              </button>
            </div>
          </div>

          {/* Hero metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {[
              { label: 'Normalized Error', sublabel: 'Competition metric', value: overall.normalized_error, decimals: 5, accent: true },
              { label: 'Prediction-Target Correlation', sublabel: 'Alignment strength', value: overall.correlation, decimals: 5 },
              { label: 'Test Samples Evaluated', sublabel: 'Across 3 unseen subjects', value: overall.total_samples, decimals: 0 },
            ].map((m, i) => (
              <div key={i} style={cardStyle(isDark, { textAlign: 'center', padding: '28px 20px' })}>
                <div style={{ color: c.textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{m.label}</div>
                <AnimatedNumber value={m.value} decimals={m.decimals} duration={1.2} style={{
                  fontSize: '32px', fontWeight: '800', fontFamily: "'JetBrains Mono', monospace",
                  color: m.accent ? c.green : c.textPrimary, display: 'block', margin: '6px 0',
                }} />
                <div style={{ color: c.textSecondary, fontSize: '12px' }}>{m.sublabel}</div>
              </div>
            ))}
          </div>

          {/* Supporting metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            {[
              { label: 'MSE', value: overall.mse?.toFixed(6) },
              { label: 'RMSE', value: overall.rmse?.toFixed(6) },
              { label: 'Unseen Subjects', value: overall.total_subjects },
            ].map((m, i) => (
              <div key={i} style={cardStyle(isDark, { textAlign: 'center', padding: '16px' })}>
                <div style={{ color: c.textSecondary, fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{m.label}</div>
                <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'monospace', color: c.textSecondary }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Per-subject */}
          {perSubject.length > 0 && (
            <>
              <div style={{ fontSize: '15px', fontWeight: '600', color: c.textPrimary, marginBottom: '12px' }}>Per-Subject Performance</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {perSubject.map((subj, i) => (
                  <div key={i} style={cardStyle(isDark)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ color: c.textPrimary, fontSize: '15px', fontWeight: '700' }}>Subject {i + 1}</span>
                      <span style={{ color: c.textSecondary, fontSize: '12px' }}>{subj.samples?.toLocaleString()} samples</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {[
                        { label: 'Correlation', value: subj.correlation?.toFixed(4), color: c.green },
                        { label: 'MSE', value: subj.mse?.toFixed(5), color: c.textPrimary },
                        { label: 'Mean Prediction', value: subj.mean_prediction?.toFixed(4), color: c.textPrimary },
                        { label: 'Actual Mean', value: subj.mean_target?.toFixed(4), color: c.textPrimary },
                      ].map((d, j) => (
                        <div key={j}>
                          <div style={{ color: c.textSecondary, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>{d.label}</div>
                          <div style={{ color: d.color, fontSize: j < 2 ? '18px' : '14px', fontWeight: '700', fontFamily: 'monospace' }}>{d.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {perSubject.length > 1 && (() => {
                const corrs = perSubject.map(s => s.correlation)
                const min = Math.min(...corrs)
                const max = Math.max(...corrs)
                return (
                  <div style={{
                    textAlign: 'center', padding: '10px', borderRadius: '10px',
                    background: isDark ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.03)',
                    border: `1px solid ${c.greenBorder}`, fontSize: '13px', color: c.textSecondary,
                  }}>
                    Cross-subject consistency: correlation range <span style={{ color: c.green, fontWeight: '600' }}>{min.toFixed(3)} — {max.toFixed(3)}</span> across unseen subjects
                  </div>
                )
              })()}
            </>
          )}
        </motion.div>
      )}

      {/* Methodology */}
      <MethodologySection model={model} isDark={isDark} c={c} />
    </div>
  )
}

function ClaimedMetricsCard({ model, isDark, c }) {
  const acc = model.accuracy
  if (!acc) return null
  return (
    <motion.div {...sectionAnim} style={{ marginBottom: '48px' }}>
      <div style={cardStyle(isDark, { padding: '32px', textAlign: 'center' })}>
        <div style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: '8px', marginBottom: '16px',
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          fontSize: '12px', fontWeight: '600', color: '#f59e0b',
        }}>
          Not yet independently verified — results from published literature
        </div>
        <div style={{ fontSize: '48px', fontWeight: '800', fontFamily: "'JetBrains Mono', monospace", color: c.textPrimary, marginBottom: '8px' }}>
          {typeof acc.value === 'number' ? acc.value.toFixed(acc.value < 1 ? 3 : 2) : acc.value}
        </div>
        <div style={{ fontSize: '14px', color: c.textSecondary, marginBottom: '4px' }}>{acc.metric}</div>
        {acc.source && <div style={{ fontSize: '12px', color: c.textSecondary, fontStyle: 'italic' }}>Source: {acc.source}</div>}
      </div>
    </motion.div>
  )
}

function MethodologySection({ model, isDark, c }) {
  return (
    <motion.div {...sectionAnim} style={{ marginBottom: '64px' }}>
      <h3 style={{ color: c.textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>How It Works</h3>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: '3 1 360px', minWidth: '280px' }}>
          <div style={cardStyle(isDark, { padding: '32px' })}>
            {[
              { title: 'Data Split Protocol', text: `${model.dataset?.trainSubjects || '?'} training / ${model.dataset?.valSubjects || '?'} validation / ${model.dataset?.testSubjects || '?'} test subjects. Zero overlap. The model has never seen any data from test subjects during training — proving true generalization to new individuals.` },
              { title: 'What "Subject Invariant" Means', text: 'Brain signals vary between individuals — skull thickness, electrode placement, and neural architecture all differ. Domain adversarial training forces the model to learn universal patterns that transfer to anyone.' },
              { title: 'Competition Protocol', text: 'The NeurIPS 2025 EEG Foundation Model Challenge tested generalization to unseen subjects. Normalized error compares model MSE to a mean-prediction baseline. Lower is better.', link: true },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? '24px' : 0 }}>
                <h4 style={{ color: c.textPrimary, fontSize: '15px', fontWeight: '700', marginBottom: '6px', marginTop: 0 }}>{item.title}</h4>
                <p style={{ color: c.textSecondary, fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                  {item.text}
                  {item.link && (
                    <> <a href="https://eeg-foundation.github.io/challenge/" target="_blank" rel="noopener noreferrer" style={{ color: c.green, textDecoration: 'none', fontWeight: '500' }}>NeurIPS Challenge Page →</a></>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture pipeline */}
        <div style={{ flex: '2 1 280px', minWidth: '240px' }}>
          <div style={cardStyle(isDark, { padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' })}>
            {[
              { label: 'Raw EEG Signal', sub: '4 ch x 200 samples', color: c.textSecondary },
              null,
              { label: 'Dual-Domain Extraction', sub: 'HFTP (frequency) + CNN (time)', color: c.green },
              null,
              { label: 'Feature Fusion', sub: 'Cross-domain attention', color: c.textPrimary },
              null,
              { label: 'Subject Normalization', sub: 'Adversarial training', color: c.indigo },
              null,
              { label: 'Prediction', sub: 'Task-specific output', color: c.green },
            ].map((item, i) => {
              if (!item) {
                return (
                  <div key={i} style={{ width: '2px', height: '20px', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }}>
                    <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `6px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`, marginLeft: '-4px', marginTop: '20px' }} />
                  </div>
                )
              }
              const isGreen = item.color === c.green
              const isIndigo = item.color === c.indigo
              return (
                <div key={i} style={{
                  width: '100%', padding: '14px 18px', borderRadius: '10px',
                  border: `1px solid ${isGreen ? c.greenBorder : isIndigo ? 'rgba(99,102,241,0.25)' : c.cardBorder}`,
                  background: isGreen ? 'rgba(16,185,129,0.06)' : isIndigo ? 'rgba(99,102,241,0.05)' : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '650', color: c.textPrimary }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: c.textSecondary, marginTop: '2px' }}>{item.sub}</div>
                </div>
              )
            })}
            <p style={{ color: c.textSecondary, fontSize: '12px', textAlign: 'center', marginTop: '16px', marginBottom: 0, lineHeight: '1.6' }}>
              Same pipeline for EEG, metabolomics, Raman spectroscopy, and audio — only the input layer changes.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
