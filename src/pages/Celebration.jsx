import React, { useEffect, useState } from 'react';
import Butterfly from '../components/Butterfly';
import PrimaryButton from '../components/PrimaryButton';
import './Celebration.css';

const CONFETTI_COUNT = 35;
const CONFETTI_COLORS = ['#596FE8', '#62C894', '#FFD463', '#FF8F7E', '#A99AEE'];

function generateConfetti() {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2.5}s`,
    duration: `${2.5 + Math.random() * 2}s`,
    size: `${8 + Math.random() * 10}px`,
    shape: Math.random() > 0.5 ? 'circle' : 'square',
  }));
}

export default function Celebration({ onPlayAgain, onHome }) {
  const [confetti] = useState(generateConfetti);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowStars(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="cel-page page">
      {/* Confetti */}
      <div className="cel-confetti" aria-hidden="true">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="cel-confetti-piece"
            style={{
              left: piece.left,
              backgroundColor: piece.color,
              width: piece.size,
              height: piece.size,
              borderRadius: piece.shape === 'circle' ? '50%' : '3px',
              animationDelay: piece.delay,
              animationDuration: piece.duration,
            }}
          />
        ))}
      </div>

      {/* Stars */}
      {showStars && (
        <div className="cel-stars" aria-hidden="true">
          {['⭐', '🌟', '✨', '⭐', '🌟'].map((star, i) => (
            <span key={i} className="cel-star anim-star" style={{ animationDelay: `${i * 0.1}s` }}>
              {star}
            </span>
          ))}
        </div>
      )}

      <main className="cel-main container">
        {/* Pip at the flower */}
        <div className="cel-pip anim-celeb">
          <div className="cel-pip__scene">
            <Butterfly size={130} animate="bounce" />
            <span className="cel-flower anim-sway" aria-hidden="true">🌻</span>
          </div>
        </div>

        {/* Headline */}
        <div className="cel-headline anim-fade-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="cel-title">You did it!</h1>
          <p className="cel-subtitle">Pip reached the flower! 🦋</p>
        </div>

        {/* Completed chips */}
        <div className="cel-activities anim-fade-up" style={{ animationDelay: '0.4s' }}>
          {['🔊 Sounds', '✏️ Trace', '🧩 Match'].map((act) => (
            <div key={act} className="cel-activity-chip">
              <span>✅</span>
              <span>{act}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="cel-actions anim-fade-up" style={{ animationDelay: '0.6s' }}>
          <PrimaryButton variant="primary" size="lg" onClick={onPlayAgain} icon="🔄">
            Play Again
          </PrimaryButton>
          <PrimaryButton variant="ghost" onClick={onHome} icon="🏠">
            Home
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
}
