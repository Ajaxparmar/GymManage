
import React, { useState } from 'react';
import { useApp } from '../app/store';
import { Plus, Trash2, Clock, IndianRupee } from 'lucide-react';

const PlanManagement: React.FC = () => {
  const { currentUser, plans, addPlan, deletePlan } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    durationMonths: 1,
    price: 0,
    description: ''
  });

  const gymPlans = plans.filter(p => p.gymId === currentUser?.gymId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.gymId) return;
    addPlan({ ...formData, gymId: currentUser.gymId });
    setIsModalOpen(false);
    setFormData({ name: '', durationMonths: 1, price: 0, description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Gym Membership Plans</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Add New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {gymPlans.map(plan => (
          <div key={plan.id} className="bg-white p-6 rounded-2xl border shadow-sm relative group">
            <button 
              onClick={() => deletePlan(plan.id)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex flex-col h-full">
              <h4 className="text-lg font-bold text-slate-800 mb-2">{plan.name}</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={16} className="text-blue-500" />
                  <span>Duration: {plan.durationMonths} Months</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <IndianRupee size={16} className="text-emerald-500" />
                  <span className="text-xl font-bold text-slate-900">₹{plan.price}</span>
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-xs text-slate-400 italic">Created for {currentUser?.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Create New Plan</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Plan Name</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-xl outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Duration (Months)</label>
                  <input required type="number" min="1" className="w-full px-4 py-2 border rounded-xl outline-none" 
                    value={formData.durationMonths} onChange={e => setFormData({...formData, durationMonths: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Price (₹)</label>
                  <input required type="number" min="0" className="w-full px-4 py-2 border rounded-xl outline-none" 
                    value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;
