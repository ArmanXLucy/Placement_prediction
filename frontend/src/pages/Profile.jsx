import React, { useEffect, useMemo, useState } from 'react';
import { Check, Search, Save, UserRound } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import PageLoader from '../components/PageLoader';
import { useAuth } from '../context/AuthContext';

const BRANCHES = ['CSE', 'IT', 'AIML', 'DS', 'ECE', 'EEE', 'MECH', 'CIVIL'];

export default function Profile() {
  const { refreshUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [skillsMessage, setSkillsMessage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get('/students/me'), api.get('/skills')])
      .then(([profileData, skillData]) => {
        if (!mounted) return;
        setStudent(profileData.student);
        setForm({
          first_name: profileData.student.first_name || '',
          last_name: profileData.student.last_name || '',
          branch: profileData.student.branch || 'CSE',
          cgpa: profileData.student.cgpa ?? '',
          backlogs: profileData.student.backlogs ?? 0,
          projects_count: profileData.student.projects_count ?? 0,
          internships_count: profileData.student.internships_count ?? 0,
          certifications_count: profileData.student.certifications_count ?? 0,
          graduation_year: profileData.student.graduation_year ?? '',
          resume_url: profileData.student.resume_url || ''
        });
        const map = {};
        profileData.skills.forEach((skill) => {
          map[skill.id] = skill.proficiency;
        });
        setSelected(map);
        setCatalog(skillData.skills || []);
        setCategories(['All', ...(skillData.categories || [])]);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredSkills = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalog.filter((skill) => {
      const matchesCategory = category === 'All' || skill.category === category;
      const matchesSearch = !term || skill.name.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [catalog, category, search]);

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const toggleSkill = (skill) => {
    setSelected((current) => {
      const next = { ...current };
      if (next[skill.id]) delete next[skill.id];
      else next[skill.id] = 3;
      return next;
    });
  };

  const setProficiency = (skillId, value) => {
    setSelected((current) => ({ ...current, [skillId]: Number(value) }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const payload = {
        ...form,
        cgpa: form.cgpa === '' ? null : Number(form.cgpa),
        backlogs: Number(form.backlogs || 0),
        projects_count: Number(form.projects_count || 0),
        internships_count: Number(form.internships_count || 0),
        certifications_count: Number(form.certifications_count || 0),
        graduation_year: form.graduation_year === '' ? null : Number(form.graduation_year)
      };
      const data = await api.put('/students/me', payload);
      setStudent(data.student);
      setProfileMessage('Profile saved successfully.');
      await refreshUser().catch(() => {});
    } catch (err) {
      setProfileMessage(`Error: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const saveSkills = async () => {
    setSavingSkills(true);
    setSkillsMessage(null);
    try {
      const skills = Object.entries(selected).map(([skill_id, proficiency]) => ({
        skill_id: Number(skill_id),
        proficiency
      }));
      await api.put('/students/me/skills', { skills });
      setSkillsMessage(`${skills.length} skill${skills.length === 1 ? '' : 's'} saved.`);
      await refreshUser().catch(() => {});
    } catch (err) {
      setSkillsMessage(`Error: ${err.message}`);
    } finally {
      setSavingSkills(false);
    }
  };

  if (loading) return <PageLoader label="Loading your profile..." />;
  if (error) return <Alert type="error">{error}</Alert>;
  if (!form || !student) return null;

  const selectedCount = Object.keys(selected).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Profile & skills</h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep this up to date — it drives both predictions and job matching.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm">
          <UserRound size={16} className="text-indigo-600" />
          <span className="font-semibold text-slate-800">{selectedCount} skills selected</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={saveProfile} className="card p-6">
          <h2 className="text-base font-bold text-slate-900">Academic & experience details</h2>
          <p className="mt-1 text-sm text-slate-500">
            These values are used as features by the placement model.
          </p>

          <div className="mt-5 space-y-4">
            {profileMessage ? (
              <Alert type={profileMessage.startsWith('Error') ? 'error' : 'success'}>
                {profileMessage}
              </Alert>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="first_name">First name</label>
                <input id="first_name" className="input" value={form.first_name} onChange={setField('first_name')} required />
              </div>
              <div>
                <label className="label" htmlFor="last_name">Last name</label>
                <input id="last_name" className="input" value={form.last_name} onChange={setField('last_name')} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="branch">Branch</label>
                <select id="branch" className="input" value={form.branch} onChange={setField('branch')}>
                  {BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="graduation_year">Graduation year</label>
                <input id="graduation_year" type="number" min="2000" max="2100" className="input" value={form.graduation_year} onChange={setField('graduation_year')} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="cgpa">CGPA</label>
                <input id="cgpa" type="number" min="0" max="10" step="0.01" className="input" value={form.cgpa} onChange={setField('cgpa')} />
              </div>
              <div>
                <label className="label" htmlFor="backlogs">Active backlogs</label>
                <input id="backlogs" type="number" min="0" max="30" className="input" value={form.backlogs} onChange={setField('backlogs')} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="projects_count">Projects</label>
                <input id="projects_count" type="number" min="0" max="100" className="input" value={form.projects_count} onChange={setField('projects_count')} />
              </div>
              <div>
                <label className="label" htmlFor="internships_count">Internships</label>
                <input id="internships_count" type="number" min="0" max="100" className="input" value={form.internships_count} onChange={setField('internships_count')} />
              </div>
              <div>
                <label className="label" htmlFor="certifications_count">Certifications</label>
                <input id="certifications_count" type="number" min="0" max="100" className="input" value={form.certifications_count} onChange={setField('certifications_count')} />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="resume_url">Resume link (optional)</label>
              <input id="resume_url" type="url" className="input" placeholder="https://drive.google.com/..." value={form.resume_url} onChange={setField('resume_url')} />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-xs text-slate-500">
                Changes apply to future predictions and recommendations.
              </p>
              <button type="submit" className="btn-primary" disabled={savingProfile}>
                <Save size={16} /> {savingProfile ? 'Saving...' : 'Save details'}
              </button>
            </div>
          </div>
        </form>

        <div className="card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Technical skills</h2>
              <p className="mt-1 text-sm text-slate-500">
                Select skills and set your proficiency from 1 to 5.
              </p>
            </div>
            <button type="button" onClick={saveSkills} className="btn-primary shrink-0" disabled={savingSkills}>
              <Check size={16} /> {savingSkills ? 'Saving...' : 'Save skills'}
            </button>
          </div>

          {skillsMessage ? (
            <div className="mt-3">
              <Alert type={skillsMessage.startsWith('Error') ? 'error' : 'success'}>
                {skillsMessage}
              </Alert>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Search skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="input sm:w-40" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {filteredSkills.map((skill) => {
              const active = Boolean(selected[skill.id]);
              return (
                <div
                  key={skill.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition ${
                    active ? 'border-indigo-200 bg-indigo-50/60' : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {active ? <Check size={13} /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-800">{skill.name}</span>
                      <span className="block text-[11px] text-slate-400">{skill.category || 'General'}</span>
                    </span>
                  </button>

                  {active ? (
                    <select
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                      value={selected[skill.id]}
                      onChange={(e) => setProficiency(skill.id, e.target.value)}
                      aria-label={`Proficiency for ${skill.name}`}
                    >
                      {[1, 2, 3, 4, 5].map((level) => (
                        <option key={level} value={level}>Level {level}</option>
                      ))}
                    </select>
                  ) : null}
                </div>
              );
            })}
            {!filteredSkills.length ? (
              <p className="py-8 text-center text-sm text-slate-500">No skills match your search.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
