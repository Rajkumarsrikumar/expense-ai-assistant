const STATUS_CLASSES = {
  'Not Started': 'status-not-started',
  'In Progress': 'status-in-progress',
  'Blocked': 'status-blocked',
  'On Hold': 'status-on-hold',
  'Completed': 'status-completed',
  'Cancelled': 'status-cancelled',
};

export function StatusBadge({ status }) {
  const cls = STATUS_CLASSES[status] || 'status-default';
  return <span className={`badge badge-status ${cls}`}>{status || '—'}</span>;
}
