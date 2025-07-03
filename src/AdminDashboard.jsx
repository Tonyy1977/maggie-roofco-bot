import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get('/api/admin/messages');
        setMessages(res.data);
      } catch (err) {
        console.error('❌ Failed to load admin messages:', err);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    const groupedBySession = messages.reduce((acc, msg) => {
      if (!acc[msg.sessionId]) acc[msg.sessionId] = [];
      acc[msg.sessionId].push(msg);
      return acc;
    }, {});
    setGrouped(groupedBySession);
  }, [messages]);

  return (
    <div style={{ padding: '20px' }}>
      <h1><strong>Micah Admin Dashboard</strong></h1>
      {Object.keys(grouped).map((sessionId) => (
        <div key={sessionId} style={{ border: '1px solid #ccc', margin: '20px 0', padding: '10px', borderRadius: '8px' }}>
          <h3>🧑‍💻 Session: {sessionId}</h3>
          {grouped[sessionId].map((msg, idx) => (
            <div key={idx} style={{ padding: '5px 0', color: msg.sender === 'user' ? 'blue' : 'green' }}>
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
