import React, { useEffect, useState } from 'react';
import Butterfly from '../components/Butterfly';
import './Welcome.css';

const ACTIVITY_PILLS = [
  { icon: '🔊', label: 'Sounds' },
  { icon: '✏️', label: 'Trace' },
  { icon: '🧩', label: 'Match' },
];

export default function Welcome({ onStart }) {
  const [ready, setReady] = useState(false);

  // Staggered intro: let CSS transitions run after first paint
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`welcome-page page ${ready ? 'welcome-page--ready' : ''}`}>

      {/* ── Sky layer ── */}
      <div className="welcome-sky" aria-hidden="true">
        <div className="w-star w-star--1">✦</div>
        <div className="w-star w-star--2">✦</div>
        <div className="w-star w-star--3">✧</div>
        <div className="w-cloud w-cloud--1 anim-cloud">☁️</div>
        <div className="w-cloud w-cloud--2 anim-cloud" style={{ animationDelay: '-8s' }}>☁️</div>
        <div className="w-cloud w-cloud--3 anim-cloud" style={{ animationDelay: '-20s' }}>☁️</div>
      </div>

      {/* ── Rolling hills ── */}
      <div className="welcome-hills" aria-hidden="true">
        <div className="w-hill w-hill--far" />
        <div className="w-hill w-hill--mid" />
      </div>

      {/* ── Foreground flora ── */}
      <div className="welcome-flora" aria-hidden="true">
        <div className="w-grass" />
        <span className="w-flower w-flower--1 anim-sway">🌷</span>
        <span className="w-flower w-flower--2 anim-sway" style={{ animationDelay: '-1.5s' }}>🌼</span>
        <span className="w-flower w-flower--3 anim-sway" style={{ animationDelay: '-3s' }}>🌸</span>
        <span className="w-flower w-flower--4 anim-sway" style={{ animationDelay: '-0.8s' }}>🌺</span>
        <span className="w-flower w-flower--5 anim-sway" style={{ animationDelay: '-2.2s' }}>🌻</span>
        <span className="w-leaf w-leaf--1">🌿</span>
        <span className="w-leaf w-leaf--2">🌿</span>
      </div>

      {/* ── Main content ── */}
      <main className="welcome-main">

        {/* Logo */}
        <div className="w-logo welcome-anim welcome-anim--logo">
          <span className="w-logo__icon" aria-hidden="true">🦋</span>
          <span className="w-logo__text">LittlePath</span>
        </div>

        {/* Tagline */}
        <p className="w-tagline welcome-anim welcome-anim--tagline">
          Small steps. Big discoveries.
        </p>

        {/* ── Hero: Pip + sparkles ── */}
        <div className="w-hero welcome-anim welcome-anim--pip">
          <div className="w-sparkles" aria-hidden="true">
            <span className="w-sparkle w-sparkle--1">✨</span>
            <span className="w-sparkle w-sparkle--2">⭐</span>
            <span className="w-sparkle w-sparkle--3">✨</span>
            <span className="w-sparkle w-sparkle--4">🌟</span>
          </div>
          <div className="w-pip-glow" aria-hidden="true" />
          <Butterfly size={160} animate="float" className="w-pip" />
        </div>

        {/* Headline */}
        <h1 className="w-headline welcome-anim welcome-anim--headline">
          Ready to learn?
        </h1>
        <p className="w-subheadline welcome-anim welcome-anim--headline">
          Follow Pip on a little learning adventure!
        </p>

        {/* CTA button */}
        <button
          className="w-start-btn welcome-anim welcome-anim--btn"
          onClick={onStart}
          aria-label="Start Learning"
        >
          <span>Start Learning</span>
          <span className="w-start-btn__arrow" aria-hidden="true">→</span>
        </button>

        {/* Activity pills */}
        <div
          className="w-pills welcome-anim welcome-anim--pills"
          role="list"
          aria-label="Learning activities"
        >
          {ACTIVITY_PILLS.map((pill) => (
            <div key={pill.label} className="w-pill" role="listitem">
              <span className="w-pill__icon" aria-hidden="true">{pill.icon}</span>
              <span className="w-pill__label">{pill.label}</span>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
