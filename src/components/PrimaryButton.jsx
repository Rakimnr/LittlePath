import React from 'react';

/**
 * Reusable button component.
 * Props:
 *   variant  – 'primary' | 'green' | 'yellow' | 'coral' | 'ghost' | 'white' (default 'primary')
 *   size     – 'sm' | 'md' | 'lg' (default 'md')
 *   icon     – emoji or node before label
 *   onClick
 *   disabled
 *   className
 *   children
 */
export default function PrimaryButton({
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const sizeClass = size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}
