import React, { useEffect, useState } from 'react';
import Butterfly from '../components/Butterfly';
import './LearningMap.css';

const DESTINATIONS = [
  {
    id: 'soundGarden',
    label: 'Sound Garden',
    emoji: '🔊',
    accent: '#A99AEE',
    bg: '#F3F1FD',
    deco: ['🌸', '🌼'],
  },
  {
    id: 'traceTrail',
    label: 'Trace Trail',
    emoji: '✏️',
    accent: '#62C894',
    bg: '#E8F9F1',
    deco: ['🌿', '🌱'],
  },
  {
    id: 'matchMeadow',
    label: 'Match Meadow',
    emoji: '🧩',
    accent: '#FFD463',
    bg: '#FFF8E6',
    deco: ['🌻', '🌺'],
  },
];

export default function LearningMap({ progress, onNavigate, onHome }) {
  const currentIndex = DESTINATIONS.findIndex((d) => !progress[d.id]);
  const allDone = currentIndex === -1;

  // Animate Pip position
  const [pipIndex, setPipIndex] = useState(() => {
    // Start at current or last done
    const ci = DESTINATIONS.findIndex((d) => !progress[d.id]);
    return ci === -1 ? DESTINATIONS.length : ci;
  });

  useEffect(() => {
    const target = allDone ? DESTINATIONS.length : currentIndex;
    if (pipIndex !== target) {
      const t = setTimeout(() => setPipIndex(target), 300);
      return () => clearTimeout(t);
    }
  }, [currentIndex, allDone]);

  return (
    <div className="map-page page">
      {/* Decorative bg */}
      <div className="map-bg" aria-hidden="true">
        <div className="map-bg__sky" />
        <div className="map-bg__cloud map-bg__cloud--1 anim-cloud">☁️</div>
        <div className="map-bg__cloud map-bg__cloud--2 anim-cloud" style={{ animationDelay: '-12s' }}>☁️</div>
        <div className="map-bg__hill map-bg__hill--1" />
        <div className="map-bg__hill map-bg__hill--2" />
        <div className="map-bg__grass" />
        <span className="map-bg__flower map-bg__flower--1 anim-sway">🌷</span>
        <span className="map-bg__flower map-bg__flower--2 anim-sway" style={{ animationDelay: '-2s' }}>🌼</span>
        <span className="map-bg__flower map-bg__flower--3 anim-sway" style={{ animationDelay: '-1s' }}>🌸</span>
        <span className="map-bg__star map-bg__star--1">✨</span>
        <span className="map-bg__star map-bg__star--2">⭐</span>
      </div>

      {/* Header */}
      <header className="map-header">
        <button className="btn btn-white btn-icon" onClick={onHome} aria-label="Back to home">
          🏠
        </button>
        <div className="map-header__center">
          <span className="map-header__title">Adventure Map</span>
        </div>
        <div style={{ width: 56 }} />
      </header>

      {/* Main */}
      <main className="map-main container">

        {/* Path */}
        <div className="map-path" role="list">
          {/* Start */}
          <div className="map-start" aria-label="Start">
            <span className="map-start__flag">🚩</span>
            <span className="map-start__label">Start!</span>
          </div>

          {DESTINATIONS.map((dest, idx) => {
            const isDone = progress[dest.id];
            const isCurrent = idx === currentIndex;
            const isFuture = !isDone && !isCurrent;
            const isPipHere = pipIndex === idx;

            return (
              <div
                key={dest.id}
                className={`map-stop-wrapper map-stop-wrapper--${idx % 2 === 0 ? 'left' : 'right'}`}
                role="listitem"
              >
                {/* Dotted connector */}
                <div className="map-connector" aria-hidden="true">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <path
                      d={idx % 2 === 0
                        ? 'M30 0 C10 20 50 40 30 60'
                        : 'M30 0 C50 20 10 40 30 60'}
                      stroke="#A8D88A"
                      strokeWidth="4"
                      strokeDasharray="8 8"
                      strokeLinecap="round"
                    />
                    {/* Tiny pebbles */}
                    <circle cx="15" cy="30" r="3" fill="#D4C5A9" opacity="0.6" />
                    <circle cx="45" cy="20" r="2" fill="#D4C5A9" opacity="0.5" />
                  </svg>
                </div>

                <div
                  className={`map-stop
                    ${isDone ? 'map-stop--done' : ''}
                    ${isCurrent ? 'map-stop--current' : ''}
                    ${isFuture ? 'map-stop--future' : ''}
                  `}
                  style={{ '--stop-accent': dest.accent, '--stop-bg': dest.bg }}
                >
                  {/* Pip near current stop */}
                  {isPipHere && (
                    <div className="map-stop__pip">
                      <Butterfly size={80} animate="float" />
                    </div>
                  )}

                  {/* Decorative flora around the stop */}
                  <span className="map-stop__deco map-stop__deco--1">{dest.deco[0]}</span>
                  <span className="map-stop__deco map-stop__deco--2">{dest.deco[1]}</span>

                  {/* Node button */}
                  <button
                    className={`map-stop__btn ${isCurrent ? 'anim-pulse' : ''}`}
                    onClick={() => !isFuture && onNavigate(dest.id)}
                    disabled={isFuture}
                    aria-label={`${dest.label}${isDone ? ' – completed' : isCurrent ? ' – current, tap to go' : ' – coming soon'}`}
                  >
                    <span className="map-stop__icon">
                      {isDone ? '✅' : dest.emoji}
                    </span>
                  </button>

                  <div className="map-stop__info">
                    <span className="map-stop__label">{dest.label}</span>
                    {isDone && <span className="map-stop__tag map-stop__tag--done">Complete ⭐</span>}
                    {isCurrent && <span className="map-stop__tag map-stop__tag--current">Let's go!</span>}
                    {isFuture && <span className="map-stop__tag">Coming soon</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Finish */}
          <div className="map-stop-wrapper map-stop-wrapper--center" role="listitem">
            <div className="map-connector" aria-hidden="true">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <path d="M30 0 L30 60" stroke="#A8D88A" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" />
              </svg>
            </div>
            <div className={`map-finish ${allDone ? 'map-finish--done anim-celeb' : ''}`}>
              {allDone && pipIndex === DESTINATIONS.length && (
                <div className="map-stop__pip map-stop__pip--finish">
                  <Butterfly size={80} animate="bounce" />
                </div>
              )}
              <span className="map-finish__emoji">{allDone ? '🌻' : '🌸'}</span>
              <span className="map-finish__label">{allDone ? 'You did it!' : 'Finish'}</span>
            </div>
          </div>
        </div>

        {/* Celebration CTA */}
        {allDone && (
          <div className="map-celebrate anim-fade-up">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate('celebration')}
            >
              🎉 See your celebration!
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
