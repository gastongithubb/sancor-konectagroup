// app/components/UpdateCase.tsx
'use client';

import { useState } from 'react';

export default function UpdateCase({
  caseId,
  currentStatus,
}: {
  caseId: number;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/cases/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      // Aquí podrías actualizar el estado local o recargar la página
      // eslint-disable-next-line no-console
      console.log('Case updated successfully');
    } else {
      console.error('Error updating case');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Closed">Closed</option>
      </select>
      <button type="submit">Update Status</button>
    </form>
  );
}
