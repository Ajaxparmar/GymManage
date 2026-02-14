
import React, { useState } from 'react';
import { useApp } from '../app/store';
import { MembershipPlan, Student, PaymentMethod } from '@/types/types';
import { 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Smartphone, 
  MapPin, 
  Calendar, 
  XCircle, 
  Users, 
  LayoutGrid, 
  Table as TableIcon, 
  CreditCard,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { notifyStudentRegistration, notifyPaymentReceived } from '../services/whatsapp';

const StudentManagement: React.FC = () => {
  const { currentUser, students, plans, addStudent, addPayment, updateStudent, gyms, getStudentBalance, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    address: '',
    planId: '',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  const [paymentFormData, setPaymentFormData] = useState({
    amountPaid: 0,
    pendingAmount: 0,
    paymentMethod: PaymentMethod.CASH,
  });

  const filteredStudents = students
    .filter(s => s.gymId === currentUser?.gymId)
    .filter(s => 
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.mobileNumber.includes(searchQuery)
    );

  const gymPlans = plans.filter(p => p.gymId === currentUser?.gymId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.gymId) return;

    const selectedPlan = plans.find(p => p.id === formData.planId);
    if (!selectedPlan) {
      showToast("Error", "Please select a valid membership plan.", "error");
      return;
    }

    const expiryDate = new Date(formData.joiningDate);
    expiryDate.setMonth(expiryDate.getMonth() + selectedPlan.durationMonths);

    const newStudent = {
      ...formData,
      gymId: currentUser.gymId,
      photoUrl: `https://picsum.photos/seed/${Math.random()}/200/200`,
      planExpiryDate: expiryDate.toISOString(),
    };

    addStudent(newStudent);
    
    const gymName = gyms.find(g => g.id === currentUser.gymId)?.name || 'the Gym';
    notifyStudentRegistration(formData.fullName, formData.mobileNumber, gymName);

    setIsModalOpen(false);
    setFormData({ fullName: '', mobileNumber: '', address: '', planId: '', joiningDate: new Date().toISOString().split('T')[0] });
  };

  const handleOpenPayment = (student: Student) => {
    setSelectedStudent(student);
    const balance = getStudentBalance(student.id);
    setPaymentFormData({
      amountPaid: balance > 0 ? balance : 0,
      pendingAmount: 0,
      paymentMethod: PaymentMethod.CASH
    });
    setIsPaymentModalOpen(true);
  };

  const handleFeePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !currentUser?.gymId) return;

    addPayment({
      studentId: selectedStudent.id,
      gymId: currentUser.gymId,
      amountPaid: paymentFormData.amountPaid,
      pendingAmount: paymentFormData.pendingAmount,
      paymentMethod: paymentFormData.paymentMethod,
      paymentDate: new Date().toISOString(),
      planId: selectedStudent.planId
    });

    notifyPaymentReceived(
      selectedStudent.fullName, 
      selectedStudent.mobileNumber, 
      paymentFormData.amountPaid, 
      paymentFormData.pendingAmount
    );

    setIsPaymentModalOpen(false);
    setSelectedStudent(null);
  };

  const isExpired = (expiry: string) => new Date(expiry) < new Date();

  const ActionButtons = ({ student }: { student: Student }) => {
    const balance = getStudentBalance(student.id);
    return (
      <div className="flex gap-2">
        <button 
          onClick={() => handleOpenPayment(student)}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${
            balance > 0 
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          }`}
          title="Pay Fee"
        >
          <DollarSign size={14} />
          {balance > 0 ? 'Pay Fee' : 'Payment'}
        </button>
        <button className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
          <Edit3 size={16} />
        </button>
        <button className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-white border rounded-xl p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-slate-100 text-blue-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <TableIcon size={20} />
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold"
          >
            <UserPlus size={18} />
            <span>New Student</span>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map(student => {
            const expired = isExpired(student.planExpiryDate);
            const plan = plans.find(p => p.id === student.planId);
            const balance = getStudentBalance(student.id);
            return (
              <div key={student.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md hover:border-blue-500/50 transition-all group animate-in fade-in zoom-in-95 duration-300">
                <div className="h-28 bg-slate-900 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute -bottom-8 left-6">
                    <img src={student.photoUrl} className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover bg-white" alt={student.fullName} />
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${expired ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                      {expired ? 'Expired' : 'Active'}
                    </span>
                    {balance > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-600 border border-amber-200 shadow-sm flex items-center gap-1">
                        <AlertCircle size={10} /> Pending: ₹{balance}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6 pt-12">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-slate-800 leading-tight">{student.fullName}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{plan?.name || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-2.5 text-sm text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Smartphone size={16} />
                      </div>
                      <span className="font-medium text-slate-600">{student.mobileNumber}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Calendar size={16} />
                      </div>
                      <span className="font-medium text-slate-600">{new Date(student.planExpiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Balance</span>
                      <span className={`text-sm font-bold ${balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {balance > 0 ? `₹${balance}` : 'Clear'}
                      </span>
                    </div>
                    <ActionButtons student={student} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Membership</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Fee Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const balance = getStudentBalance(student.id);
                  const expired = isExpired(student.planExpiryDate);
                  const plan = plans.find(p => p.id === student.planId);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={student.photoUrl} className="w-10 h-10 rounded-xl object-cover shadow-sm bg-slate-100" />
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{student.fullName}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">ID: {student.id.substr(0, 5)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{plan?.name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {student.mobileNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-xs font-bold flex items-center gap-1.5 ${expired ? 'text-rose-500' : 'text-slate-600'}`}>
                          <Calendar size={14} className="opacity-50" />
                          {new Date(student.planExpiryDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {balance > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-rose-500 font-bold text-xs">₹{balance} Pending</span>
                            <span className="text-[10px] text-slate-300">Recent due</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs">
                            <CheckCircle2 size={14} />
                            Paid
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          <ActionButtons student={student} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredStudents.length === 0 && (
        <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Users className="text-slate-200" size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No students found</h3>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search filters or register a new student.</p>
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="bg-slate-50/80 p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Register Student</h3>
                <p className="text-sm text-slate-500 mt-1">Complete the details below to add a new member.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:rotate-90 transition-all duration-300">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 col-span-full">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input required type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/30" 
                    placeholder="Enter student's full name"
                    value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                  <input required type="tel" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/30" 
                    placeholder="91xxxxxxxxxx"
                    value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Joining Date</label>
                  <input required type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/30" 
                    value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} />
                </div>
                <div className="space-y-1 col-span-full">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Membership Plan</label>
                  <select required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/30 appearance-none cursor-pointer" 
                    value={formData.planId} onChange={e => setFormData({...formData, planId: e.target.value})}>
                    <option value="">Choose a plan</option>
                    {gymPlans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — ₹{p.price} ({p.durationMonths}m)</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 col-span-full">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                  <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/30 h-28 resize-none" 
                    placeholder="Residential address details..."
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Discard</button>
                <button type="submit" className="flex-2 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">Complete Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Payment Modal */}
      {isPaymentModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-50 p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Quick Payment</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{selectedStudent.fullName}</p>
                </div>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle /></button>
            </div>
            <form onSubmit={handleFeePayment} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount to Pay (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input required type="number" className="w-full pl-8 pr-4 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-2xl font-black text-slate-800" 
                    value={paymentFormData.amountPaid} onChange={e => setPaymentFormData({...paymentFormData, amountPaid: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining Balance (₹)</label>
                <input required type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none font-bold text-rose-500" 
                  value={paymentFormData.pendingAmount} onChange={e => setPaymentFormData({...paymentFormData, pendingAmount: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(PaymentMethod).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentFormData({...paymentFormData, paymentMethod: method})}
                      className={`py-3 px-4 border rounded-xl text-xs font-bold transition-all ${paymentFormData.paymentMethod === method ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 hover:border-slate-300'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-[0.98]">
                Submit Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
