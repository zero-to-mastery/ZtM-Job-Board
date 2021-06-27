export interface BasicColor {
  light: string;
  main: string;
  dark: string;
}

export interface TextColor extends BasicColor {
  disabled: string;
}

export interface Theme {
  type: string;

  palette: {
    common: BasicColor;
    primary: BasicColor;
    secondary: BasicColor;
    error: BasicColor;
    success: BasicColor;
    warning: BasicColor;
    info: BasicColor;
    background: BasicColor;
    text: TextColor;
    border: string;
  };
}

export default interface ThemeProps {
  type: string;
  themes: Theme[];
}
