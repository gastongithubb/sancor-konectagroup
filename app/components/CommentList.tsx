// app/components/CommentList.tsx
import { Comment } from '@prisma/client';

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  return (
    <div>
      <h3>Comments</h3>
      <ul>
        {comments.map(comment => (
          <li key={comment.id}>
            <p>{comment.content}</p>
            <small>By: {comment.createdBy} at {comment.createdAt.toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}