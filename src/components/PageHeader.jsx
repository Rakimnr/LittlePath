import React from 'react';
import './PageHeader.css';

/**
 * Simple top navigation header for activity pages.
 * Props:
 *   onHome     – function to navigate home
 *   title      – optional page title string
 *   rightSlot  – optional right-side node (audio toggle etc.)
 */
export default function PageHeader({ onHome, title, rightSlot }) {
  return (
    <header className="page-header">
      <button
        className="page-header__home btn btn-white btn-icon"
        onClick={onHome}
        aria-label="Go home"
        title="Home"
      >
        🏠
      </button>

      {title && (
        <h1 className="page-header__title">{title}</h1>
      )}

      <div className="page-header__right">
        {rightSlot || null}
      </div>
    </header>
  );
}
