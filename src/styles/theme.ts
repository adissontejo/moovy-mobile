import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6CD3AE',
    secondary: '#12153D',
    info: '#434670',
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
      fontSize: 18,
    },
  },
} as const;
