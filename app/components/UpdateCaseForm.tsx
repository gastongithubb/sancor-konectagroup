// app/components/UpdateCaseForm.tsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpdateCaseForm({ caseId, currentStatus }: { caseId: number, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [comment, setComment] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/cases/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment }),
    });

    if (response.ok) {
      router.refresh();
    } else {
      console.error('Error updating case');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Update Case</h3>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="CLOSED">Closed</option>
      </select>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment"
      />
      <button type="submit">Update Case</button>
    </form>
  );
}