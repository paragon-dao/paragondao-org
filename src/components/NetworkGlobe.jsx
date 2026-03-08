import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import Globe from 'react-globe.gl'

// Fly.io region → coordinates mapping
const REGION_COORDS = {
  sjc: { lat: 37.37, lng: -121.92, label: 'San Jose, CA' },
  iad: { lat: 38.95, lng: -77.45, label: 'Ashburn, VA' },
  lax: { lat: 33.94, lng: -118.41, label: 'Los Angeles, CA' },
  ord: { lat: 41.97, lng: -87.91, label: 'Chicago, IL' },
  dfw: { lat: 32.90, lng: -97.04, label: 'Dallas, TX' },
  atl: { lat: 33.64, lng: -84.43, label: 'Atlanta, GA' },
  bos: { lat: 42.37, lng: -71.02, label: 'Boston, MA' },
  den: { lat: 39.86, lng: -104.67, label: 'Denver, CO' },
  sea: { lat: 47.45, lng: -122.31, label: 'Seattle, WA' },
  mia: { lat: 25.80, lng: -80.29, label: 'Miami, FL' },
  ams: { lat: 52.31, lng: 4.76, label: 'Amsterdam, NL' },
  lhr: { lat: 51.47, lng: -0.46, label: 'London, UK' },
  fra: { lat: 50.03, lng: 8.57, label: 'Frankfurt, DE' },
  cdg: { lat: 49.01, lng: 2.55, label: 'Paris, FR' },
  arn: { lat: 59.65, lng: 17.93, label: 'Stockholm, SE' },
  waw: { lat: 52.17, lng: 20.97, label: 'Warsaw, PL' },
  mad: { lat: 40.47, lng: -3.56, label: 'Madrid, ES' },
  nrt: { lat: 35.76, lng: 140.39, label: 'Tokyo, JP' },
  hkg: { lat: 22.31, lng: 113.91, label: 'Hong Kong' },
  sin: { lat: 1.36, lng: 103.99, label: 'Singapore' },
  bom: { lat: 19.09, lng: 72.87, label: 'Mumbai, IN' },
  syd: { lat: -33.95, lng: 151.18, label: 'Sydney, AU' },
  gru: { lat: -23.43, lng: -46.47, label: 'Sao Paulo, BR' },
  jnb: { lat: -26.13, lng: 28.23, label: 'Johannesburg, ZA' },
  scl: { lat: -33.39, lng: -70.79, label: 'Santiago, CL' },
  bog: { lat: 4.70, lng: -74.15, label: 'Bogota, CO' },
  ewr: { lat: 40.69, lng: -74.17, label: 'Newark, NJ' },
  yyz: { lat: 43.68, lng: -79.63, label: 'Toronto, CA' },
  local: { lat: 37.37, lng: -121.92, label: 'Local' },
}

// Node type colors — high contrast, visually distinct on dark globe
const NODE_COLORS = {
  bootstrap: { point: '#f472b6', ring: 'rgba(244,114,182,0.3)', label: 'BOOTSTRAP' },
  validator: { point: '#818cf8', ring: 'rgba(129,140,248,0.3)', label: 'VALIDATOR' },
  server: { point: '#38bdf8', ring: 'rgba(56,189,248,0.3)', label: 'SERVER' },
  haven: { point: '#34d399', ring: 'rgba(52,211,153,0.3)', label: 'HAVEN' },
  builder: { point: '#fbbf24', ring: 'rgba(251,191,36,0.3)', label: 'BUILDER' },
  relay: { point: '#fb923c', ring: 'rgba(251,146,60,0.3)', label: 'RELAY' },
  api: { point: '#2dd4bf', ring: 'rgba(45,212,191,0.3)', label: 'API' },
}

function getCoords(region) {
  return REGION_COORDS[region] || REGION_COORDS.sjc
}

