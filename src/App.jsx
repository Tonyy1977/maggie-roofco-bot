import React from 'react';
import ChatToggle from './ChatToggle';
import FullChat from './FullChat';

function App() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const fullscreen = params.get("fullscreen") === "true";

  const isMobile = window.innerWidth <= 768;

  // ✅ Auto-redirect mobile users from toggle to fullscreen chat
  if (mode === "toggle" && isMobile) {
    window.location.href = "?mode=chat&fullscreen=true";
    return null; // prevent flicker
  }

  if (mode === "toggle") return <ChatToggle />;
  if (mode === "chat") return <FullChat fullscreen={fullscreen} />;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Micah Widget Preview</h2>
      <p>Add <code>?mode=toggle</code> or <code>?mode=chat</code> in the URL.</p>
    </div>
  );
}

export default App;
