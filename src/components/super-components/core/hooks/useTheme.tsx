import React from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * hook to get theme
 *
 * @author Jose Aburto <pino0071@gmail.com>
 * @version 0.0.1
 */
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context)
    throw new Error('Make sure useTheme is inside ThemeContextProvider!');
  return context;
};
