import React from 'react';

import { Card } from '../Card';
import { Icons } from '../../Icons';

export const Searcher = props => {
  const { style, name, placeholder, onChange } = props;
  return (
    <Card style={{ display: 'flex', alignItems: 'baceline', ...style }}>
      <Icons.SearchIcon style={{ color: '#5c5c5c' }} />
      <input
        type="search"
        name={name}
        id=""
        placeholder={placeholder || 'Search...'}
        onChange={({ target }) => {
          const { name, value } = target;
          onChange({ [name]: value });
        }}
        style={{ border: 'none', height: '100%', width: '100%' }}
      />
    </Card>
  );
};
