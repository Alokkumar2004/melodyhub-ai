import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MusicPlayerProvider>
          <App />
        </MusicPlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
