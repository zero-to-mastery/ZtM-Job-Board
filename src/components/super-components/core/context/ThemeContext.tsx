import React from 'react';
import { Theme } from '../interfaces/theme';
import { light } from './../theme/light';

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/**
 * Global theme Context
 *
 * @author Jose Aburto <pino0071@gmail.com>
 * @version 0.0.1
 */
export const ThemeContext = React.createContext<ThemeContextProps>({
  theme: light,
  setTheme: theme => {},
});

interface ProviderProps {
  theme: Theme;
  children: any;
}

/**
 * Global theme provider
 * @param {ThemeProps} props - theme definition
 *
 * @author Jose Aburto <pino0071@gmail.com>
 * @version 0.0.1
 */
export const ThemeProvider = (props: ProviderProps) => {
  const [theme, setTheme] = React.useState<Theme>(light);

  React.useEffect(() => {
    const { theme } = props;
    if (theme) setTheme(theme);
  }, []);

  const value = React.useMemo(() => {
    return {
      theme,
      setTheme,
    };
  }, []);

  return <ThemeContext.Provider value={value} {...props} />;
};
