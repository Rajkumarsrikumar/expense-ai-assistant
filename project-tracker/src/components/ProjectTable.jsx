import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { isOverdue } from '../api/projects';

const SORT_OPTIONS = [
  { value: 'updated_at', label: 'Last updated' },
  { value: 'target_date', label: 'Target date' },
  { value: 'progress', label: 'Progress' },
  { value: 'priority', label: 'Priority' },
];

const PRIORITY_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };

function sortProjects(projects, sortBy) {
  const arr = [...projects];
  switch (sortBy) {
    case 'target_date':
      arr.sort((a, b) => {
        if (!a.target_date) return 1;
        if (!b.target_date) return -1;
        return a.target_date.localeCompare(b.target_date);
      });
      break;
    case 'progress':
      arr.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
      break;
    case 'priority':
      arr.sort((a, b) => (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0));
      break;
    default:
      arr.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }
  return arr;
}

export function ProjectTable({ projects, sortBy, onSortChange, onQuickStatus, onQuickProgress }) {
  const sorted = sortProjects(projects, sortBy);

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <label>
          Sort by:{' '}
          <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>
      <table className="project-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Progress</th>
            <th>Target</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id} className={isOverdue(p) ? 'row-overdue' : ''}>
              <td>
                <Link to={`/projects/${p.id}`} className="project-link">
                  {p.name}
                </Link>
                {isOverdue(p) && <span className="overdue-badge">Overdue</span>}
              </td>
              <td>
                {onQuickStatus ? (
                  <select
                    value={p.status}
                    onChange={(e) => onQuickStatus(p, e.target.value)}
                    className="inline-select"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  <StatusBadge status={p.status} />
                )}
              </td>
              <td>{p.priority}</td>
              <td>
                {onQuickProgress ? (
                  <div className="quick-progress">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={p.progress ?? 0}
                      onChange={(e) => onQuickProgress(p, parseInt(e.target.value, 10))}
                    />
                    <span>{p.progress ?? 0}%</span>
                  </div>
                ) : (
                  <ProgressBar value={p.progress} />
                )}
              </td>
              <td>{p.target_date ? new Date(p.target_date).toLocaleDateString() : '—'}</td>
              <td>
                {(p.tags || []).length > 0 ? (
                  <span className="tags-list">{(p.tags || []).join(', ')}</span>
                ) : (
                  '—'
                )}
              </td>
              <td>
                <Link to={`/projects/${p.id}`} className="btn btn-sm btn-primary">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="empty-state">No projects match your filters.</p>
      )}
    </div>
  );
}
