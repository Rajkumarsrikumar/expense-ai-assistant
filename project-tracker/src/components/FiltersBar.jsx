import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../api/projects';

export function FiltersBar({ filters, onFiltersChange, tags }) {
  const { search, status, priority, tag, overdue } = filters;

  return (
    <div className="filters-bar">
      <input
        type="search"
        placeholder="Search projects..."
        value={search || ''}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        className="filter-search"
      />
      <select
        value={status || ''}
        onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || null })}
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        value={priority || ''}
        onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value || null })}
      >
        <option value="">All priorities</option>
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <select
        value={tag || ''}
        onChange={(e) => onFiltersChange({ ...filters, tag: e.target.value || null })}
      >
        <option value="">All tags</option>
        {(tags || []).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <label className="filter-checkbox">
        <input
          type="checkbox"
          checked={!!overdue}
          onChange={(e) => onFiltersChange({ ...filters, overdue: e.target.checked })}
        />
        Overdue only
      </label>
    </div>
  );
}
