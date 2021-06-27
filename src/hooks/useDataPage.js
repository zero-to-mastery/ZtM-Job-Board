import React from 'react';
import { PaginationContext } from '../context/PaginationContext';

/**
 * hook to get theme
 *
 * @author Jose Aburto <pino0071@gmail.com>
 * @version 0.0.1
 */
export const useDataPage = () => {
  const context = React.useContext(PaginationContext);
  if (!context)
    throw new Error(
      'Make sure useDataPage is inside PaginationContextProvider!',
    );
  const { currentPage, data, setPage, setPerPage } = context;
  return {
    currentPage,
    data,
    setPage,
    setPerPage,
  };
};
