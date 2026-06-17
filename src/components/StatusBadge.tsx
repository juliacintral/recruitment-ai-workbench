type StatusType = 'idle' | 'loading' | 'success' | 'error'

export function StatusBadge({ status, message }: { status: StatusType; message: string }) {
  if (!message) return null
  return <div className={`status status-${status}`}>{message}</div>
}
