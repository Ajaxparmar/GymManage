import React, { useState } from 'react';
import { useApp } from '../app/store';
import { Role } from '@/types/types';
import { 
  Building2, 
  Plus, 
  MapPin, 
  UserCheck, 
  ShieldCheck, 
  Key, 
  User as UserIcon,
  CreditCard,
  Check,
  Gift,
  Mail,
  Phone
} from 'lucide-react';

interface PlanOption {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  isFree?: boolean;
  badge?: string;
}

const GymManagement: React.FC = () => {
  const { gyms, users, addGym, addUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null); // ← changed to single plan
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    mobile: '',
    email: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const availablePlans: PlanOption[] = [
    {
      id: 'free_trial',
      name: '2 Months Free Trial',
      duration: 60,
      price: 0,
      description: 'Perfect for new members to try out',
      isFree: true,
      badge: 'FREE'
    },
    {
      id: 'one_month',
      name: '1 Month',
      duration: 30,
      price: 1000,
      description: 'Monthly membership',
    },
    {
      id: 'three_months',
      name: '3 Months',
      duration: 90,
      price: 2700,
      description: 'Save 10% with quarterly plan',
      badge: 'SAVE 10%'
    },
    {
      id: 'six_months',
      name: '6 Months',
      duration: 180,
      price: 5000,
      description: 'Save 17% with half-yearly plan',
      badge: 'SAVE 17%'
    },
    {
      id: 'twelve_months',
      name: '12 Months',
      duration: 365,
      price: 9000,
      description: 'Best value - Save 25%',
      badge: 'BEST VALUE'
    }
  ];

  const selectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      setError('Please select one membership plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selected = availablePlans.find(p => p.id === selectedPlan);
      if (!selected) throw new Error("Selected plan not found");

      const plans = [{
        name: selected.name,
        duration: selected.duration,
        price: selected.price,
        description: selected.description,
        isDefault: selected.id !== 'free_trial'
      }];

      const response = await fetch('/api/enrollGym', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gym: {
            name: formData.name,
            location: formData.location,
            address: formData.address,
            mobile: formData.mobile,
            email: formData.email,
          },
          admin: {
            name: formData.adminName,
            email: formData.adminEmail,
            password: formData.adminPassword,
          },
          plans: plans
        }),
      });

      const data = await response.json();
      console.log('Gym creation response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create gym');
      }

      setIsModalOpen(false);
      setFormData({ 
        name: '', 
        location: '',
        address: '',
        mobile: '',
        email: '',
        adminName: '', 
        adminEmail: '', 
        adminPassword: '' 
      });
      setSelectedPlan(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Master Gym Directory</h3>
          <p className="text-sm text-slate-500">Manage all gym locations and memberships</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
        >
          <Plus size={18} /> Register New Gym
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms.map(gym => {
          const admin = users.find(u => u.id === gym.adminId);
          return (
            <div key={gym.id} className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <Building2 size={24} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  <ShieldCheck size={10} /> Active
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">{gym.name}</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={16} className="text-rose-400" />
                  {gym.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <UserCheck size={16} className="text-blue-400" />
                  Admin: {admin?.name || 'Unassigned'}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg">
                  <UserIcon size={12} />
                  <span>Login: {admin?.email}</span>
                </div>
              </div>
              <div className="pt-4 border-t flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">ID: {gym.id.slice(0, 8).toUpperCase()}</span>
                <button className="text-sm font-bold text-blue-600 hover:underline">View Reports</button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-800">New Gym Registration</h3>
              <p className="text-sm text-slate-500 mt-1">Set up a new gym location, admin credentials, and membership plan.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2">
                    <ShieldCheck className="text-red-500 mt-0.5" size={18} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Gym Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                    <Building2 size={14} />
                    Gym Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Gym Name *</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="e.g. IronCore Prime" 
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Location *</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="e.g. Manhattan, NY" 
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400" 
                        value={formData.location} 
                        onChange={e => setFormData({...formData, location: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                      <input 
                        type="text" 
                        placeholder="Full address" 
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400" 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Mobile</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="tel" 
                          placeholder="9876543210" 
                          className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400" 
                          value={formData.mobile} 
                          onChange={e => setFormData({...formData, mobile: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email" 
                          placeholder="gym@example.com" 
                          className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck size={14} />
                    Admin Account Credentials
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Admin Full Name *</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Admin Name" 
                        className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400" 
                        value={formData.adminName} 
                        onChange={e => setFormData({...formData, adminName: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Username / Email *</label>
                      <div className="relative">
                        <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          required 
                          type="email" 
                          placeholder="admin@gym.com" 
                          className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400" 
                          value={formData.adminEmail} 
                          onChange={e => setFormData({...formData, adminEmail: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Password *</label>
                      <div className="relative">
                        <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          required 
                          type="password" 
                          placeholder="••••••••" 
                          className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400" 
                          value={formData.adminPassword} 
                          onChange={e => setFormData({...formData, adminPassword: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Membership Plan - Single Selection */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
                    <CreditCard size={14} />
                    Membership Plan *
                  </div>
                  <p className="text-xs text-slate-500">Choose one plan to activate for this gym</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePlans.map(plan => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => selectPlan(plan.id)}
                        className={`relative p-4 border-2 rounded-xl transition-all text-left ${
                          selectedPlan === plan.id
                            ? plan.isFree 
                              ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200/50'
                              : 'border-blue-500 bg-blue-50 ring-2 ring-blue-200/50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {selectedPlan === plan.id && (
                          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                            plan.isFree ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}>
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                        
                        {plan.badge && (
                          <div className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded mb-2 ${
                            plan.isFree 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-amber-500 text-white'
                          }`}>
                            {plan.isFree && <Gift size={10} />}
                            {plan.badge}
                          </div>
                        )}
                        
                        <div className="font-bold text-slate-800 mb-1">{plan.name}</div>
                        <div className="text-xs text-slate-600 mb-2">{plan.description}</div>
                        <div className="flex items-baseline gap-1">
                          {plan.isFree ? (
                            <span className="text-lg font-black text-emerald-600">FREE</span>
                          ) : (
                            <>
                              <span className="text-xs text-slate-500">₹</span>
                              <span className="text-lg font-black text-slate-900">{plan.price.toLocaleString()}</span>
                              <span className="text-xs text-slate-500">/ {plan.duration} days</span>
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {selectedPlan && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                      1 plan selected
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t bg-slate-50 flex gap-3 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setError('');
                    setSelectedPlan(null);
                  }} 
                  className="flex-1 py-3 border rounded-xl font-semibold hover:bg-white transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Register Gym & Admin'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymManagement;