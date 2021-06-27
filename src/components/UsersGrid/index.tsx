import React from 'react';
import { Card, useTheme } from '../../components/super-components/core';
import { Theme } from '../super-components/core/interfaces/theme';
import UserCard from './UserCard';

const useStyles = (theme: Theme) => {
  return {
    container: {
      display: 'grid',
      gap: '2rem',
      gridTemplateColumns: `repeat(auto-fit, minmax(16rem, 2fr))`,
      background: theme.palette.background.dark,
      padding: '2rem',
      boxShadow: 'none',
    },
  };
};

export const UsersGridContainer = (props: any) => {
  const { people, style } = props;
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <Card style={{ ...styles.container, ...style }}>
      {people.slice(0, 20).map((item: any, i: any) => (
        <UserCard key={i} {...item} />
      ))}
    </Card>
  );
};
