import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { fetchProjects, updateProject, isOverdue, STATUS_OPTIONS } from '../api/projects';
import { FiltersBar } from '../components/FiltersBar';
import { ProjectTable } from '../components/ProjectTable';

export function Dashboard() {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('updated_at');

  const loadProjects = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await fetchProjects(user.id, filters);
    if (error) toast.error(error.message);
    else setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, [user?.id, JSON.stringify(filters)]);

  const allTags = [...new Set(projects.flatMap((p) => p.tags || []))].sort();

  const summary = {
    total: projects.length,
    byStatus: STATUS_OPTIONS.reduce((acc, s) => {
      acc[s] = projects.filter((p) => p.status === s).length;
      return acc;
    }, {}),
    overdue: projects.filter((p) => isOverdue(p)).length,
  };

  const handleQuickStatus = async (project, newStatus) => {
    const { error } = await updateProject(user.id, project.id, { status: newStatus });
    if (error) toast.error(error.message);
    else {
      toast.success('Status updated');
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p)));
    }
  };

  const handleQuickProgress = async (project, newProgress) => {
    const { error } = await updateProject(user.id, project.id, { progress: newProgress });
    if (error) toast.error(error.message);
    else {
      toast.success('Progress updated');
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, progress: newProgress } : p)));
    }
  };

  return (
    <div className="page dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/projects/new" className="btn btn-primary">New Project</Link>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-value">{summary.total}</span>
          <span className="summary-label">Total</span>
        </div>
        {Object.entries(summary.byStatus).map(([status, count]) => (
          <div key={status} className="summary-card">
            <span className="summary-value">{count}</span>
            <span className="summary-label">{status}</span>
          </div>
        ))}
        <div className="summary-card summary-overdue">
          <span className="summary-value">{summary.overdue}</span>
          <span className="summary-label">Overdue</span>
        </div>
      </div>

      <FiltersBar filters={filters} onFiltersChange={setFilters} tags={allTags} />

      {loading ? (
        <div className="loading-state">Loading projects...</div>
      ) : (
        <ProjectTable
          projects={projects}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onQuickStatus={handleQuickStatus}
          onQuickProgress={handleQuickProgress}
        />
      )}
    </div>
  );
}
