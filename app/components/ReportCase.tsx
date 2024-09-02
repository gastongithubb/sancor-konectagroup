// app/components/ReportCase.tsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportCase({ userId }: { userId: number }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, assignedTo: userId }),
    });

    if (response.ok) {
      setTitle('');
      setDescription('');
      router.refresh();
    } else {
      console.error('Error creating case');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Report New Case</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Case Title"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Case Description"
        required
      />
      <button type="submit">Report Case</button>
    </form>
  );
}