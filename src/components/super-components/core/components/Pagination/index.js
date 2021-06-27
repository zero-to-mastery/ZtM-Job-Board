import React from 'react';
import { useDataPage } from '../../../../../hooks/useDataPage';
import { Button } from '../Button';

export const Pagination = props => {
  const { currentPage, setPage } = useDataPage();
  return (
    <div
      style={{ display: 'flex', padding: '1rem', justifyContent: 'flex-end' }}
    >
      <div>
        <Button
          style={{ width: '8rem' }}
          onClick={() => setPage(pre => pre - 1)}
        >
          Previous
        </Button>
        &nbsp;&nbsp;
        <Button
          style={{ width: 'fit-content' }}
          onClick={() => setPage(pre => pre - 1)}
        >
          {currentPage}
        </Button>
        &nbsp;&nbsp;
        <Button
          style={{ width: '8rem' }}
          onClick={() => setPage(pre => pre + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
