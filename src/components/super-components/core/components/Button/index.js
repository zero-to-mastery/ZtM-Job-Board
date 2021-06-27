import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import './index.css';

export const Button = props => {
  const { theme } = useTheme();
  const { children, style } = props;
  return (
    <button
      className="btn"
      style={{
        background: theme.palette.primary.light,
        color: theme.palette.primary.main,
        borderRadius: '7px',
        width: '100%',
        padding: '0.5rem 2rem',
        ...style,
      }}
    >
      {children}
    </button>
  );
};
