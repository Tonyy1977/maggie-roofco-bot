import React from 'react';
import ChatToggle from './ChatToggle';
import FullChat from './FullChat';

function App() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  if (mode === "toggle") {
    return <ChatToggle />;
  }

  return <FullChat />;
}

export default App;
