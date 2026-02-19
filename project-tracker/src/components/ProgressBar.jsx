export function ProgressBar({ value, max = 100, showLabel = true }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={max}>
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="progress-label">{pct}%</span>}
    </div>
  );
}
