import React from 'react';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';         // Loads the toggle widget (default)
import FullChat from './FullChat.jsx'; // Loads the full-screen chat

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />           {/* For /?mode=toggle */}
        <Route path="/fullscreen" element={<FullChat />} /> {/* Full screen mode */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
