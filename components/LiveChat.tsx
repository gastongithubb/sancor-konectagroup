// app/components/LiveChat.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

type SessionUser = {
  id: string;
}

export default function LiveChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      // Fetch initial messages
      fetchMessages();

      // Set up real-time updates
      const eventSource = new EventSource(`/api/chat?userId=${(session.user as any).id}`);

      eventSource.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, newMessage]);
      };

      return () => {
        eventSource.close();
      };
    }
  }, [session]);

  const fetchMessages = async () => {
    const response = await fetch('/api/chat');
    const data = await response.json();
    setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage, senderId: (session?.user as any).id }),
    });

    if (response.ok) {
      setNewMessage('');
    }
  };

  return (
    <div>
      <h2>Live Chat</h2>
      <div style={{ height: '300px', overflowY: 'scroll' }}>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.senderId === (session?.user as any).id ? 'You' : 'Other'}: </strong>
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
