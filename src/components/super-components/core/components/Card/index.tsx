import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export const Card = (props: any) => {
  const { theme } = useTheme();
  const { style, children } = props;
  return (
    <div
      style={{
        background: theme.palette.common.light,
        borderRadius: '11px',
        boxShadow: '0 5px 10px #1b5b8028, 0 3px 6px #0210503a',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
