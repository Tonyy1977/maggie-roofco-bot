// src/AvatarToggle.jsx
import React from 'react';

export default function AvatarToggle() {
  const handleClick = () => {
    window.parent.postMessage('toggle-chat', '*');
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundImage: 'url("https://i.postimg.cc/280hGJcN/1.jpg")',
        backgroundSize: 'cover',
        cursor: 'pointer',
      }}
    />
  );
}
