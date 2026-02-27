import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'
import { getEnvironmentData, clearCache, searchLocation, setLocation, upgradeToGPS } from '../services/environment'

const EnvironmentCard = ({ compact = false }) => {
  const { isDark } = useTheme()
  const [envData, setEnvData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('outdoor')
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const searchTimeout = useRef(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getEnvironmentData()
        if (mounted) { setEnvData(data); setLoading(false) }
      } catch (err) {
        if (mounted) { setError(err.message); setLoading(false) }
      }
    }
    load()
    const interval = setInterval(load, 10 * 60 * 1000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    clearCache()
    try {
      const data = await getEnvironmentData()
      setEnvData(data)
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (query.length < 2) { setSearchResults([]); return }
    setSearching(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchLocation(query)
        setSearchResults(results)
      } catch { setSearchResults([]) }
      setSearching(false)
    }, 300)
  }

  const handleSelectLocation = async (loc) => {
    setLocation(loc)
    setShowLocationPicker(false)
    setSearchQuery('')
    setSearchResults([])
    setLoading(true)
    try {
      const data = await getEnvironmentData()
      setEnvData(data)
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  const handleUseGPS = async () => {
    try {
      await upgradeToGPS()
      setShowLocationPicker(false)
      setLoading(true)
      const data = await getEnvironmentData()
      setEnvData(data)
    } catch {
      // User denied — stay on current location
    }
    setLoading(false)
  }

  const cardBg = isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.6)'
  const cardBorder = isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255, 255, 255, 0.3)'
  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#64748b'
  const metricBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
        background: cardBg, backdropFilter: 'blur(20px)', borderRadius: '20px',
        padding: compact ? '20px' : '32px', border: `1px solid ${cardBorder}`, textAlign: 'center'
      }}>
        <p style={{ color: textSecondary, fontSize: '14px' }}>Detecting your environment...</p>
      </motion.div>
    )
  }

  if (error || !envData) {
    return (
      <div style={{
        background: cardBg, borderRadius: '20px', padding: '20px',
        border: `1px solid ${cardBorder}`, textAlign: 'center'
      }}>
        <p style={{ color: '#f87171', fontSize: '14px' }}>Could not load environment data</p>
        <button onClick={handleRefresh} style={{
          marginTop: '8px', padding: '6px 16px', background: 'rgba(99,102,241,0.2)',
          border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px',
          color: '#a5b4fc', fontSize: '13px', cursor: 'pointer'
        }}>Retry</button>
      </div>
    )
  }

  const { weather, airQuality, uv, pollen, indoor, location, advisory } = envData

  const MetricBox = ({ icon, label, value, color, sub }) => (
    <div style={{
      padding: compact ? '10px' : '14px', background: metricBg,
      borderRadius: '12px', textAlign: 'center'
    }}>
      <span style={{ fontSize: compact ? '16px' : '20px' }}>{icon}</span>
      <div style={{
        fontSize: compact ? '18px' : '22px', fontWeight: '700',
        color: color || textPrimary, marginTop: '4px'
      }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: textSecondary, marginTop: '2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '10px', color: color || textSecondary, marginTop: '2px' }}>{sub}</div>}
    </div>
  )

  const AlertBar = ({ icon, text, color }) => (
    <div style={{
      padding: '10px 14px', marginTop: '12px',
      background: isDark ? `${color}15` : `${color}12`,
      border: `1px solid ${color}40`,
      borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px'
    }}>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span style={{ fontSize: '12px', color: textSecondary }}>{text}</span>
    </div>
  )

  const tabs = [
    { key: 'outdoor', label: 'Outdoor', icon: '🌤️' },
    { key: 'indoor', label: 'Indoor Risk', icon: '🏠' },
    { key: 'pollutants', label: 'Pollutants', icon: '🔬' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: cardBg, backdropFilter: 'blur(20px)', borderRadius: '20px',
        padding: compact ? '20px' : '32px', border: `1px solid ${cardBorder}`,
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: compact ? '16px' : '20px', fontWeight: '700', color: textPrimary, margin: 0 }}>
            Your Environment
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: textPrimary, fontWeight: '500' }}>
              📍 {location?.city || 'Unknown'}{location?.region ? `, ${location.region}` : ''}{location?.country ? `, ${location.country}` : ''}
            </span>
            <button onClick={() => setShowLocationPicker(!showLocationPicker)} style={{
              background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`,
              borderRadius: '6px', padding: '2px 8px', cursor: 'pointer',
              fontSize: '11px', color: '#6366f1', fontWeight: '600'
            }}>
              Change
            </button>
            {weather?.description && (
              <span style={{ fontSize: '12px', color: textSecondary }}>— {weather.description}</span>
            )}
          </div>
        </div>
        <button onClick={handleRefresh} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', opacity: 0.6
        }} title="Refresh">🔄</button>
      </div>

      {/* Location Picker */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              overflow: 'hidden', marginBottom: '12px',
              background: isDark ? 'rgba(15,15,30,0.9)' : 'rgba(240,240,250,0.95)',
              borderRadius: '12px', border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(0,0,0,0.08)'}`
            }}
          >
            <div style={{ padding: '14px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search city or place..."
                autoFocus
                style={{
                  width: '100%', padding: '10px 14px', fontSize: '14px',
                  background: isDark ? 'rgba(255,255,255,0.08)' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#ddd'}`,
                  borderRadius: '8px', color: textPrimary, outline: 'none',
                  boxSizing: 'border-box'
                }}
              />

              {/* Search results */}
              {searching && (
                <p style={{ fontSize: '12px', color: textSecondary, margin: '8px 0 0 0' }}>Searching...</p>
              )}
              {searchResults.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {searchResults.map((r, i) => (
                    <button key={i} onClick={() => handleSelectLocation(r)} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 12px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid transparent`, borderRadius: '8px',
                      color: textPrimary, fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)'
                      e.target.style.borderColor = 'rgba(99,102,241,0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                      e.target.style.borderColor = 'transparent'
                    }}>
                      📍 {r.label}
                    </button>
                  ))}
                </div>
              )}

              {/* GPS option */}
              <button onClick={handleUseGPS} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', marginTop: '10px', padding: '10px 12px',
                background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.06)',
                border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)'}`,
                borderRadius: '8px', color: '#10b981', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer'
              }}>
                🎯 Use precise location
                <span style={{ fontSize: '11px', fontWeight: '400', color: textSecondary, marginLeft: 'auto' }}>
                  requires permission
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            flex: 1, padding: '8px 4px',
            background: activeTab === t.key
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            color: activeTab === t.key ? '#fff' : textSecondary,
            border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ OUTDOOR TAB ═══ */}
        {activeTab === 'outdoor' && (
          <motion.div key="outdoor" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
            {/* Row 1: Core weather */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: compact ? '8px' : '10px', marginBottom: '10px' }}>
              <MetricBox icon="🌡️" label="Temperature" value={weather?.temperature != null ? `${weather.temperature}${weather.units.temperature}` : '--'} />
              <MetricBox icon="🥶" label="Feels Like" value={weather?.feelsLike != null ? `${weather.feelsLike}${weather.units.temperature}` : '--'}
                color={weather?.wind?.advisory?.color} sub={weather?.wind?.advisory?.level} />
              <MetricBox icon="💧" label="Humidity" value={weather?.humidity != null ? `${weather.humidity}%` : '--'} />
            </div>

            {/* Row 2: Wind, Precipitation, Visibility */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: compact ? '8px' : '10px', marginBottom: '10px' }}>
              <MetricBox icon="🌬️" label="Wind" value={weather?.wind?.speed != null ? `${weather.wind.speed}` : '--'}
                sub={weather?.wind?.gusts ? `Gusts ${weather.wind.gusts} ${weather?.units?.windSpeed}` : weather?.units?.windSpeed} />
              <MetricBox icon="🌧️" label="Precipitation" value={weather?.precipitation?.isActive ? `${weather.precipitation.current} mm` : 'None'}
                color={weather?.precipitation?.isActive ? '#3b82f6' : undefined}
                sub={weather?.precipitation?.probabilityMax != null ? `${weather.precipitation.probabilityMax}% chance today` : undefined} />
              <MetricBox icon="🌫️" label="Visibility" value={weather?.visibility?.km != null ? `${weather.visibility.km} km` : '--'}
                color={weather?.visibility?.category?.color} sub={weather?.visibility?.category?.level} />
            </div>

            {/* Row 3: Pressure, UV, AQI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: compact ? '8px' : '10px', marginBottom: '10px' }}>
              <MetricBox icon="📊" label="Pressure" value={weather?.pressure?.msl != null ? `${Math.round(weather.pressure.msl)}` : '--'}
                color={weather?.pressure?.category?.color} sub={weather?.pressure?.category?.level} />
              <MetricBox icon="☀️" label="UV Index" value={uv?.index != null ? uv.index.toFixed(1) : '--'}
                color={uv?.category?.color} sub={uv?.category?.level} />
              <MetricBox icon="🌬️" label="AQI" value={airQuality?.aqi != null ? airQuality.aqi : '--'}
                color={airQuality?.aqiCategory?.color} sub={airQuality?.aqiCategory?.level} />
            </div>

            {/* Daylight */}
            {weather?.daylight && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                background: metricBg, borderRadius: '10px', marginBottom: '10px'
              }}>
                <span style={{ fontSize: '16px' }}>🌅</span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: textSecondary }}>
                    ↑ {weather.daylight.sunrise}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: weather.daylight.sadRisk.color }}>
                    {weather.daylight.daylightHours}h daylight
                  </span>
                  <span style={{ fontSize: '13px', color: textSecondary }}>
                    ↓ {weather.daylight.sunset}
                  </span>
                </div>
              </div>
            )}

            {/* Daily range */}
            {weather?.daily?.tempMax != null && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                background: metricBg, borderRadius: '10px'
              }}>
                <span style={{ fontSize: '14px' }}>📈</span>
                <span style={{ fontSize: '12px', color: textSecondary }}>
                  Today: {weather.daily.tempMin}° — {weather.daily.tempMax}° (feels {weather.daily.feelsLikeMin}° — {weather.daily.feelsLikeMax}°)
                  {weather.daily.windGustsMax ? ` | Gusts up to ${weather.daily.windGustsMax} ${weather.units.windSpeed}` : ''}
                </span>
              </div>
            )}

            {/* Primary advisory */}
            <AlertBar
              icon={airQuality?.aqi <= 50 ? '✅' : airQuality?.aqi <= 100 ? '⚠️' : '🚨'}
              text={advisory}
              color={airQuality?.aqiCategory?.color || '#10b981'}
            />

            {/* Pressure advisory if notable */}
            {weather?.pressure?.category?.level === 'Low' && (
              <AlertBar icon="🧠" text={weather.pressure.category.advisory} color="#6366f1" />
            )}

            {/* Wind chill advisory if cold */}
            {weather?.wind?.advisory?.level !== 'Comfortable' && (
              <AlertBar icon="🥶" text={weather.wind.advisory.advisory} color={weather.wind.advisory.color} />
            )}
          </motion.div>
        )}

        {/* ═══ INDOOR RISK TAB ═══ */}
        {activeTab === 'indoor' && (
          <motion.div key="indoor" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
            {indoor ? (
              <>
                {/* Mold Risk */}
                <div style={{
                  padding: '20px', background: metricBg, borderRadius: '14px', marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🍄</span>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: textPrimary }}>Mold Risk</div>
                        <div style={{ fontSize: '11px', color: textSecondary }}>Based on humidity & dew point</div>
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: '700',
                      background: `${indoor.moldRisk.color}20`, color: indoor.moldRisk.color,
                      border: `1px solid ${indoor.moldRisk.color}40`
                    }}>
                      {indoor.moldRisk.level}
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: textSecondary, margin: 0 }}>{indoor.moldRisk.advisory}</p>

                  {/* Risk bar */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '6px', borderRadius: '3px',
                        background: i <= indoor.moldRisk.score
                          ? indoor.moldRisk.color
                          : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        opacity: i <= indoor.moldRisk.score ? 1 : 0.5
                      }} />
                    ))}
                  </div>
                </div>

                {/* Indoor Air Quality Estimate */}
                <div style={{
                  padding: '20px', background: metricBg, borderRadius: '14px', marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🏠</span>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: textPrimary }}>Indoor Air Quality</div>
                        <div style={{ fontSize: '11px', color: textSecondary }}>Estimated from outdoor conditions</div>
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: '700',
                      background: `${indoor.airQuality.color}20`, color: indoor.airQuality.color,
                      border: `1px solid ${indoor.airQuality.color}40`
                    }}>
                      {indoor.airQuality.level}
                    </div>
                  </div>
                  {indoor.airQuality.risks.map((risk, i) => (
                    <p key={i} style={{ fontSize: '13px', color: textSecondary, margin: i === 0 ? 0 : '6px 0 0 0' }}>
                      • {risk}
                    </p>
                  ))}
                </div>

                {/* Humidity & Dew Point */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <MetricBox icon="💧" label="Outdoor Humidity" value={`${weather?.humidity || '--'}%`}
                    sub={weather?.humidity > 70 ? 'High' : weather?.humidity < 30 ? 'Very Dry' : 'Normal'} />
                  <MetricBox icon="🌡️" label="Dew Point" value={weather?.dewPoint != null ? `${weather.dewPoint}°` : '--'}
                    sub="Condensation threshold" />
                </div>

                <AlertBar icon="💡" text={indoor.humidityAdvice} color="#6366f1" />

                {/* Daylight for SAD */}
                {weather?.daylight?.sadRisk && (
                  <AlertBar icon="🌅" text={weather.daylight.sadRisk.advisory} color={weather.daylight.sadRisk.color} />
                )}
              </>
            ) : (
              <p style={{ color: textSecondary, textAlign: 'center', padding: '20px 0' }}>
                Weather data needed for indoor risk estimates
              </p>
            )}
          </motion.div>
        )}

        {/* ═══ POLLUTANTS TAB ═══ */}
        {activeTab === 'pollutants' && (
          <motion.div key="pollutants" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
            {/* Individual pollutant levels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: compact ? '8px' : '10px', marginBottom: '12px' }}>
              <MetricBox icon="🔬" label="PM2.5" value={airQuality?.pm25 != null ? airQuality.pm25.toFixed(1) : '--'}
                sub="µg/m³" color={airQuality?.pm25 > 35 ? '#ef4444' : airQuality?.pm25 > 12 ? '#f59e0b' : '#10b981'} />
              <MetricBox icon="🔬" label="PM10" value={airQuality?.pm10 != null ? airQuality.pm10.toFixed(1) : '--'}
                sub="µg/m³" color={airQuality?.pm10 > 54 ? '#ef4444' : airQuality?.pm10 > 25 ? '#f59e0b' : '#10b981'} />
              <MetricBox icon="🛡️" label="Ozone" value={airQuality?.ozone != null ? airQuality.ozone.toFixed(0) : '--'}
                sub="µg/m³" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: compact ? '8px' : '10px', marginBottom: '12px' }}>
              <MetricBox icon="🚗" label="NO₂" value={airQuality?.no2 != null ? airQuality.no2.toFixed(1) : '--'}
                sub="µg/m³" color={airQuality?.no2 > 40 ? '#ef4444' : '#10b981'} />
              <MetricBox icon="🏭" label="SO₂" value={airQuality?.so2 != null ? airQuality.so2.toFixed(1) : '--'}
                sub="µg/m³" color={airQuality?.so2 > 20 ? '#f59e0b' : '#10b981'} />
              <MetricBox icon="💨" label="CO" value={airQuality?.co != null ? Math.round(airQuality.co) : '--'}
                sub="µg/m³" color={airQuality?.co > 500 ? '#f59e0b' : '#10b981'} />
            </div>

            {/* Smoke / Haze */}
            {airQuality?.smoke && (
              <div style={{
                padding: '14px', background: metricBg, borderRadius: '12px', marginBottom: '12px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🔥</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary }}>Smoke / Haze</div>
                    <div style={{ fontSize: '11px', color: textSecondary }}>
                      AOD: {airQuality.aerosolOpticalDepth?.toFixed(2) || '--'}
                      {airQuality.dust > 0 ? ` | Dust: ${airQuality.dust.toFixed(1)}` : ''}
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
                  color: airQuality.smoke.color, background: `${airQuality.smoke.color}20`,
                  border: `1px solid ${airQuality.smoke.color}40`
                }}>
                  {airQuality.smoke.level}
                </span>
              </div>
            )}

            {/* Dominant Pollutant */}
            {airQuality?.dominantPollutant && (
              <AlertBar icon="⚠️"
                text={`Dominant pollutant: ${airQuality.dominantPollutant.toUpperCase()} (from ${airQuality.source === 'aqicn' ? 'ground station' : 'model'})`}
                color="#f59e0b" />
            )}

            {/* Pollen (Europe only) */}
            {pollen ? (
              <div style={{
                padding: '14px', background: metricBg, borderRadius: '12px', marginTop: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🌼</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: textPrimary }}>Pollen</span>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600',
                    color: pollen.color, background: `${pollen.color}20`
                  }}>
                    {pollen.level} ({pollen.total})
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {pollen.types.map((t, i) => (
                    <span key={i} style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '11px',
                      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      color: textSecondary
                    }}>
                      {t.label}: {t.value}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: textSecondary, margin: '8px 0 0 0' }}>{pollen.advisory}</p>
              </div>
            ) : (
              <div style={{
                padding: '12px 14px', background: metricBg, borderRadius: '10px', marginTop: '12px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span style={{ fontSize: '14px' }}>🌼</span>
                <span style={{ fontSize: '12px', color: textSecondary }}>
                  Pollen data available for Europe only. US pollen requires Google Pollen API (free tier available).
                </span>
              </div>
            )}

            {/* Per-pollutant AQI breakdown */}
            {airQuality?.breakdown && (
              <div style={{
                padding: '14px', background: metricBg, borderRadius: '12px', marginTop: '12px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: textPrimary, marginBottom: '10px' }}>
                  AQI by Pollutant
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { label: 'PM2.5', value: airQuality.breakdown.pm25 },
                    { label: 'PM10', value: airQuality.breakdown.pm10 },
                    { label: 'Ozone', value: airQuality.breakdown.ozone },
                    { label: 'NO₂', value: airQuality.breakdown.no2 },
                    { label: 'SO₂', value: airQuality.breakdown.so2 },
                    { label: 'CO', value: airQuality.breakdown.co }
                  ].filter(p => p.value != null).map((p, i) => {
                    const barColor = p.value <= 50 ? '#10b981' : p.value <= 100 ? '#f59e0b' : '#ef4444';
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: textSecondary, width: '40px' }}>{p.label}</span>
                        <div style={{
                          flex: 1, height: '6px', borderRadius: '3px',
                          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
                        }}>
                          <div style={{
                            width: `${Math.min(100, p.value / 3)}%`, height: '100%',
                            borderRadius: '3px', background: barColor
                          }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: barColor, width: '28px', textAlign: 'right' }}>
                          {p.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default EnvironmentCard
