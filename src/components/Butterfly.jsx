import React from 'react';
import './Butterfly.css';

/**
 * Pip the butterfly mascot SVG component.
 * Props:
 *   size    – px size (default 120)
 *   animate – 'float' | 'bounce' | 'none' (default 'float')
 *   className – extra class names
 */
export default function Butterfly({ size = 120, animate = 'float', className = '', style = {} }) {
  const animClass =
    animate === 'float' ? 'anim-float' :
    animate === 'bounce' ? 'anim-bounce' :
    '';

  return (
    <div
      className={`pip-butterfly ${animClass} ${className}`}
      style={{ width: size, height: size, ...style }}
      role="img"
      aria-label="Pip the butterfly"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
      >
        {/* Left upper wing */}
        <ellipse cx="38" cy="42" rx="32" ry="22" fill="#A99AEE" opacity="0.9"/>
        <ellipse cx="38" cy="42" rx="24" ry="16" fill="#C4BAF5" opacity="0.7"/>
        <circle cx="28" cy="36" r="5" fill="#596FE8" opacity="0.5"/>

        {/* Right upper wing */}
        <ellipse cx="82" cy="42" rx="32" ry="22" fill="#FFD463" opacity="0.9"/>
        <ellipse cx="82" cy="42" rx="24" ry="16" fill="#FFE49A" opacity="0.7"/>
        <circle cx="92" cy="36" r="5" fill="#FF8F7E" opacity="0.5"/>

        {/* Left lower wing */}
        <ellipse cx="40" cy="74" rx="24" ry="18" fill="#62C894" opacity="0.85"/>
        <ellipse cx="40" cy="74" rx="16" ry="12" fill="#8FD9B0" opacity="0.6"/>

        {/* Right lower wing */}
        <ellipse cx="80" cy="74" rx="24" ry="18" fill="#FF8F7E" opacity="0.85"/>
        <ellipse cx="80" cy="74" rx="16" ry="12" fill="#FFAD9F" opacity="0.6"/>

        {/* Body */}
        <ellipse cx="60" cy="60" rx="7" ry="22" fill="#29364A"/>
        <ellipse cx="60" cy="58" rx="5" ry="16" fill="#596FE8"/>

        {/* Head */}
        <circle cx="60" cy="38" r="8" fill="#29364A"/>
        <circle cx="60" cy="38" r="6" fill="#596FE8"/>

        {/* Eyes */}
        <circle cx="57" cy="36" r="2" fill="white"/>
        <circle cx="63" cy="36" r="2" fill="white"/>
        <circle cx="57.5" cy="36.5" r="1" fill="#29364A"/>
        <circle cx="63.5" cy="36.5" r="1" fill="#29364A"/>

        {/* Smile */}
        <path d="M56 41 Q60 44 64 41" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

        {/* Antennae */}
        <line x1="57" y1="30" x2="50" y2="20" stroke="#29364A" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="63" y1="30" x2="70" y2="20" stroke="#29364A" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="50" cy="19" r="2.5" fill="#FFD463"/>
        <circle cx="70" cy="19" r="2.5" fill="#FFD463"/>
      </svg>
    </div>
  );
}
