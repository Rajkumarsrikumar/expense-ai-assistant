import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { getProfile, upsertProfile } from '../api/profiles';

export function Profile() {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [profile, setProfile] = useState({ full_name: '', role: '', timezone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const { data, error } = await getProfile(user.id);
      if (error) toast.error(error.message);
      else if (data) setProfile({
        full_name: data.full_name || '',
        role: data.role || '',
        timezone: data.timezone || '',
      });
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    const { error } = await upsertProfile(user.id, {
      full_name: profile.full_name || null,
      role: profile.role || null,
      timezone: profile.timezone || null,
    });
    if (error) toast.error(error.message);
    else toast.success('Profile saved');
    setSaving(false);
  };

  if (loading) return <div className="loading-state">Loading profile...</div>;

  return (
    <div className="page profile-page">
      <h1>My Details</h1>
      <div className="detail-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Your full name"
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              placeholder="e.g. Developer, PM"
            />
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <input
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              placeholder="e.g. UTC, America/New_York"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
