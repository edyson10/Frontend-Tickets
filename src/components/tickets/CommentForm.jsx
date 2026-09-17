import { useState } from 'react'
import { Button } from '../ui/Button.jsx'

export function CommentForm({ onSubmit, submitting, canMarkInternal }) {
  const [comment, setComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    if (!comment.trim()) return
    onSubmit({ comment: comment.trim(), isInternal })
    setComment('')
    setIsInternal(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Escribe un comentario..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      <div className="flex items-center justify-between">
        {canMarkInternal ? (
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-slate-300"
            />
            Nota interna (no visible para el agente)
          </label>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={submitting || !comment.trim()}>
          {submitting ? 'Enviando...' : 'Comentar'}
        </Button>
      </div>
    </form>
  )
}
