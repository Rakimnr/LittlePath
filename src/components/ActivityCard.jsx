import React from 'react';
import './ActivityCard.css';

/**
 * Generic content card used across activities.
 * Props:
 *   children
 *   className
 *   highlight – boolean, adds a coloured highlight border
 *   color     – CSS color string for highlight
 *   onClick
 *   selected  – boolean
 *   correct   – boolean | null  (null=neutral, true=correct, false=wrong)
 */
export default function ActivityCard({
  children,
  className = '',
  highlight = false,
  color,
  onClick,
  selected = false,
  correct = null,
}) {
  let stateClass = '';
  if (correct === true) stateClass = 'activity-card--correct';
  else if (correct === false) stateClass = 'activity-card--wrong';
  else if (selected) stateClass = 'activity-card--selected';

  const style = {};
  if (highlight && color) {
    style.borderColor = color;
    style.borderWidth = '3px';
    style.borderStyle = 'solid';
  }

  return (
    <div
      className={`activity-card ${stateClass} ${onClick ? 'activity-card--clickable' : ''} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
    >
      {children}
    </div>
  );
}
