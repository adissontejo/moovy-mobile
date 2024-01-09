import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

import { Home } from './pages/Home';
import { theme } from './styles';
import { AppProvider } from './contexts';

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <AppProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'white' }}>
          <Home />
        </GestureHandlerRootView>
      </AppProvider>
    </PaperProvider>
  );
};

export default App;
