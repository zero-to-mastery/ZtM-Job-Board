import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../Card';

export const Navbar = (props: any) => {
  const { theme } = useTheme();
  const { style, children } = props;

  return (
    <div style={{ padding: '1rem', background: theme.palette.background.main }}>
      <Card
        style={{
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...style,
        }}
      >
        {children}
      </Card>
    </div>
  );
};
