import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'

const Background = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [blinking, setBlinking] = useState(false)
  const [hopping, setHopping] = useState(false)
  const [lookDir, setLookDir] = useState(0)
  const [showBubble, setShowBubble] = useState(false)
  const [breathPhase, setBreathPhase] = useState(0) // 0-1 continuous
  const bubbleTimer = useRef(null)
  const breathRef = useRef(null)

  // Breathing cycle — continuous sine wave for belly + nostrils + throat
  useEffect(() => {
    let frame
    let start = null
    const cycle = 3500 // 3.5s per breath — visible, calming rhythm

    const animate = (timestamp) => {
      if (!start) start = timestamp
      const elapsed = (timestamp - start) % cycle
      setBreathPhase(elapsed / cycle)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 150)
      if (Math.random() > 0.6) {
        setTimeout(() => {
          setBlinking(true)
          setTimeout(() => setBlinking(false), 120)
        }, 300)
      }
    }, 3000 + Math.random() * 3000)

    const lookInterval = setInterval(() => {
      const dir = Math.floor(Math.random() * 3) - 1
      setLookDir(dir)
      setTimeout(() => setLookDir(0), 1500 + Math.random() * 1000)
    }, 5000 + Math.random() * 5000)

    const hopInterval = setInterval(() => {
      setHopping(true)
      setTimeout(() => setHopping(false), 600)
    }, 20000 + Math.random() * 20000)

    // Show bubble hint after 8 seconds on homepage
    if (location.pathname === '/' || location.pathname === '/home') {
      bubbleTimer.current = setTimeout(() => setShowBubble(true), 8000)
    }

    return () => {
      clearInterval(blinkInterval)
      clearInterval(lookInterval)
      clearInterval(hopInterval)
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    }
  }, [location.pathname])

  const handleFrogClick = () => {
    setHopping(true)
    setTimeout(() => setHopping(false), 600)

    if (location.pathname === '/health') return // already there

    setShowBubble(false)
    // Small delay so user sees the hop, then navigate
    setTimeout(() => navigate('/health'), 400)
  }

  // Breathing math — sine wave mapped to visual parameters
  const breathSine = Math.sin(breathPhase * Math.PI * 2)
  const inhaling = breathSine > 0
  const breathAmount = Math.abs(breathSine) // 0–1

  // Belly expansion
  const bellyRx = 12 + breathAmount * 3      // 12 → 15
  const bellyRy = 8 + breathAmount * 2.5      // 8 → 10.5
  const bellyY = 36 - breathAmount * 1        // rises slightly on inhale

  // Body expansion
  const bodyRx = 18 + breathAmount * 1.5
  const bodyRy = 13 + breathAmount * 2
  const bodyY = 34 - breathAmount * 0.5

  // Throat pulse (subtle)
  const throatR = 5 + breathAmount * 1.5

  // Nostril flare
  const nostrilR = 1 + breathAmount * 0.5
  const nostrilOpacity = 0.3 + breathAmount * 0.3

  // Chest rise — whole upper body shifts
  const chestLift = breathAmount * 1.5

  const frogColor = isDark ? '#2dd4bf' : '#14b8a6'
  const frogDark = isDark ? '#0d9488' : '#0f766e'
  const bellyColor = isDark ? '#99f6e4' : '#ccfbf1'
  const pupilColor = isDark ? '#1e1b4b' : '#5c3d0e'
  const cheekColor = isDark ? 'rgba(251,191,36,0.2)' : 'rgba(251,191,36,0.25)'
  const bubbleBg = isDark ? 'rgba(30,30,50,0.95)' : 'rgba(255,255,255,0.97)'
  const bubbleBorder = isDark ? 'rgba(45,212,191,0.3)' : 'rgba(20,184,166,0.2)'
  const bubbleText = isDark ? '#99f6e4' : '#0f766e'

  const bubbleMessages = [
    'Breathe with me...',
    'Your breath is your key 🔑',
    'Try breathing enrollment →',
  ]
  const bubbleMsg = bubbleMessages[Math.floor(Date.now() / 12000) % bubbleMessages.length]

  return (
    <>
      {/* Subtle background pattern */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        opacity: isDark ? 0.3 : 0.5
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4a017' fill-opacity='${isDark ? '0.03' : '0.04'}'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }} />
      </div>

      {/* Ambient gold glow orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '10%', right: '5%',
          width: '300px', height: '300px',
          background: `radial-gradient(circle, ${isDark ? 'rgba(212,160,23,0.04)' : 'rgba(212,160,23,0.06)'} 0%, transparent 70%)`,
          borderRadius: '50%',
          animation: 'floatOrb 20s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%', left: '3%',
          width: '250px', height: '250px',
          background: `radial-gradient(circle, ${isDark ? 'rgba(45,212,191,0.03)' : 'rgba(45,212,191,0.05)'} 0%, transparent 70%)`,
          borderRadius: '50%',
          animation: 'floatOrb 25s ease-in-out infinite 5s'
        }} />
      </div>

      {/* Speech bubble */}
      {showBubble && (
        <div
          onClick={handleFrogClick}
          style={{
            position: 'fixed',
            bottom: '76px',
            right: '12px',
            zIndex: 51,
            padding: '10px 16px',
            background: bubbleBg,
            border: `1px solid ${bubbleBorder}`,
            borderRadius: '14px 14px 4px 14px',
            boxShadow: `0 4px 20px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`,
            cursor: 'pointer',
            animation: 'bubbleFadeIn 0.6s ease',
            maxWidth: '200px',
            pointerEvents: 'auto'
          }}
        >
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: bubbleText,
            lineHeight: 1.3
          }}>
            {bubbleMsg}
          </div>
          <div style={{
            fontSize: '10px',
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
            marginTop: '4px'
          }}>
            Click to start
          </div>
          {/* Close button */}
          <div
            onClick={(e) => { e.stopPropagation(); setShowBubble(false) }}
            style={{
              position: 'absolute', top: '-6px', right: '-6px',
              width: '18px', height: '18px', borderRadius: '50%',
              background: isDark ? '#374151' : '#e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', color: isDark ? '#9ca3af' : '#6b7280',
              cursor: 'pointer', lineHeight: 1
            }}
          >
            ✕
          </div>
        </div>
      )}

      {/* The Frog — bottom right sentinel */}
      <div
        style={{
          position: 'fixed',
          bottom: hopping ? '38px' : '20px',
          right: '24px',
          zIndex: 50,
          cursor: 'pointer',
          transition: hopping ? 'bottom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'bottom 0.3s ease',
          filter: `drop-shadow(0 4px 12px ${isDark ? 'rgba(45,212,191,0.3)' : 'rgba(20,184,166,0.2)'})`,
          pointerEvents: 'auto'
        }}
        title="Breathe with me — click to enroll"
        onClick={handleFrogClick}
        onMouseEnter={() => { if (!showBubble) setShowBubble(true) }}
      >
        <svg width="56" height="52" viewBox="0 0 56 52" fill="none" xmlns="http://www.w3.org/2000/svg">

          {/* Breath glow — expands on inhale */}
          <ellipse
            cx="28" cy="36"
            rx={20 + breathAmount * 6}
            ry={14 + breathAmount * 4}
            fill={inhaling ? 'rgba(45,212,191,0.08)' : 'rgba(240,187,51,0.06)'}
            style={{ transition: 'fill 0.5s ease' }}
          />

          {/* Body — expands with breath */}
          <ellipse cx="28" cy={bodyY} rx={bodyRx} ry={bodyRy} fill={frogColor} />

          {/* Belly — the star: dramatic expansion */}
          <ellipse cx="28" cy={bellyY} rx={bellyRx} ry={bellyRy} fill={bellyColor}
            opacity={0.45 + breathAmount * 0.2} />

          {/* Belly center line — shows expansion */}
          <path
            d={`M22 ${bellyY + 1} Q28 ${bellyY + bellyRy * 0.5} 34 ${bellyY + 1}`}
            fill="none" stroke={frogColor} strokeWidth="0.8" opacity={0.5 + breathAmount * 0.3}
          />

          {/* Back legs */}
          <ellipse cx="12" cy="42" rx="6" ry="4" fill={frogDark} opacity="0.7" transform="rotate(-15,12,42)"/>
          <ellipse cx="44" cy="42" rx="6" ry="4" fill={frogDark} opacity="0.7" transform="rotate(15,44,42)"/>

          {/* Back feet */}
          <g opacity="0.8">
            <circle cx="7" cy="45" r="2" fill={frogDark}/>
            <circle cx="10" cy="46" r="1.8" fill={frogDark}/>
            <circle cx="4" cy="46" r="1.5" fill={frogDark}/>
            <circle cx="49" cy="45" r="2" fill={frogDark}/>
            <circle cx="46" cy="46" r="1.8" fill={frogDark}/>
            <circle cx="52" cy="46" r="1.5" fill={frogDark}/>
          </g>

          {/* Front legs */}
          <rect x="16" y="40" width="4" height="8" rx="2" fill={frogDark} opacity="0.6" transform="rotate(-5,18,44)"/>
          <rect x="36" y="40" width="4" height="8" rx="2" fill={frogDark} opacity="0.6" transform="rotate(5,38,44)"/>

          {/* Front feet */}
          <g opacity="0.7">
            <circle cx="15" cy="48" r="1.5" fill={frogDark}/>
            <circle cx="18" cy="49" r="1.3" fill={frogDark}/>
            <circle cx="38" cy="49" r="1.3" fill={frogDark}/>
            <circle cx="41" cy="48" r="1.5" fill={frogDark}/>
          </g>

          {/* Head — lifts slightly with breath */}
          <ellipse cx="28" cy={23 - chestLift} rx="15" ry="12" fill={frogColor}/>

          {/* Throat pouch — pulses with breath (the iconic frog breathing) */}
          <ellipse
            cx="28" cy={28 - chestLift * 0.5}
            rx={throatR} ry={throatR * 0.7}
            fill={bellyColor}
            opacity={0.3 + breathAmount * 0.35}
          />

          {/* Cheeks */}
          <circle cx="17" cy={26 - chestLift} r="4" fill={cheekColor}/>
          <circle cx="39" cy={26 - chestLift} r="4" fill={cheekColor}/>

          {/* Eye bumps */}
          <circle cx="20" cy={14 - chestLift} r="8.5" fill={frogColor}/>
          <circle cx="36" cy={14 - chestLift} r="8.5" fill={frogColor}/>

          {/* Eyes - whites */}
          <circle cx="20" cy={14 - chestLift} r="6.5" fill="#fff"/>
          <circle cx="36" cy={14 - chestLift} r="6.5" fill="#fff"/>

          {/* Eyes - iris (gold) */}
          <circle cx={20 + lookDir * 1.5} cy={14 - chestLift} r="3.8" fill="#f0bb33"/>
          <circle cx={36 + lookDir * 1.5} cy={14 - chestLift} r="3.8" fill="#f0bb33"/>

          {/* Eyes - pupils */}
          <circle cx={20 + lookDir * 2} cy={14 - chestLift} r="2.2" fill={pupilColor}/>
          <circle cx={36 + lookDir * 2} cy={14 - chestLift} r="2.2" fill={pupilColor}/>

          {/* Eye highlights */}
          <circle cx={19 + lookDir * 0.5} cy={12 - chestLift} r="1.3" fill="#fff" opacity="0.9"/>
          <circle cx={35 + lookDir * 0.5} cy={12 - chestLift} r="1.3" fill="#fff" opacity="0.9"/>

          {/* Eyelids (blink) */}
          {blinking && (
            <>
              <ellipse cx="20" cy={14 - chestLift} rx="7" ry="7" fill={frogColor}/>
              <ellipse cx="36" cy={14 - chestLift} rx="7" ry="7" fill={frogColor}/>
              <path d={`M14 ${14 - chestLift} Q20 ${16 - chestLift} 26 ${14 - chestLift}`}
                stroke={frogDark} strokeWidth="1" fill="none"/>
              <path d={`M30 ${14 - chestLift} Q36 ${16 - chestLift} 42 ${14 - chestLift}`}
                stroke={frogDark} strokeWidth="1" fill="none"/>
            </>
          )}

          {/* Nostrils — flare with breath */}
          <ellipse cx="25" cy={23 - chestLift} rx={nostrilR} ry={nostrilR * 0.7}
            fill={frogDark} opacity={nostrilOpacity}/>
          <ellipse cx="31" cy={23 - chestLift} rx={nostrilR} ry={nostrilR * 0.7}
            fill={frogDark} opacity={nostrilOpacity}/>

          {/* Smile */}
          <path d={`M22 ${27 - chestLift} Q28 ${31 - chestLift} 34 ${27 - chestLift}`}
            fill="none" stroke={frogDark} strokeWidth="1.2" strokeLinecap="round"/>

          {/* Crown / gold accent */}
          <g opacity="0.7">
            <circle cx="28" cy={6 - chestLift} r="2.2" fill="#f0bb33"/>
            <circle cx="23" cy={8 - chestLift} r="1.6" fill="#d4a017"/>
            <circle cx="33" cy={8 - chestLift} r="1.6" fill="#d4a017"/>
          </g>

        </svg>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(15px, -20px); }
          66% { transform: translate(-10px, 10px); }
        }
        @keyframes bubbleFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}

export default Background
