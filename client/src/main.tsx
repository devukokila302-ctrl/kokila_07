import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastProvider } from './context/ToastContext';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { AppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <LocationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LocationProvider>
    </ToastProvider>
  </React.StrictMode>,
);
