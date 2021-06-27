import React from 'react';
import { DataContext } from '../context/DataContext';

/**
 * hook to get theme
 *
 * @author Jose Aburto <pino0071@gmail.com>
 * @version 0.0.1
 */
export const useData = () => {
  const context = React.useContext(DataContext);
  if (!context)
    throw new Error(
      'Make sure useDataPage is inside PaginationContextProvider!',
    );
  const { data, filterData } = context;
  return {
    data,
    filterData,
  };
};
