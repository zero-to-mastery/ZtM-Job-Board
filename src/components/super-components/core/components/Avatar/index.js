import React from 'react';

export const Avatar = props => {
  const { src } = props;
  return (
    <div
      style={{
        width: '5rem',
        height: '5rem',
        border: '7px solid #E0EAF2',
        borderRadius: '50%',
      }}
    >
      <img src={src} alt="" style={{ width: '100%', borderRadius: '50%' }} />
    </div>
  );
};
