import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../providers/ThemeProvider'
import { useNavigate } from 'react-router-dom'

// Region definitions with bounding boxes and sentinel suggestions
const REGIONS = [
  {
    id: 'mountain-west',
    match: (lat, lon) => lat > 35 && lat < 49 && lon > -120 && lon < -104,
    sentinels: [
      { name: 'Wildfire Smoke Sentinel', icon: '🔥', bodies: 'Forest + atmosphere + wind', status: 'Needed', desc: 'Smoke plume tracking, air quality forecasting, evacuation windows', priority: 'high' },
      { name: 'Drought Monitor', icon: '🏜️', bodies: 'Watershed + soil + snowpack', status: 'Needed', desc: 'Multi-basin water stress, agricultural impact early warning', priority: 'medium' },
    ],
  },
  {
    id: 'florida',
    match: (lat, lon) => lat > 24 && lat < 31.5 && lon > -88 && lon < -79,
    sentinels: [
      { name: 'Hurricane Sentinel', icon: '🌀', bodies: 'Ocean + atmosphere + barometric', status: 'Needed', desc: 'Tropical cyclone tracking, storm surge prediction, evacuation timing', priority: 'high' },
      { name: 'Lake Okeechobee Sentinel', icon: '💧', bodies: 'Lake level + algae + runoff', status: 'Needed', desc: 'Algae bloom detection, water quality monitoring, discharge impact', priority: 'high' },
      { name: 'Red Tide Monitor', icon: '🌊', bodies: 'Ocean temp + nutrients + wind', status: 'Needed', desc: 'Karenia brevis bloom prediction, coastal air quality', priority: 'medium' },
    ],
  },
  {
    id: 'california',
    match: (lat, lon) => lat > 32 && lat < 42 && lon > -125 && lon < -114,
    sentinels: [
      { name: 'Wildfire Smoke Sentinel', icon: '🔥', bodies: 'Forest + atmosphere + wind', status: 'Needed', desc: 'AQI forecasting during fire season, smoke plume trajectory', priority: 'high' },
      { name: 'Salton Sea Sentinel', icon: '🏜️', bodies: 'Lake recession + dust + toxins', status: 'Needed', desc: 'Exposed playa dust, lithium mining impact, respiratory threats', priority: 'high' },
      { name: 'Earthquake Early Warning', icon: '⚡', bodies: 'Seismic + groundwater + ionosphere', status: 'Research', desc: 'Pre-seismic signal detection via frequency analysis', priority: 'medium' },
    ],
  },
  {
    id: 'gulf-coast',
    match: (lat, lon) => lat > 27 && lat < 31 && lon > -97 && lon < -87,
    sentinels: [
      { name: 'Chemical Corridor Sentinel', icon: '⚗️', bodies: 'Air toxics + wind + industrial', status: 'Needed', desc: 'Cancer Alley monitoring, refinery emission tracking, community alerts', priority: 'high' },
      { name: 'Hurricane Sentinel', icon: '🌀', bodies: 'Ocean + atmosphere + barometric', status: 'Needed', desc: 'Gulf storm tracking, surge prediction, evacuation windows', priority: 'high' },
    ],
  },
  {
    id: 'pacific-nw',
    match: (lat, lon) => lat > 42 && lat < 49 && lon > -125 && lon < -116,
    sentinels: [
      { name: 'Wildfire Smoke Sentinel', icon: '🔥', bodies: 'Forest + atmosphere + wind', status: 'Needed', desc: 'Pacific NW smoke season forecasting, indoor air guidance', priority: 'high' },
      { name: 'Volcanic Activity Monitor', icon: '🌋', bodies: 'Seismic + gas + deformation', status: 'Research', desc: 'Cascades volcanic monitoring, lahar warning, ashfall prediction', priority: 'medium' },
    ],
  },
  {
    id: 'northeast',
    match: (lat, lon) => lat > 38 && lat < 47 && lon > -80 && lon < -67,
    sentinels: [
      { name: 'Urban Heat Sentinel', icon: '🏙️', bodies: 'Temperature + humidity + infrastructure', status: 'Needed', desc: 'Heat island mapping, vulnerable population alerts, cooling center guidance', priority: 'high' },
      { name: 'Canadian Wildfire Smoke', icon: '🔥', bodies: 'Transboundary smoke + AQI + wind', status: 'Needed', desc: 'Cross-border smoke events like June 2023, multi-day AQI forecasting', priority: 'high' },
    ],
  },
  {
    id: 'midwest',
    match: (lat, lon) => lat > 36 && lat < 49 && lon > -104 && lon < -80,
    sentinels: [
      { name: 'Tornado Sentinel', icon: '🌪️', bodies: 'Atmosphere + instability + shear', status: 'Needed', desc: 'Severe weather pattern recognition, lead time extension', priority: 'high' },
      { name: 'Great Lakes Sentinel', icon: '🌊', bodies: 'Lake temp + algae + ice cover', status: 'Needed', desc: 'Algae bloom prediction, lake-effect weather, water quality', priority: 'medium' },
    ],
  },
]

