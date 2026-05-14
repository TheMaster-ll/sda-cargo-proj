import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeContextProvider } from './context/ThemeContext';
import './i18n';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeContextProvider>
        <AuthProvider>
          <NotificationProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </NotificationProvider>
        </AuthProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
