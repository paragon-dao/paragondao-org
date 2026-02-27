import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'

function formatNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export default function ImpactDashboard({ impact, showRevenue = false, isMobile = false }) {
  const { isDark } = useTheme()

  if (!impact) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
        <div style={{ fontSize: '15px', fontWeight: '600', color: isDark ? '#fff' : '#1e293b' }}>
          Impact data available after publication
        </div>
        <div style={{ fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8', marginTop: '4px' }}>
          Once your model is published to the Exchange and apps begin using it, impact metrics will appear here.
        </div>
      </div>
    )
  }

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardInnerBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
  const cardInnerBorder = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

  const StatCard = ({ label, value, sub, color = textPrimary }) => (
    <div style={{
      padding: '16px',
      borderRadius: '12px',
      background: cardInnerBg,
      border: `1px solid ${cardInnerBorder}`,
      flex: '1 1 140px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '11px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: '800', color }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: textSecondary, marginTop: '2px' }}>
          {sub}
        </div>
      )}
    </div>
  )

  const maxTimelineVal = Math.max(...impact.timeline.map(t => t.people))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero stats */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <StatCard
          label="People Reached"
          value={formatNum(impact.peopleReached.thisMonth)}
          sub={`${formatNum(impact.peopleReached.total)} all-time`}
          color="#f59e0b"
        />
        <StatCard
          label="Active Apps"
          value={impact.activeApps}
          sub={`using this model`}
          color="#6366f1"
        />
        <StatCard
          label="Screenings"
          value={formatNum(impact.peopleReached.screeningsCompleted)}
          sub="completed"
          color="#10b981"
        />
        <StatCard
          label="API Calls / Month"
          value={formatNum(impact.apiCalls.thisMonth)}
          sub={`+${Math.round(impact.apiCalls.trend * 100)}% vs last month`}
          color={textPrimary}
        />
      </div>

      {/* Impact timeline */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: cardInnerBg,
        border: `1px solid ${cardInnerBorder}`,
      }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, marginBottom: '16px' }}>
          Growth Timeline
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' }}>
          {impact.timeline.map((t, i) => {
            const height = maxTimelineVal > 0 ? (t.people / maxTimelineVal) * 100 : 0
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b' }}>
                  {formatNum(t.people)}
                </div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  style={{
                    width: '100%',
                    maxWidth: '48px',
                    borderRadius: '6px 6px 2px 2px',
                    background: `linear-gradient(180deg, #f59e0b, ${isDark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.4)'})`,
                    minHeight: '4px',
                  }}
                />
                <div style={{ fontSize: '10px', color: textSecondary, whiteSpace: 'nowrap' }}>
                  {t.month}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: textSecondary,
          textAlign: 'center',
        }}>
          People reached per month since publication
        </div>
      </div>

      {/* Geographic reach */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: cardInnerBg,
        border: `1px solid ${cardInnerBorder}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary }}>
            Geographic Reach
          </div>
          <div style={{
            fontSize: '12px',
            padding: '3px 10px',
            borderRadius: '999px',
            background: 'rgba(99,102,241,0.1)',
            color: '#6366f1',
            fontWeight: '600',
          }}>
            {impact.geography.countries} countries
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {impact.geography.topRegions.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: textPrimary, width: '120px', flexShrink: 0 }}>
                {r.name}
              </span>
              <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.percentage}%` }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{
                    height: '100%',
                    borderRadius: '4px',
                    background: `linear-gradient(90deg, #6366f1, #8b5cf6)`,
                  }}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: textSecondary, width: '36px', textAlign: 'right' }}>
                {r.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Apps using this model */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: cardInnerBg,
        border: `1px solid ${cardInnerBorder}`,
      }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, marginBottom: '12px' }}>
          Apps Built on This Model
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {impact.appNames.map((name, i) => (
            <div key={i} style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`,
              fontSize: '13px',
              fontWeight: '500',
              color: textPrimary,
            }}>
              {name}
            </div>
          ))}
          {impact.activeApps > impact.appNames.length && (
            <div style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              fontSize: '13px',
              color: textSecondary,
            }}>
              +{impact.activeApps - impact.appNames.length} more
            </div>
          )}
        </div>
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
          border: `1px solid ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'}`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: textPrimary }}>
            Build With This Model
          </div>
          <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>
            One API endpoint. Verified accuracy guaranteed by on-chain certification.
          </div>
        </div>
      </div>

      {/* Revenue (only visible in builder's own Forge view) */}
      {showRevenue && impact.revenue && (
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.03)',
          border: `1px solid ${isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)'}`,
        }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, marginBottom: '12px' }}>
            Revenue
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                This Month
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#10b981' }}>
                ${impact.revenue.thisMonth.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                All-Time
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: textPrimary }}>
                ${impact.revenue.totalEarned.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Per API Call
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: textSecondary }}>
                ${impact.revenue.perCallRate.toFixed(3)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: textSecondary, lineHeight: '1.5' }}>
            You earn ${impact.revenue.perCallRate.toFixed(3)} per API call when apps use your model through the BAGLE API.
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ fontSize: '11px', color: textSecondary, lineHeight: '1.5', opacity: 0.7 }}>
        Impact metrics reflect wellness screening activity. Models on the ParagonDAO Exchange are verified
        for accuracy, not for clinical diagnostic use. Wellness screenings are informational and do not
        constitute medical advice.
      </div>
    </div>
  )
}
