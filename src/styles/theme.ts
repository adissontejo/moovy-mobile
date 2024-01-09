import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6CD3AE',
    secondary: '#12153D',
    info: '#434670',
    danger: '#FE6D8E',
    grey: '#A1A1A1',
  },
  fonts: {
    ...DefaultTheme.fonts,
    headlineLarge: {
      fontSize: 32,
    },
    titleLarge: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    bodyLarge: {
      fontSize: 30,
    },
    bodyMedium: {
      fontSize: 24,
    },
    bodySmall: {
      fontSize: 18,
    },
    bodyExtraSmall: {
      fontSize: 14,
    },
  },
} as const;
