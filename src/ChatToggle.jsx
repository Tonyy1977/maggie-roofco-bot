import React from 'react';

const ChatToggle = () => {
  const handleClick = () => {
    // Send a message to the parent page to toggle the chat box iframe
    window.parent.postMessage('toggle-chat', '*');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundImage: 'url(/micah-toggle.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      }}
      aria-label="Open chat"
    />
  );
};

export default ChatToggle;
