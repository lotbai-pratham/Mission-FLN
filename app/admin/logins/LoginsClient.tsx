"use client";
import { useState, useTransition } from 'react';
import { generateSchoolLogins, updateLoginEmail, deleteSchoolLogins, createCustomLogin } from '@/app/actions';
import { Download, Loader2, Users, Zap, School, CheckCircle, Pencil, X, Check, Trash2, Plus, Building, UserPlus, MapPin } from 'lucide-react';

type Credential = { id: string; po: string; school: string; email: string; password: string; role: string; locationLevel: string };

export default function LoginsClient({ initialCredentials, hierarchy }: { initialCredentials: Credential[], hierarchy: any[] }) {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const [search, setSearch] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Selection state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Custom Login Modal State
  const [showModal, setShowModal] = useState(false);
  const [customPrefix, setCustomPrefix] = useState('');
  const [customPassword, setCustomPassword] = useState('Pratham@2025');
  const [customRole, setCustomRole] = useState<'admin' | 'user' | 'division' | 'project_office'>('user');
  const [customLevel, setCustomLevel] = useState<'state' | 'division' | 'project_office' | 'school'>('state');
  const [customDivId, setCustomDivId] = useState('');
  const [customPOId, setCustomPOId] = useState('');
  const [customSchoolId, setCustomSchoolId] = useState('');
  const [customError, setCustomError] = useState('');
  const [creatingCustom, setCreatingCustom] = useState(false);

  const filtered = credentials.filter(c =>
    c.school.toLowerCase().includes(search.toLowerCase()) ||
    c.po.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const allFilteredSelected = filtered.length > 0 && filtered.every(c => selected.has(c.id));

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allFilteredSelected) {
      setSelected(prev => {
        const next = new Set(prev);
        filtered.forEach(c => next.delete(c.id));
        return next;
      });
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        filtered.forEach(c => next.add(c.id));
        return next;
      });
    }
  }

  async function deleteSelected() {
    const ids = [...selected];
    if (!ids.length) return;
    setDeleting(true);
    const res = await deleteSchoolLogins(ids);
    setCredentials(prev => prev.filter(c => !selected.has(c.id)));
    setSelected(new Set());
    setDeleting(false);
  }

  function generate() {
    startTransition(async () => {
      const res = await generateSchoolLogins();
      setResult(res);
      const r = await fetch('/api/admin/credentials');
      if (r.ok) setCredentials(await r.json());
    });
  }

  function downloadCSV() {
    const header = 'Level,Project Office,School Name,Login Email,Password,Role\n';
    const rows = credentials.map(c => `"${c.locationLevel}","${c.po}","${c.school}","${c.email}","${c.password}","${c.role}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logins-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function startEdit(c: Credential) {
    setEditingId(c.id);
    setEditEmail(c.email);
    setEditError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditEmail('');
    setEditError('');
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    setEditError('');
    const res = await updateLoginEmail(id, editEmail);
    if (res.error) { setEditError(res.error); setSavingId(null); return; }
    setCredentials(prev => prev.map(c => c.id === id ? { ...c, email: editEmail.trim().toLowerCase() } : c));
    setEditingId(null);
    setSavingId(null);
  }

  async function submitCustomLogin(e: React.FormEvent) {
    e.preventDefault();
    setCustomError('');
    if (!customPrefix) return setCustomError("Prefix required");

    let targetId = '';
    if (customLevel === 'division') {
      if (!customDivId) return setCustomError("Select a division");
      targetId = customDivId;
    } else if (customLevel === 'project_office') {
      if (!customPOId) return setCustomError("Select a Project Office");
      targetId = customPOId;
    } else if (customLevel === 'school') {
      if (!customSchoolId) return setCustomError("Select a School");
      targetId = customSchoolId;
    }

    setCreatingCustom(true);
    const email = `${customPrefix.toLowerCase()}@flnhub.in`;
    
    // Determine the exact role based on customLevel
    let dbRole = "user";
    if (customLevel === "state") dbRole = "admin";
    else if (customLevel === "division") dbRole = "division";
    else if (customLevel === "project_office") dbRole = "project_office";
    else dbRole = "user";

    const res = await createCustomLogin({
      email,
      password: customPassword,
      role: dbRole,
      level: customLevel,
      targetId
    });

    setCreatingCustom(false);
    if (res.error) {
      setCustomError(res.error);
    } else {
      setShowModal(false);
      setCustomPrefix('');
      // refresh UI
      const r = await fetch('/api/admin/credentials');
      if (r.ok) setCredentials(await r.json());
    }
  }

  // Dependent dropdown options
  const selectedDiv = hierarchy?.find(d => d.id === customDivId);
  const selectedPO = selectedDiv?.projectOffices.find((p: any) => p.id === customPOId);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500 relative">

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Access Management</h1>
          <p className="text-slate-500 mt-1">Manage bulk school credentials and custom hierarchical accounts.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
          <UserPlus className="w-4 h-4" /> Create Custom Login
        </button>
      </div>

      {/* Action cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white">Auto-Generate School Logins</p>
            <p className="text-sm text-slate-400 mt-0.5">Creates one account for every missing school automatically.</p>
          </div>
          <button onClick={generate} disabled={isPending}
            className="mt-auto flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-60">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isPending ? 'Generating...' : 'Run Generator'}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white">Export to CSV</p>
            <p className="text-sm text-slate-400 mt-0.5">Download all {credentials.length} accounts to share with your team.</p>
          </div>
          <button onClick={downloadCSV} disabled={credentials.length === 0}
            className="mt-auto flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-40">
            <Download className="w-4 h-4" /> Download Records
          </button>
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-6 py-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-green-700 dark:text-green-300 font-semibold">
            Done! Created <span className="font-extrabold">{result.created}</span> new logins, skipped <span className="font-extrabold">{result.skipped}</span> that already existed.
          </p>
        </div>
      )}

      {/* Credentials table */}
      {credentials.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Search + bulk delete bar */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <School className="w-4 h-4 text-slate-400 shrink-0" />
            <input type="text" placeholder="Search accounts..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
            <span className="text-xs text-slate-400 font-semibold shrink-0">{filtered.length} matching</span>

            {selected.size > 0 && (
              <button onClick={deleteSelected} disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-60 shrink-0">
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete {selected.size} selected
              </button>
            )}
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[auto_1.5fr_1.5fr_1fr_auto] bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-semibold uppercase tracking-wider px-6 py-3 border-b border-slate-100 dark:border-slate-800 gap-3">
            <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
            <span>Scope</span>
            <span>Login Email</span>
            <span>Role</span>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[480px] overflow-y-auto">
            {filtered.map((c) => (
              <div key={c.id}
                className={`grid grid-cols-[auto_1.5fr_1.5fr_1fr_auto] items-center px-6 py-3 transition-colors text-sm gap-3 ${selected.has(c.id) ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-slate-800 dark:text-slate-100 truncate">{c.locationLevel}</span>
                  <span className="text-xs text-slate-500 truncate">{c.po}</span>
                </div>

                {editingId === c.id ? (
                  <div className="flex flex-col gap-1">
                    <input autoFocus value={editEmail}
                      onChange={e => { setEditEmail(e.target.value); setEditError(''); }}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(c.id); if (e.key === 'Escape') cancelEdit(); }}
                      className="font-mono text-xs px-2 py-1 rounded-lg border border-blue-400 outline-none ring-2 ring-blue-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 w-full" />
                    {editError && <span className="text-red-500 text-xs">{editError}</span>}
                  </div>
                ) : (
                  <span className="text-blue-600 font-mono text-xs truncate">{c.email}</span>
                )}

                <span className="text-xs uppercase font-bold text-slate-400">{c.role}</span>

                <div className="flex items-center gap-1.5 justify-end">
                  {editingId === c.id ? (
                    <>
                      <button onClick={() => saveEdit(c.id)} disabled={savingId === c.id}
                        className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50">
                        {savingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={cancelEdit}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-6 py-10 text-center text-slate-400">No results found</div>
            )}
          </div>
        </div>
      )}

      {/* Custom Login Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Create Custom Login</h2>
            
            <form onSubmit={submitCustomLogin} className="space-y-5">
              
              {/* Email & Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Username Prefix</label>
                  <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 focus-within:ring-2 ring-blue-400 transition-all">
                    <input type="text" autoFocus value={customPrefix} onChange={e => setCustomPrefix(e.target.value.replace(/[^a-zA-Z0-9.\-_]/g, ''))}
                      className="w-full px-3 py-2 bg-transparent text-sm text-slate-800 dark:text-white outline-none" placeholder="e.g. josh.admin" />
                    <span className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-slate-500 text-sm">@flnhub.in</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                  <input type="text" value={customPassword} onChange={e => setCustomPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                </div>
              </div>

              {/* Hierarchy Scope */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Data Access Scope (Role)</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['state', 'division', 'project_office', 'school'] as const).map(lvl => (
                    <button key={lvl} type="button" onClick={() => { setCustomLevel(lvl); setCustomDivId(''); setCustomPOId(''); setCustomSchoolId(''); }}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${customLevel === lvl ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-800 dark:text-indigo-300' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>
                      {lvl === 'project_office' ? 'Project Office' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dependent Selects */}
              {customLevel !== 'state' && (
                <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  
                  {['division', 'project_office', 'school'].includes(customLevel) && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Select Division</label>
                      <select value={customDivId} onChange={e => { setCustomDivId(e.target.value); setCustomPOId(''); setCustomSchoolId(''); }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none">
                        <option value="">-- Choose Division --</option>
                        {hierarchy?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  )}

                  {['project_office', 'school'].includes(customLevel) && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Select Project Office</label>
                      <select value={customPOId} onChange={e => { setCustomPOId(e.target.value); setCustomSchoolId(''); }} disabled={!customDivId}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none disabled:opacity-50">
                        <option value="">-- Choose Project Office --</option>
                        {selectedDiv?.projectOffices.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  )}

                  {customLevel === 'school' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Select School</label>
                      <select value={customSchoolId} onChange={e => setCustomSchoolId(e.target.value)} disabled={!customPOId}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none disabled:opacity-50">
                        <option value="">-- Choose School --</option>
                        {selectedPO?.schools.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.udiseCode})</option>)}
                      </select>
                    </div>
                  )}

                </div>
              )}

              {customError && <p className="text-red-500 text-sm font-semibold">{customError}</p>}

              <button type="submit" disabled={creatingCustom}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all flex justify-center items-center gap-2">
                {creatingCustom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
