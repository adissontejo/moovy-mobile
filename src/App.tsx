import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

const App = () => {
  return (
    <PaperProvider>
      <GestureHandlerRootView style={{ flex: 1 }} />
    </PaperProvider>
  );
};

export default App;
