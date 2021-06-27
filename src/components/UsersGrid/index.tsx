import React from 'react';
import { Card, useTheme } from '../../components/super-components/core';
import { useDataPage } from '../../hooks/useDataPage';
import { Theme } from '../super-components/core/interfaces/theme';
import UserCard from './UserCard';
import { Pagination } from './../super-components/core/components/Pagination/index';

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
  const { data } = useDataPage();
  const { style } = props;
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <>
      <Card style={{ ...styles.container, ...style }}>
        {data.map((item: any, i: any) => (
          <UserCard key={i} {...item} />
        ))}
      </Card>
      <Pagination />
    </>
  );
};
