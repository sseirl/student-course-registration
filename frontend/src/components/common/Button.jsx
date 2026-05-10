// Простая кнопка, два варианта: primary (синяя) и outline (для второстепенных действий)
import React from 'react';

const Button = ({ children, variant = 'primary', onClick, type = 'button', disabled = false, fullWidth = false }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.65rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: 500,
    borderRadius: '32px', // чуть скруглённые, но не пуговицы
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
  };

  const variants = {
    primary: {
      backgroundColor: '#0a2942', // deep dark blue
      color: '#ffffff',
      ':hover': { backgroundColor: '#123e60' },
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#0a2942',
      border: '1px solid #cbd5e1',
      ':hover': { backgroundColor: '#f1f5f9', borderColor: '#0a2942' },
    },
  };

  const style = { ...baseStyle, ...variants[variant] };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      onMouseEnter={(e) => {
        if (disabled) return;
        const hoverStyle = variants[variant][':hover'];
        if (hoverStyle) Object.assign(e.currentTarget.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        Object.assign(e.currentTarget.style, variants[variant]);
      }}
    >
      {children}
    </button>
  );
};

export default Button;