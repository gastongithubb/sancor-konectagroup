// app/components/Notifications.tsx
'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  message: string;
  createdAt: Date;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      const eventSource = new EventSource(`/api/notifications?userId=${(session.user as any).id}`);
      
      eventSource.onmessage = (event) => {
        const newNotification = JSON.parse(event.data);
        setNotifications(prev => [newNotification, ...prev].slice(0, 5));
      };

      return () => {
        eventSource.close();
      };
    }
  }, [session]);

  return (
    <div>
      <h2>Recent Notifications</h2>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id}>
            {notification.message} - {new Date(notification.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}