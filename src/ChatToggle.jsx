import React from 'react';

const ChatToggle = () => {
  const handleClick = () => {
    window.parent.postMessage('toggle-chat', '*');
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
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
    </div>
  );
};

export default ChatToggle;
