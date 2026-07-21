"use client";

import { useState, useTransition } from "react";
import { ExternalDashboard } from "@prisma/client";
import { createExternalDashboard, updateExternalDashboard, deleteExternalDashboard } from "@/app/actions/dashboards";
import { Plus, Edit2, Trash2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";

export default function DashboardAdminClient({ initialDashboards }: { initialDashboards: ExternalDashboard[] }) {
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    order: 0,
    isActive: true,
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", imageUrl: "", linkUrl: "", order: 0, isActive: true });
    setEditingId(null);
  };

  const openModal = (dashboard?: ExternalDashboard) => {
    if (dashboard) {
      setEditingId(dashboard.id);
      setFormData({
        title: dashboard.title,
        description: dashboard.description || "",
        imageUrl: dashboard.imageUrl || "",
        linkUrl: dashboard.linkUrl,
        order: dashboard.order,
        isActive: dashboard.isActive,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingId) {
        const res = await updateExternalDashboard(editingId, formData);
        if (res.success && res.data) {
          setDashboards(dashboards.map(d => d.id === editingId ? res.data : d).sort((a, b) => a.order - b.order));
        }
      } else {
        const res = await createExternalDashboard(formData);
        if (res.success && res.data) {
          setDashboards([...dashboards, res.data].sort((a, b) => a.order - b.order));
        }
      }
      setIsModalOpen(false);
      resetForm();
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this dashboard?")) {
      startTransition(async () => {
        const res = await deleteExternalDashboard(id);
        if (res.success) {
          setDashboards(dashboards.filter(d => d.id !== id));
        }
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">External Dashboards</h1>
          <p className="text-slate-500 mt-2">Manage the links shown on the public dashboards page.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-all"
        >
          <Plus className="w-5 h-5" /> Add New
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Order</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Dashboard</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
              <th className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dashboards.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">No dashboards configured yet.</td>
              </tr>
            ) : (
              dashboards.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-slate-500">{d.order}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      {d.imageUrl ? (
                        <img src={d.imageUrl} alt={d.title} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          {d.title}
                          <a href={d.linkUrl} target="_blank" rel="noreferrer" className="text-amber-500 hover:text-amber-600">
                            <LinkIcon className="w-4 h-4" />
                          </a>
                        </div>
                        <div className="text-sm text-slate-500 truncate max-w-sm">{d.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {d.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openModal(d)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors" disabled={isPending}>
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-2" disabled={isPending}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-xl shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-6">{editingId ? "Edit Dashboard" : "Add New Dashboard"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dashboard Link URL</label>
                <input required type="url" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" placeholder="https://" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                </div>
                <div className="flex-1 flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Is Active?</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={isPending} className="px-5 py-2.5 rounded-xl font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2">
                  {isPending ? "Saving..." : (editingId ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
