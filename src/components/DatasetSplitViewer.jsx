import { useTheme } from '../providers/ThemeProvider'

const SPLIT_COLORS = {
  train: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', label: 'Train' },
  val: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Validation' },
  test: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Test' },
}

export default function DatasetSplitViewer({ dataset }) {
  const { isDark } = useTheme()

  if (!dataset) return null

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const { trainSubjects, valSubjects, testSubjects, totalSubjects } = dataset
  const total = totalSubjects || (trainSubjects + valSubjects + testSubjects)
  const splits = [
    { key: 'train', count: trainSubjects },
    { key: 'val', count: valSubjects },
    { key: 'test', count: testSubjects },
  ].filter(s => s.count != null)

  return (
    <div>
      {/* Horizontal bar */}
      <div style={{
        display: 'flex', height: '28px', borderRadius: '8px', overflow: 'hidden',
        border: `1px solid ${cardBorder}`, marginBottom: '12px',
      }}>
        {splits.map(s => {
          const pct = total > 0 ? (s.count / total) * 100 : 0
          const cfg = SPLIT_COLORS[s.key]
          return (
            <div key={s.key} style={{
              width: `${pct}%`, background: cfg.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRight: `1px solid ${cardBorder}`,
              minWidth: pct > 5 ? 'auto' : '24px',
            }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: cfg.color }}>
                {s.count} {cfg.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend + badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          {splits.map(s => {
            const cfg = SPLIT_COLORS[s.key]
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: cfg.color }} />
                <span style={{ fontSize: '12px', color: textSecondary }}>
                  {cfg.label}: <span style={{ fontWeight: '600', color: textPrimary }}>{s.count}</span>
                </span>
              </div>
            )
          })}
        </div>

        {dataset.splitMethod?.toLowerCase().includes('zero overlap') && (
          <span style={{
            padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
            background: 'rgba(16,185,129,0.1)', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.3)',
          }}>
            Zero data leakage verified
          </span>
        )}
      </div>

      {/* Summary table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
            {['Split', 'Subjects', 'Method'].map(h => (
              <th key={h} style={{
                padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: '600',
                textTransform: 'uppercase', letterSpacing: '0.05em', color: textSecondary,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {splits.map(s => {
            const cfg = SPLIT_COLORS[s.key]
            return (
              <tr key={s.key} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                <td style={{ padding: '8px 10px', fontWeight: '600', color: cfg.color }}>{cfg.label}</td>
                <td style={{ padding: '8px 10px', color: textPrimary, fontFamily: 'monospace' }}>{s.count}</td>
                <td style={{ padding: '8px 10px', color: textSecondary }}>{dataset.splitMethod || 'N/A'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
