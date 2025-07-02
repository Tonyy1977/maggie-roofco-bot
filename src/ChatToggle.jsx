import React from 'react';

const ChatToggle = () => {
  const handleClick = () => {
    window.parent.postMessage('toggle-chat', '*');
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    >
      <button
        onClick={handleClick}
        style={{
          position: 'absolute',
          bottom: '10px',   // ← Pin it to bottom-right
          right: '10px',
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
    </div>
  );
};

export default ChatToggle;
