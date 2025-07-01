import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import App from './App.jsx';
import AvatarToggle from './AvatarToggle.jsx'; // make sure this file exists

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/toggle" element={<AvatarToggle />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
