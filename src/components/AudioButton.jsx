import React, { useState, useRef, useEffect, useCallback } from 'react';
import './AudioButton.css';

// ── Voice selector ─────────────────────────────────────────────
// Loads voices asynchronously and picks the best English voice.
let cachedVoice = null;

function getBestVoice() {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis?.getVoices() || [];
  if (!voices.length) return null;

  // Prefer en-US, then any en-* voice
  const preferred = [
    voices.find((v) => v.lang === 'en-US' && v.localService),
    voices.find((v) => v.lang === 'en-US'),
    voices.find((v) => v.lang.startsWith('en-') && v.localService),
    voices.find((v) => v.lang.startsWith('en-')),
    voices[0],
  ].find(Boolean);

  cachedVoice = preferred || null;
  return cachedVoice;
}

// ── Speech synthesis ────────────────────────────────────────────
function speakText(text, onStart, onEnd) {
  if (!window.speechSynthesis) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.8;
  utterance.pitch = 1.05;
  utterance.lang = 'en-US';
  utterance.volume = 1;

  const voice = getBestVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;

  window.speechSynthesis.speak(utterance);
}

// Pre-load voices as soon as possible
if (typeof window !== 'undefined' && window.speechSynthesis) {
  // Voices may already be available
  getBestVoice();
  // Or they load async
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null; // Reset so next call re-selects
    getBestVoice();
  };
}

// ── AudioButton component ───────────────────────────────────────
/**
 * Audio button that:
 * 1. Tries to play the MP3 at `src`.
 * 2. Falls back to Web Speech API using `text` if MP3 fails or is absent.
 *
 * Props:
 *   src   – path to audio file e.g. '/audio/apple.mp3'
 *   text  – speech text e.g. 'A for Apple'
 *   label – accessible label (default 'Listen')
 *   size  – 'sm' | 'md' | 'lg' (default 'md')
 */
export default function AudioButton({ src, text, label = 'Listen', size = 'md' }) {
  const [state, setState] = useState('idle'); // 'idle' | 'playing' | 'speaking'
  const audioRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleClick = useCallback(() => {
    if (state !== 'idle') return;

    // Stop any existing playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();

    // Try MP3 first
    if (src) {
      const audio = new Audio(src);
      audioRef.current = audio;

      const tryFallback = () => {
        audioRef.current = null;
        // Fall back to speech synthesis
        if (text) {
          setState('speaking');
          speakText(text, () => {}, () => setState('idle'));
        } else {
          setState('idle');
        }
      };

      audio.oncanplaythrough = () => {
        setState('playing');
        audio.play().catch(tryFallback);
      };

      audio.onended = () => {
        setState('idle');
        audioRef.current = null;
      };

      audio.onerror = tryFallback;

      // Timeout: if MP3 hasn't loaded in 1.5s, fall back to speech
      const timeout = setTimeout(() => {
        if (audioRef.current === audio) {
          audio.onerror = null;
          audio.oncanplaythrough = null;
          tryFallback();
        }
      }, 1500);

      audio.oncanplaythrough = () => {
        clearTimeout(timeout);
        setState('playing');
        audio.play().catch(tryFallback);
      };

      audio.load();
    } else if (text) {
      // No src at all — go straight to speech
      setState('speaking');
      speakText(text, () => {}, () => setState('idle'));
    }
  }, [src, text, state]);

  const sizeClass = size === 'lg' ? 'audio-btn--lg' : size === 'sm' ? 'audio-btn--sm' : '';
  const isActive = state !== 'idle';

  const icon = state === 'playing' ? '🔊' : state === 'speaking' ? '🗣️' : '🔊';
  const buttonLabel =
    state === 'playing' ? 'Playing...' :
    state === 'speaking' ? 'Speaking...' :
    label;

  return (
    <button
      className={`audio-btn ${sizeClass} ${isActive ? 'audio-btn--active' : ''} ${state === 'speaking' ? 'audio-btn--speaking' : ''}`}
      onClick={handleClick}
      aria-label={`${label}${isActive ? ' (playing)' : ''}`}
      aria-pressed={isActive}
      title={label}
      type="button"
    >
      <span className={`audio-btn__icon ${state === 'playing' ? 'audio-btn__icon--pulse' : ''}`} aria-hidden="true">
        {icon}
      </span>
      <span className="audio-btn__label">{buttonLabel}</span>
    </button>
  );
}
