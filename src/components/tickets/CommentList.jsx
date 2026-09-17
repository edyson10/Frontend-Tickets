import { formatDateTime } from '../../utils/formatters.js'
import { EmptyState } from '../ui/EmptyState.jsx'

export function CommentList({ comments }) {
  if (!comments || comments.length === 0) {
    return <EmptyState title="Sin comentarios" description="Se el primero en comentar este ticket." />
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className={`rounded-lg border p-3 text-sm ${
            comment.isInternal ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold text-slate-800">{comment.userName}</span>
            <span className="text-xs text-slate-400">{formatDateTime(comment.createdAt)}</span>
          </div>
          {comment.isInternal && (
            <span className="mb-1 inline-block rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
              Nota interna
            </span>
          )}
          <p className="whitespace-pre-wrap text-slate-700">{comment.comment}</p>
        </li>
      ))}
    </ul>
  )
}
