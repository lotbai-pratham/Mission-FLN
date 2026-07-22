"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LotbConfig, LotbProject, LotbCohort } from '@/lib/lotb_config';
import { saveSettings } from '@/app/actions';
import { X, Save, Edit3, Image as ImageIcon, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LotbAdminClient({ initialConfig }: { initialConfig: LotbConfig }) {
  const router = useRouter();
  const [config, setConfig] = useState<LotbConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);

  // Drawer state
  const [activeItem, setActiveItem] = useState<{ type: 'project' | 'cohort', index: number } | null>(null);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await saveSettings({ lotb_config: JSON.stringify(config) });
      router.refresh();
      alert("LOTB Configuration saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditor = (type: 'project' | 'cohort', index: number) => {
    setActiveItem({ type, index });
  };

  const closeEditor = () => {
    setActiveItem(null);
  };

  // Extract currently edited item
  let editedProject: LotbProject | null = null;
  let editedCohort: LotbCohort | null = null;
  if (activeItem) {
    if (activeItem.type === 'project') editedProject = config.projects[activeItem.index];
    if (activeItem.type === 'cohort') editedCohort = config.msmsCohorts[activeItem.index];
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Top action bar */}
      <div className="flex justify-end sticky top-20 z-10">
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          <Save className="w-5 h-5" /> {isSaving ? "Saving..." : "Publish Changes"}
        </button>
      </div>

      {/* Projects Section */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Primary Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {config.projects.map((proj, idx) => (
            <div key={proj.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{proj.title}</h3>
                <button 
                  onClick={() => openEditor('project', idx)}
                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
              {proj.imageUrl ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-slate-100">
                  <img src={proj.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center text-slate-400 mb-4 border-2 border-dashed border-slate-300 dark:border-slate-600">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs font-bold uppercase">No Image</span>
                </div>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{proj.description}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase">{proj.links.length} Links</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MSMS Cohorts Section */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">MSMS Capacity Building Cohorts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {config.msmsCohorts.map((cohort, idx) => (
            <div key={cohort.id} className={cn(
              "bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-sm transition-opacity",
              cohort.status === 'inactive' ? "border-slate-200 dark:border-slate-700 opacity-60" : "border-orange-300 dark:border-orange-500/50"
            )}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{cohort.title}</h3>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mt-1",
                    cohort.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {cohort.status}
                  </span>
                </div>
                <button 
                  onClick={() => openEditor('cohort', idx)}
                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
              {cohort.imageUrl ? (
                <div className="h-32 w-full rounded-lg overflow-hidden mb-4 bg-slate-100">
                  <img src={cohort.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 w-full rounded-lg bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center text-slate-400 mb-4 border-2 border-dashed border-slate-300 dark:border-slate-600">
                  <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                  <span className="text-xs font-bold uppercase">No Image</span>
                </div>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{cohort.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editor Drawer */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeEditor} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300 border-l border-slate-200 dark:border-slate-800">
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Edit {activeItem.type === 'project' ? 'Project' : 'Cohort'}
              </h2>
              <button onClick={closeEditor} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeItem.type === 'project' && editedProject && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Project Title</label>
                    <input 
                      type="text" 
                      value={editedProject.title}
                      onChange={(e) => {
                        const newConfig = { ...config };
                        newConfig.projects[activeItem.index].title = e.target.value;
                        setConfig(newConfig);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Image URL</label>
                    <div className="flex gap-2">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {editedProject.imageUrl ? (
                          <img src={editedProject.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <input 
                        type="text" 
                        placeholder="/images/example.jpg or https://..."
                        value={editedProject.imageUrl}
                        onChange={(e) => {
                          const newConfig = { ...config };
                          newConfig.projects[activeItem.index].imageUrl = e.target.value;
                          setConfig(newConfig);
                        }}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea 
                      rows={5}
                      value={editedProject.description}
                      onChange={(e) => {
                        const newConfig = { ...config };
                        newConfig.projects[activeItem.index].description = e.target.value;
                        setConfig(newConfig);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dynamic Links</label>
                      <button 
                        onClick={() => {
                          const newConfig = { ...config };
                          newConfig.projects[activeItem.index].links.push({ label: "New Link", url: "#" });
                          setConfig(newConfig);
                        }}
                        className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Link
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {editedProject.links.map((link, linkIdx) => (
                        <div key={linkIdx} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex gap-3">
                          <div className="flex-1 space-y-2">
                            <input 
                              type="text" 
                              placeholder="Label (e.g. Visit Platform)"
                              value={link.label}
                              onChange={(e) => {
                                const newConfig = { ...config };
                                newConfig.projects[activeItem.index].links[linkIdx].label = e.target.value;
                                setConfig(newConfig);
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                              <input 
                                type="text" 
                                placeholder="URL (e.g. https://...)"
                                value={link.url}
                                onChange={(e) => {
                                  const newConfig = { ...config };
                                  newConfig.projects[activeItem.index].links[linkIdx].url = e.target.value;
                                  setConfig(newConfig);
                                }}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const newConfig = { ...config };
                              newConfig.projects[activeItem.index].links.splice(linkIdx, 1);
                              setConfig(newConfig);
                            }}
                            className="text-red-400 hover:text-red-500 p-2 self-start"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {editedProject.links.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4 italic">No links added.</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeItem.type === 'cohort' && editedCohort && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cohort Title</label>
                    <input 
                      type="text" 
                      value={editedCohort.title}
                      onChange={(e) => {
                        const newConfig = { ...config };
                        newConfig.msmsCohorts[activeItem.index].title = e.target.value;
                        setConfig(newConfig);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Image URL</label>
                    <div className="flex gap-2">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {editedCohort.imageUrl ? (
                          <img src={editedCohort.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <input 
                        type="text" 
                        placeholder="/images/example.jpg or https://..."
                        value={editedCohort.imageUrl}
                        onChange={(e) => {
                          const newConfig = { ...config };
                          newConfig.msmsCohorts[activeItem.index].imageUrl = e.target.value;
                          setConfig(newConfig);
                        }}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Engagement Description</label>
                    <textarea 
                      rows={5}
                      value={editedCohort.description}
                      onChange={(e) => {
                        const newConfig = { ...config };
                        newConfig.msmsCohorts[activeItem.index].description = e.target.value;
                        setConfig(newConfig);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label>
                      <select
                        value={editedCohort.status}
                        onChange={(e) => {
                          const newConfig = { ...config };
                          newConfig.msmsCohorts[activeItem.index].status = e.target.value as 'active' | 'inactive';
                          setConfig(newConfig);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Intervention Link</label>
                      <input 
                        type="text" 
                        placeholder="/pedagogy or #"
                        value={editedCohort.interventionUrl}
                        onChange={(e) => {
                          const newConfig = { ...config };
                          newConfig.msmsCohorts[activeItem.index].interventionUrl = e.target.value;
                          setConfig(newConfig);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button 
                onClick={closeEditor}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                Done Editing
              </button>
              <p className="text-center text-xs text-slate-500 mt-3">Changes are kept in memory until you click "Publish Changes" at the top.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
