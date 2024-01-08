import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

import { Home } from './pages/Home';
import { theme } from './styles';

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'white' }}>
        <Home />
      </GestureHandlerRootView>
    </PaperProvider>
  );
};

export default App;
