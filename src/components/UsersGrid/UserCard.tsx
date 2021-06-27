import React from 'react';
import { Card, Button, Avatar, useTheme } from '../super-components/core';
import DefaultAvatar from '../../assets/DefaultAvatar.png';
import { Theme } from '../super-components/core/interfaces/theme';

const useStyles = (theme: Theme) => {
  return {
    container: {
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      textAlign: 'center',
    },
    userName: {
      margin: 0,
      color: theme.palette.text.main,
    },
    jobName: {
      margin: '5px 0',
      color: theme.palette.text.disabled,
    },
  };
};

const UserCard = (props: any) => {
  const { name, jobTitle, img } = props;
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <Card key={1} style={styles.container}>
      <Avatar src={img || DefaultAvatar} />
      <br />
      <h2 style={styles.userName}>{name}</h2>
      <p style={styles.jobName}>{jobTitle}</p>
      <br />

      <Button>View Profile</Button>
    </Card>
  );
};

export default UserCard;