// Default sentinels for unmatched locations
const DEFAULT_SENTINELS = [
  { name: 'Urban Air Quality Sentinel', icon: '🌍', bodies: 'Pollution + weather + traffic', status: 'Needed', desc: 'City-scale AQI forecasting, pollution source identification', priority: 'high' },
  { name: 'Flood Early Warning', icon: '🌧️', bodies: 'Rainfall + river level + soil', status: 'Needed', desc: 'Flash flood prediction, drainage monitoring, evacuation timing', priority: 'medium' },
  { name: 'Coastal Erosion Monitor', icon: '🏖️', bodies: 'Tide + storm surge + sediment', status: 'Research', desc: 'Shoreline change detection, infrastructure risk assessment', priority: 'medium' },
]

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6366f1',
}

const SuggestedSentinels = ({ userLat, userLon, userCity, userRegion }) => {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : '#64748b'

  const suggestions = useMemo(() => {
    if (!userLat || !userLon) return DEFAULT_SENTINELS
    const matched = REGIONS.find(r => r.match(userLat, userLon))
    return matched ? matched.sentinels : DEFAULT_SENTINELS
  }, [userLat, userLon])

  const regionName = userCity && userRegion
    ? `${userCity}, ${userRegion}`
    : userRegion || 'Your Region'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div style={{
        fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
        color: '#8b5cf6', textTransform: 'uppercase', marginBottom: '6px',
        textAlign: 'center',
      }}>
        SENTINELS NEEDED NEAR {regionName.toUpperCase()}
      </div>
      <p style={{
        textAlign: 'center', color: textSecondary, margin: '0 auto 20px',
        fontSize: '14px', maxWidth: '500px', lineHeight: '1.6',
      }}>
        These environmental bodies near you don't have sentinel nodes yet.
        Each one is a builder opportunity — same architecture as the Great Salt Lake proof.
      </p>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '10px',
        marginBottom: '16px',
      }}>
        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 16px', borderRadius: '14px',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.06)'}`,
            }}
          >
            <div style={{
              fontSize: '24px', width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '10px',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '2px',
              }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: textPrimary }}>
                  {s.name}
                </span>
                <span style={{
                  padding: '2px 8px', borderRadius: '100px',
                  fontSize: '9px', fontWeight: '700', textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: s.status === 'Research' ? '#6366f1' : '#8b5cf6',
                  background: s.status === 'Research'
                    ? (isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)')
                    : (isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.06)'),
                }}>
                  {s.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: textSecondary, lineHeight: '1.4' }}>
                {s.desc}
              </div>
              <div style={{ fontSize: '10px', color: textMuted, marginTop: '2px', fontStyle: 'italic' }}>
                {s.bodies}
              </div>
            </div>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: PRIORITY_COLORS[s.priority],
              flexShrink: 0,
              opacity: 0.7,
            }} title={`${s.priority} priority`} />
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/forge/submit')}
          style={{
            padding: '12px 28px', borderRadius: '12px',
            background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.06)',
            border: `1px solid ${isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.15)'}`,
            color: '#8b5cf6', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
          }}
        >
          Build a Sentinel for Your Region
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default SuggestedSentinels
