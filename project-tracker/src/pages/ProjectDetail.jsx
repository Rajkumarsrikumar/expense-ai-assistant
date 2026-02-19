import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import {
  fetchProject,
  createProject,
  updateProject,
  deleteProject,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from '../api/projects';
import { fetchHistory, addHistoryEntry } from '../api/history';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [project, setProject] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({});

  const isNew = id === 'new';

  const loadData = async () => {
    if (!user?.id) return;
    if (isNew) {
      setProject({
        name: '',
        description: '',
        status: 'Not Started',
        priority: 'Medium',
        progress: 0,
        start_date: null,
        target_date: null,
        tags: [],
        owner_label: null,
      });
      setHistory([]);
      setEditForm({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const [projRes, histRes] = await Promise.all([
      fetchProject(user.id, id),
      fetchHistory(user.id, id),
    ]);
    if (projRes.error) {
      toast.error(projRes.error.message);
      navigate('/');
      return;
    }
    setProject(projRes.data);
    setEditForm(projRes.data);
    setHistory(histRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id, id]);

  const handleSaveField = async (field, value) => {
    if (!user?.id || isNew || !project) return;
    setSaving(true);
    const updates = { [field]: value };
    const { data, error } = await updateProject(user.id, project.id, updates);
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    setProject(data);
    setEditForm(data);

    // Create field_edit history (trigger handles status/progress)
    if (field !== 'status' && field !== 'progress') {
      const labels = {
        name: 'Name',
        description: 'Description',
        priority: 'Priority',
        start_date: 'Start date',
        target_date: 'Target date',
        tags: 'Tags',
        owner_label: 'Owner label',
      };
      const note = `${labels[field] || field} changed`;
      await addHistoryEntry(user.id, project.id, { type: 'field_edit', note });
      setHistory((prev) => [{ type: 'field_edit', note, timestamp: new Date().toISOString() }, ...prev]);
    } else {
      // Reload history to get trigger-inserted entries
      const { data: hist } = await fetchHistory(user.id, project.id);
      setHistory(hist);
    }
    toast.success('Saved');
    setSaving(false);
  };

  const handleCreate = async () => {
    if (!user?.id) return;
    const { projectSchema } = await import('../lib/validation');
    const parsed = projectSchema.safeParse({
      ...editForm,
      status: editForm.status || 'Not Started',
      priority: editForm.priority || 'Medium',
      progress: editForm.progress ?? 0,
    });
    if (!parsed.success) {
      const msg = parsed.error?.issues?.[0]?.message ?? parsed.error?.message ?? 'Validation failed';
      toast.error(msg);
      return;
    }
    setSaving(true);
    const { data, error } = await createProject(user.id, parsed.data);
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    toast.success('Project created');
    navigate(`/projects/${data.id}`);
    setSaving(false);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || !user?.id || !project?.id) return;
    const text = noteText.trim();
    const { data, error } = await addHistoryEntry(user.id, project.id, {
      type: 'note',
      note: text,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setNoteText('');
    if (data) setHistory((prev) => [data, ...prev]);
    toast.success('Note added');
  };

  const handleDelete = async () => {
    if (!user?.id || !project?.id) return;
    const { error } = await deleteProject(user.id, project.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Project deleted');
    navigate('/');
  };

  if (loading && !isNew) {
    return <div className="loading-state">Loading...</div>;
  }

  if (!project && !isNew) return null;

  return (
    <div className="page project-detail">
      <div className="page-header">
        <Link to="/" className="back-link">← Dashboard</Link>
      </div>

      {isNew ? (
        <div className="detail-card">
          <h1>New Project</h1>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Project name"
              />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={editForm.status || 'Not Started'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                value={editForm.priority || 'Medium'}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Progress</label>
              <input
                type="number"
                min="0"
                max="100"
                value={editForm.progress ?? 0}
                onChange={(e) => setEditForm({ ...editForm, progress: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Start date</label>
              <input
                type="date"
                value={editForm.start_date || ''}
                onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value || null })}
              />
            </div>
            <div className="form-group">
              <label>Target date</label>
              <input
                type="date"
                value={editForm.target_date || ''}
                onChange={(e) => setEditForm({ ...editForm, target_date: e.target.value || null })}
              />
            </div>
            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                value={(editForm.tags || []).join(', ')}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="tag1, tag2"
              />
            </div>
            <div className="form-group">
              <label>Owner label</label>
              <input
                value={editForm.owner_label || ''}
                onChange={(e) => setEditForm({ ...editForm, owner_label: e.target.value || null })}
                placeholder="Display owner"
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      ) : (
        <>
          <div className="detail-card">
            <h1>{project.name}</h1>
            <div className="detail-meta">
              <StatusBadge status={project.status} />
              <span>{project.priority} priority</span>
              <ProgressBar value={project.progress} />
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Name</label>
                <input
                  value={editForm.name || ''}
                  onBlur={(e) => {
                    if (editForm.name !== project.name) handleSaveField('name', e.target.value);
                  }}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={editForm.description || ''}
                  onBlur={(e) => {
                    if (editForm.description !== project.description) handleSaveField('description', e.target.value);
                  }}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editForm.status || 'Not Started'}
                  onChange={(e) => handleSaveField('status', e.target.value)}
                  disabled={saving}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={editForm.priority || 'Medium'}
                  onChange={(e) => handleSaveField('priority', e.target.value)}
                  disabled={saving}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Progress</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editForm.progress ?? 0}
                  onChange={(e) => handleSaveField('progress', parseInt(e.target.value, 10))}
                />
                <span>{editForm.progress ?? 0}%</span>
              </div>
              <div className="form-group">
                <label>Start date</label>
                <input
                  type="date"
                  value={editForm.start_date || ''}
                  onBlur={(e) => {
                    const v = e.target.value || null;
                    if (v !== (project.start_date || '')) handleSaveField('start_date', v);
                  }}
                  onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value || null })}
                />
              </div>
              <div className="form-group">
                <label>Target date</label>
                <input
                  type="date"
                  value={editForm.target_date || ''}
                  onBlur={(e) => {
                    const v = e.target.value || null;
                    if (v !== (project.target_date || '')) handleSaveField('target_date', v);
                  }}
                  onChange={(e) => setEditForm({ ...editForm, target_date: e.target.value || null })}
                />
              </div>
              <div className="form-group">
                <label>Tags</label>
                <input
                  value={(editForm.tags || []).join(', ')}
                  onBlur={(e) => {
                    const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                    if (JSON.stringify(tags) !== JSON.stringify(project.tags || [])) {
                      handleSaveField('tags', tags);
                    }
                  }}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="tag1, tag2"
                />
              </div>
              <div className="form-group">
                <label>Owner label</label>
                <input
                  value={editForm.owner_label || ''}
                  onBlur={(e) => {
                    const v = e.target.value || null;
                    if (v !== (project.owner_label || null)) handleSaveField('owner_label', v);
                  }}
                  onChange={(e) => setEditForm({ ...editForm, owner_label: e.target.value || null })}
                />
              </div>
            </div>

            <div className="detail-actions">
              <button className="btn btn-danger" onClick={() => setDeleteConfirm(true)}>
                Delete Project
              </button>
            </div>
          </div>

          <div className="detail-card history-section">
            <h2>Add note</h2>
            <form onSubmit={handleAddNote} className="note-form">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note to the timeline..."
                rows={2}
              />
              <button type="submit" className="btn btn-primary" disabled={!noteText.trim()}>
                Add note
              </button>
            </form>

            <h2>History timeline</h2>
            <div className="history-timeline">
              {history.map((h) => (
                <div key={h.id || h.timestamp} className="history-item">
                  <span className="history-time">
                    {new Date(h.timestamp).toLocaleString()}
                  </span>
                  <span className={`history-type type-${h.type}`}>{h.type}</span>
                  {h.type === 'status_change' && (
                    <span>{h.from_value} → {h.to_value}</span>
                  )}
                  {h.type === 'progress_update' && (
                    <span>{h.from_value}% → {h.to_value}%</span>
                  )}
                  {h.type === 'field_edit' && h.note && <span>{h.note}</span>}
                  {h.type === 'note' && h.note && <span>{h.note}</span>}
                </div>
              ))}
              {history.length === 0 && <p className="empty-state">No history yet.</p>}
            </div>
          </div>

          <ConfirmDialog
            open={deleteConfirm}
            title="Delete project"
            message="Are you sure you want to delete this project? This cannot be undone."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            danger
            onConfirm={handleDelete}
            onCancel={() => setDeleteConfirm(false)}
          />
        </>
      )}
    </div>
  );
}
