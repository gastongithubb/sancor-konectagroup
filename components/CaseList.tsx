// app/components/CaseList.tsx
import Link from 'next/link';

interface Case {
  id: number;
  title: string;
  status: string;
  createdAt: Date;
}

export default function CaseList({ cases }: { cases: Case[] }) {
  return (
    <div>
      <h3>Recent Cases</h3>
      <ul>
        {cases.map((case_) => (
          <li key={case_.id}>
            <Link href={`/case/${case_.id}`}>
              {case_.title} - Status: {case_.status} - Created:{' '}
              {case_.createdAt.toLocaleDateString()}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
