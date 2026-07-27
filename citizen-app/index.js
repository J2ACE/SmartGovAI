import { registerRootComponent } from 'expo';
import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { ComplaintProvider } from './src/contexts/ComplaintContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function App() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <RootNavigator />
      </ComplaintProvider>
    </AuthProvider>
  );
}

registerRootComponent(App);
