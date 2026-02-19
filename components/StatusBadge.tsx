type Status = 'extracted' | 'needs_review' | 'approved';

const styles: Record<Status, string> = {
  extracted: 'bg-blue-100 text-blue-800',
  needs_review: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
};

export default function StatusBadge({ status }: { status: Status }) {
  const label = status.replace('_', ' ');
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {label}
    </span>
  );
}
