import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { supabase } from '../lib/supabase';

export function Settings() {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [projectCount, setProjectCount] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const { data } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id);
      setProjectCount(data?.length ?? 0);
    };
    load();
  }, [user?.id]);

  const handleExport = async () => {
    if (!user?.id) return;
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id);

    const projectIds = (projects || []).map((p) => p.id);
    const { data: history } = projectIds.length
      ? await supabase
          .from('history_entries')
          .select('*')
          .eq('user_id', user.id)
          .in('project_id', projectIds)
      : { data: [] };

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      projects: projects || [],
      history_entries: history || [],
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export downloaded');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const projects = data.projects || [];
      const historyEntries = data.history_entries || [];

      const idMap = {};
      for (const p of projects) {
        const { id: oldId, created_at, updated_at, user_id: _uid, ...rest } = p;
        const { data: inserted, error: err1 } = await supabase.from('projects').insert({
          user_id: user.id,
          name: rest.name,
          description: rest.description,
          status: rest.status || 'Not Started',
          priority: rest.priority || 'Medium',
          progress: rest.progress ?? 0,
          start_date: rest.start_date || null,
          target_date: rest.target_date || null,
          tags: rest.tags || [],
          owner_label: rest.owner_label || null,
        }).select('id').single();
        if (err1) throw err1;
        if (oldId && inserted?.id) idMap[oldId] = inserted.id;
      }

      for (const h of historyEntries) {
        const newProjectId = idMap[h.project_id];
        if (!newProjectId) continue;
        await supabase.from('history_entries').insert({
          user_id: user.id,
          project_id: newProjectId,
          type: h.type,
          from_value: h.from_value,
          to_value: h.to_value,
          note: h.note,
        });
      }

      toast.success('Import completed');
      setProjectCount((c) => c + projects.length);
      e.target.value = '';
    } catch (err) {
      toast.error(err.message || 'Import failed');
    }
  };

  const handleSeedDemo = async () => {
    if (!user?.id) return;
    if (projectCount > 0) {
      toast.error('Seed only works when you have no projects. Delete existing projects first.');
      return;
    }

    const demos = [
      { name: 'Website Redesign', description: 'Modernize company website', status: 'In Progress', priority: 'High', progress: 45, tags: ['web', 'design'] },
      { name: 'API Migration', description: 'Migrate to new API v2', status: 'Not Started', priority: 'Critical', progress: 0, tags: ['backend', 'api'] },
      { name: 'Mobile App Beta', description: 'iOS and Android beta release', status: 'Blocked', priority: 'Medium', progress: 70, tags: ['mobile'] },
      { name: 'Q4 Report', description: 'Quarterly business report', status: 'Completed', priority: 'Low', progress: 100, tags: ['report'] },
      { name: 'Training Materials', description: 'Create onboarding docs', status: 'On Hold', priority: 'Low', progress: 20, tags: ['docs'] },
    ];

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    for (const d of demos) {
      const { data: proj, error: err1 } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: d.name,
          description: d.description,
          status: d.status,
          priority: d.priority,
          progress: d.progress,
          tags: d.tags,
          start_date: today.toISOString().split('T')[0],
          target_date: nextMonth.toISOString().split('T')[0],
        })
        .select('id')
        .single();
      if (err1) {
        toast.error(err1.message);
        return;
      }

      await supabase.from('history_entries').insert([
        { user_id: user.id, project_id: proj.id, type: 'note', note: `Project "${d.name}" created.` },
        { user_id: user.id, project_id: proj.id, type: 'status_change', from_value: 'Not Started', to_value: d.status },
        { user_id: user.id, project_id: proj.id, type: 'progress_update', from_value: '0', to_value: String(d.progress) },
      ]);
    }

    toast.success('Demo data seeded');
    setProjectCount(demos.length);
  };

  return (
    <div className="page settings-page">
      <h1>Settings</h1>
      <div className="detail-card">
        <h2>Export / Import</h2>
        <p className="settings-desc">Export your projects and history as JSON. Import to restore or merge data.</p>
        <div className="settings-actions">
          <button className="btn btn-primary" onClick={handleExport}>
            Export JSON
          </button>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
      </div>
      <div className="detail-card">
        <h2>Seed demo data</h2>
        <p className="settings-desc">Add 3–5 sample projects with history. Only available when you have no projects.</p>
        <button
          className="btn btn-secondary"
          onClick={handleSeedDemo}
          disabled={projectCount > 0}
        >
          Seed demo data
        </button>
        {projectCount > 0 && (
          <p className="settings-hint">You have {projectCount} project(s). Clear them to seed.</p>
        )}
      </div>
    </div>
  );
}
