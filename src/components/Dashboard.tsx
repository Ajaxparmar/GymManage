
import React from 'react';
import { useApp } from '../app/store';
import { Role } from '@/types/types';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

const Dashboard: React.FC = () => {
  const { currentUser, students, payments, gyms, plans } = useApp();

  // Filter context based on role
  const gymStudents = currentUser?.role === Role.SUPER_ADMIN ? students : students.filter(s => s.gymId === currentUser?.gymId);
  const gymPayments = currentUser?.role === Role.SUPER_ADMIN ? payments : payments.filter(p => p.gymId === currentUser?.gymId);

  const activeStudents = gymStudents.filter(s => s.status === 'ACTIVE').length;
  const expiredStudents = gymStudents.filter(s => s.status === 'EXPIRED').length;
  const totalRevenue = gymPayments.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalPending = gymPayments.reduce((acc, curr) => acc + curr.pendingAmount, 0);

  const stats = [
    { label: 'Total Students', value: gymStudents.length, icon: Users, color: 'blue', change: '+12%' },
    { label: 'Active Members', value: activeStudents, icon: TrendingUp, color: 'emerald', change: '+5%' },
    { label: 'Total Income (Monthly)', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'indigo', change: '+18%' },
    { label: 'Pending Fees', value: `₹${totalPending.toLocaleString()}`, icon: AlertCircle, color: 'rose', change: '-2%' },
  ];

  const incomeData = [
    { name: 'Jan', income: 45000 },
    { name: 'Feb', income: 52000 },
    { name: 'Mar', income: 48000 },
    { name: 'Apr', income: 61000 },
    { name: 'May', income: 55000 },
    { name: 'Jun', income: 67000 },
  ];

  const studentGrowthData = [
    { name: 'Week 1', students: 40 },
    { name: 'Week 2', students: 65 },
    { name: 'Week 3', students: 85 },
    { name: 'Week 4', students: 110 },
  ];

  const pieData = [
    { name: 'Active', value: activeStudents || 5 },
    { name: 'Expired', value: expiredStudents || 2 },
  ];
  const COLORS = ['#10b981', '#f43f5e'];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-rose-600 bg-rose-50'} px-2 py-1 rounded-full`}>
                {stat.change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Revenue Analysis</h3>
            <select className="text-sm border rounded-lg px-2 py-1 outline-none text-slate-500">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Status Pie */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Member Status</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">{activeStudents + expiredStudents}</span>
              <span className="text-xs text-slate-400">Total</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
             <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Active</div>
                <span className="font-semibold">{activeStudents}</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Expired</div>
                <span className="font-semibold">{expiredStudents}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Students</h3>
          <div className="space-y-4">
            {gymStudents.slice(0, 5).reverse().map((student, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={`https://picsum.photos/seed/${student.id}/40/40`} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <p className="text-sm font-semibold">{student.fullName}</p>
                    <p className="text-xs text-slate-400">{student.mobileNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                    {plans.find(p => p.id === student.planId)?.name || 'Custom Plan'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Joined: {new Date(student.joiningDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {gymStudents.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">No students yet</div>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Student Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
