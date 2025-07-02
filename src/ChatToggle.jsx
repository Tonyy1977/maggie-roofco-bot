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
        display: 'flex',
        alignItems: 'flex-end',  // 👈 push down
        justifyContent: 'flex-end', // 👈 push right
        padding: '10px', // 👈 space from edges
        boxSizing: 'border-box',
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
