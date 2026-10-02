import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import AudioButton from '../components/AudioButton';
import PrimaryButton from '../components/PrimaryButton';
import './SoundGarden.css';

/**
 * SoundGarden – receives `data` prop (array from learningData.soundGarden).
 * Each item: { id, letter, word, emoji, speech, audio, color }
 */
export default function SoundGarden({ data, onComplete, onHome }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const item = data[index];
  const isFirst = index === 0;
  const isLast = index === data.length - 1;

  return (
    <div className="sg-page page">
      <PageHeader
        onHome={onHome}
        title="Sound Garden"
        rightSlot={<span aria-hidden="true" style={{ fontSize: '1.5rem' }}>🎵</span>}
      />

      {/* Decorative bg */}
      <div className="sg-bg" aria-hidden="true">
        <div className="sg-bg__flower sg-bg__flower--1 anim-sway">🌸</div>
        <div className="sg-bg__flower sg-bg__flower--2 anim-sway" style={{ animationDelay: '-1.2s' }}>🌼</div>
        <div className="sg-bg__note sg-bg__note--1">♪</div>
        <div className="sg-bg__note sg-bg__note--2">♫</div>
        <div className="sg-bg__note sg-bg__note--3">♩</div>
      </div>

      <main className="sg-main container">
        {/* Progress dots */}
        <div className="sg-dots" role="tablist" aria-label="Cards progress">
          {data.map((it, i) => (
            <button
              key={it.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Card ${i + 1}: ${it.word}`}
              className={`sg-dot ${i === index ? 'sg-dot--active' : ''} ${i < index ? 'sg-dot--done' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        {/* Letter + word card */}
        <div
          className="sg-card anim-fade-scale"
          key={item.id}
          style={{ '--card-color': item.color }}
        >
          {/* Large letter */}
          <div className="sg-letter" style={{ color: item.color }} aria-label={`Letter ${item.letter}`}>
            {item.letter}
          </div>

          {/* Picture / emoji */}
          <div
            className={`sg-emoji ${playing ? 'sg-emoji--playing' : ''}`}
            role="img"
            aria-label={item.word}
          >
            {item.emoji}
          </div>

          {/* Word */}
          <div className="sg-word">{item.word}</div>

          {/* Audio button with wave decoration */}
          <div className="sg-audio-wrapper">
            <div className="sg-waves" aria-hidden="true">
              <span className="sg-wave sg-wave--1">)</span>
              <span className="sg-wave sg-wave--2">)</span>
              <span className="sg-wave sg-wave--3">)</span>
            </div>
            <AudioButton
              src={item.audio}
              text={item.speech}
              label={`Listen: ${item.word}`}
              size="lg"
            />
            <div className="sg-waves sg-waves--right" aria-hidden="true">
              <span className="sg-wave sg-wave--3">(</span>
              <span className="sg-wave sg-wave--2">(</span>
              <span className="sg-wave sg-wave--1">(</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sg-nav">
          <PrimaryButton
            variant="ghost"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={isFirst}
            icon="←"
          >
            Back
          </PrimaryButton>

          {isLast ? (
            <PrimaryButton variant="green" size="lg" onClick={onComplete} icon="✓">
              All done!
            </PrimaryButton>
          ) : (
            <PrimaryButton
              variant="primary"
              onClick={() => setIndex((i) => i + 1)}
              icon="→"
            >
              Next
            </PrimaryButton>
          )}
        </div>
      </main>
    </div>
  );
}