export default function NetworkGlobe({
  constellationNodes = [],
  hftpPeers = [],
  nodeHealth = null,
  isDark = true,
  isFullscreen = false,
  onToggleFullscreen,
}) {
  const globeRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [pulsePhase, setPulsePhase] = useState(0)
  const prevPeerCountRef = useRef(0)

  // Pulse animation for validation heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 60)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [isFullscreen])

  // Globe auto-rotate, initial POV, and interaction handling
  const globeInitialized = useRef(false)
  useEffect(() => {
    // Delay to ensure globe ref is ready after lazy load
    const timer = setTimeout(() => {
      if (!globeRef.current || globeInitialized.current) return
      globeInitialized.current = true
      try {
        const controls = globeRef.current.controls()
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        controls.autoRotate = !prefersReducedMotion
        controls.autoRotateSpeed = 0.8
        controls.enableZoom = true
        controls.minDistance = 180
        controls.maxDistance = 500
        globeRef.current.pointOfView({ lat: 37, lng: -122, altitude: 1.6 }, 1500)
        let idleTimer
        controls.addEventListener('start', () => { controls.autoRotate = false })
        controls.addEventListener('end', () => {
          clearTimeout(idleTimer)
          idleTimer = setTimeout(() => {
            if (!prefersReducedMotion) controls.autoRotate = true
          }, 5000)
        })
      } catch (e) {
        // Globe not ready yet
        globeInitialized.current = false
      }
    }, 100)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Escape key exits fullscreen
  useEffect(() => {
    if (!isFullscreen) return
    const handler = (e) => {
      if (e.key === 'Escape' && onToggleFullscreen) onToggleFullscreen()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFullscreen, onToggleFullscreen])

  // Build point data from all nodes
  const pointsData = useMemo(() => {
    const points = []

    // bagle-api
    if (nodeHealth) {
      const coords = getCoords('sjc')
      points.push({
        lat: coords.lat - 1.5,
        lng: coords.lng - 1.5,
        name: 'bagle-api',
        type: 'api',
        region: coords.label,
        online: true,
        info: 'GLE Encoder API',
        size: 0.8,
      })
    }

    // Constellation nodes — offset for visibility
    for (const node of constellationNodes) {
      const coords = getCoords(node.region || 'sjc')
      const offset = node.id === 'polaris' ? 0 : node.id === 'vega' ? 2.5 : -2.5
      points.push({
        lat: coords.lat + offset,
        lng: coords.lng + offset,
        name: node.name,
        type: node.role || 'validator',
        region: coords.label,
        online: node.online,
        validations: node.pcr ? node.pcr.pcr.total : null,
        staked: node.pcr ? node.pcr.staking.totalBonded : null,
        uptime: node.uptime,
        info: node.role === 'bootstrap' ? 'Bootstrap / Registry' : 'Validator Node',
        size: node.role === 'bootstrap' ? 1.0 : 0.8,
      })
    }

    // HFTP peers (excluding constellation)
    const constellationIds = ['polaris', 'vega', 'altair']
    for (const peer of hftpPeers) {
      if (constellationIds.includes(peer.nodeId)) continue
      const coords = getCoords(peer.region || 'local')
      points.push({
        lat: coords.lat + (Math.random() - 0.5) * 4,
        lng: coords.lng + (Math.random() - 0.5) * 4,
        name: peer.nodeId,
        type: peer.type || 'server',
        region: coords.label,
        online: true,
        info: `${(peer.type || 'server').toUpperCase()} Node`,
        size: 0.6,
      })
    }

    return points
  }, [constellationNodes, hftpPeers, nodeHealth])

  // Build arcs between nodes (consensus connections)
  const arcsData = useMemo(() => {
    if (pointsData.length < 2) return []
    const arcs = []
    const constellation = pointsData.filter(p =>
      ['polaris', 'vega', 'altair'].includes(p.name.toLowerCase())
    )
    for (let i = 0; i < constellation.length; i++) {
      for (let j = i + 1; j < constellation.length; j++) {
        arcs.push({
          startLat: constellation[i].lat,
          startLng: constellation[i].lng,
          endLat: constellation[j].lat,
          endLng: constellation[j].lng,
          color: 'rgba(244,114,182,0.25)',
        })
      }
    }
    const polaris = constellation.find(p => p.name.toLowerCase() === 'polaris')
    if (polaris) {
      const constellationIds = ['polaris', 'vega', 'altair']
      const peers = pointsData.filter(p => !constellationIds.includes(p.name.toLowerCase()) && p.type !== 'api')
      for (const peer of peers) {
        arcs.push({
          startLat: polaris.lat,
          startLng: polaris.lng,
          endLat: peer.lat,
          endLng: peer.lng,
          color: 'rgba(129,140,248,0.15)',
        })
      }
    }
    return arcs
  }, [pointsData])

  // Rings — always visible (slow ambient), pulse faster during validation heartbeat
  const ringsData = useMemo(() => {
    const isPulsing = pulsePhase < 3
    return pointsData.filter(p => p.online).map(p => ({
      lat: p.lat,
      lng: p.lng,
      maxR: isPulsing ? 5 : 2,
      propagationSpeed: isPulsing ? 3 : 0.5,
      repeatPeriod: isPulsing ? 800 : 3000,
      color: NODE_COLORS[p.type]?.ring || 'rgba(129,140,248,0.3)',
    }))
  }, [pointsData, pulsePhase])

  // Fly to newest node when a new peer joins
  useEffect(() => {
    if (!globeRef.current || pointsData.length === 0) return
    const currentCount = pointsData.length
    if (prevPeerCountRef.current > 0 && currentCount > prevPeerCountRef.current) {
      const newest = pointsData[pointsData.length - 1]
      globeRef.current.pointOfView({ lat: newest.lat, lng: newest.lng, altitude: 1.8 }, 1200)
    }
    prevPeerCountRef.current = currentCount
  }, [pointsData])

  // Mobile tap → fly to node
  const handlePointClick = useCallback((point) => {
    if (!point || !globeRef.current) return
    globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 800)
  }, [])

  const globeEl = (
    <Globe
      ref={globeRef}
      width={dimensions.width || 600}
      height={dimensions.height || (isFullscreen ? window.innerHeight : 500)}
      backgroundColor="rgba(0,0,0,0)"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      atmosphereColor="#6366f1"
      atmosphereAltitude={0.18}
      pointsData={pointsData}
      pointLat="lat"
      pointLng="lng"
      pointAltitude={d => d.size * 0.02}
      pointRadius={d => d.size}
      pointColor={d => NODE_COLORS[d.type]?.point || '#818cf8'}
      pointLabel={d => `
        <div style="
          background: rgba(15,23,42,0.95);
          border: 1px solid rgba(129,140,248,0.3);
          border-radius: 10px;
          padding: 12px 16px;
          font-family: system-ui, -apple-system, sans-serif;
          min-width: 180px;
          backdrop-filter: blur(12px);
        ">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${NODE_COLORS[d.type]?.point || '#818cf8'};box-shadow:0 0 6px ${NODE_COLORS[d.type]?.point || '#818cf8'};"></div>
            <span style="color:#fff;font-weight:700;font-size:14px;">${d.name}</span>
            <span style="
              margin-left:auto;
              padding:2px 8px;
              border-radius:4px;
              background:${NODE_COLORS[d.type]?.ring || 'rgba(129,140,248,0.2)'};
              color:${NODE_COLORS[d.type]?.point || '#818cf8'};
              font-size:10px;
              font-weight:700;
              letter-spacing:0.05em;
            ">${NODE_COLORS[d.type]?.label || 'NODE'}</span>
          </div>
          <div style="color:rgba(255,255,255,0.6);font-size:12px;line-height:1.6;">
            <div>${d.region}</div>
            ${d.validations != null ? `<div>Validations: ${d.validations}</div>` : ''}
            ${d.staked != null ? `<div>Staked: ${d.staked} bonded</div>` : ''}
            <div>${d.info}</div>
          </div>
        </div>
      `}
      onPointClick={handlePointClick}
      arcsData={arcsData}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor="color"
      arcDashLength={0.4}
      arcDashGap={0.2}
      arcDashAnimateTime={3000}
      arcStroke={0.5}
      ringsData={ringsData}
      ringLat="lat"
      ringLng="lng"
      ringMaxRadius="maxR"
      ringPropagationSpeed="propagationSpeed"
      ringRepeatPeriod="repeatPeriod"
      ringColor="color"
    />
  )

  // Fullscreen wrapper
  if (isFullscreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'rgba(0,0,0,0.8)',
          borderBottom: '1px solid rgba(129,140,248,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#34d399',
              boxShadow: '0 0 8px rgba(52,211,153,0.6)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>
              ParagonDAO Network
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
              {pointsData.filter(p => p.online).length}/{pointsData.length} nodes online
            </span>
          </div>
          <button
            onClick={onToggleFullscreen}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            Exit Fullscreen (Esc)
          </button>
        </div>
        <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
          {dimensions.width > 0 && globeEl}
        </div>
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '12px 24px',
          background: 'rgba(0,0,0,0.8)',
          borderTop: '1px solid rgba(129,140,248,0.2)',
        }}>
          {Object.entries(NODE_COLORS)
            .filter(([type]) => pointsData.some(p => p.type === type))
            .map(([type, colors]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: colors.point,
                boxShadow: `0 0 4px ${colors.point}`,
              }} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em' }}>
                {colors.label}
              </span>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    )
  }

  // Inline mode
  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        role="img"
        aria-label={`Network globe showing ${pointsData.length} nodes. ${
          pointsData.filter(p => p.online).length} online across ${
          [...new Set(pointsData.map(p => p.region))].length} regions.`}
        style={{
          width: '100%',
          height: 'clamp(320px, 50vw, 500px)',
          borderRadius: '16px',
          overflow: 'hidden',
          background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,10,0.9)',
          border: `1px solid ${isDark ? 'rgba(129,140,248,0.2)' : 'rgba(129,140,248,0.15)'}`,
        }}
      >
        {dimensions.width > 0 && globeEl}
      </div>
      <button
        onClick={onToggleFullscreen}
        title="Fullscreen"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: '#fff',
          padding: '8px 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </button>
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: '12px',
      }}>
        {[...new Set(pointsData.map(p => p.type))].map(type => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: NODE_COLORS[type]?.point || '#818cf8',
              boxShadow: `0 0 4px ${NODE_COLORS[type]?.point || '#818cf8'}`,
            }} />
            <span style={{
              color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
              fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em',
            }}>
              {NODE_COLORS[type]?.label || type.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
