// app/components/TeamMemberList.tsx
import Link from 'next/link';

interface Member {
  id: number;
  username: string;
}

export default function TeamMemberList({ members }: { members: Member[] }) {
  return (
    <div>
      <h3>Team Members</h3>
      <ul>
        {members.map(member => (
          <li key={member.id}>
            <Link href={`/dashboard/agent/${member.id}`}>
              {member.username}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}