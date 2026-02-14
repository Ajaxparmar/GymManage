
import React, { useState } from 'react';
import { useApp } from '../app/store';
import { PaymentMethod } from '@/types/types';
import { Receipt, CreditCard, Search, DollarSign, ArrowUpRight } from 'lucide-react';
import { notifyPaymentReceived } from '@/services/whatsapp';

const FeeManagement: React.FC = () => {
  const { currentUser, students, payments, addPayment, plans } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    amountPaid: 0,
    pendingAmount: 0,
    paymentMethod: PaymentMethod.CASH,
  });

  const gymStudents = students.filter(s => s.gymId === currentUser?.gymId);
  const gymPayments = payments.filter(p => p.gymId === currentUser?.gymId);

  const filteredPayments = gymPayments.filter(p => {
    const student = students.find(s => s.id === p.studentId);
    return student?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.gymId) return;

    const student = students.find(s => s.id === formData.studentId);
    if (!student) return;

    const newPayment = {
      ...formData,
      gymId: currentUser.gymId,
      paymentDate: new Date().toISOString(),
      planId: student.planId,
    };

    addPayment(newPayment);
    
    // WhatsApp Confirmation
    notifyPaymentReceived(student.fullName, student.mobileNumber, formData.amountPaid, formData.pendingAmount);

    setIsModalOpen(false);
    setFormData({ studentId: '', amountPaid: 0, pendingAmount: 0, paymentMethod: PaymentMethod.CASH });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Payments</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by student..."
                className="w-full pl-9 pr-4 py-1.5 text-sm border rounded-lg outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredPayments.map(p => {
                  const s = students.find(st => st.id === p.studentId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-700">{s?.fullName}</td>
                      <td className="px-4 py-4 font-bold text-emerald-600">₹{p.amountPaid}</td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold uppercase">{p.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <span className={`font-bold ${p.pendingAmount > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                          ₹{p.pendingAmount}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPayments.length === 0 && (
              <div className="py-20 text-center text-slate-400">No payment records found</div>
            )}
          </div>
        </div>

        <div className="bg-blue-600 rounded-2xl p-8 text-white flex flex-col justify-between shadow-xl shadow-blue-500/20">
           <div>
             <Receipt className="mb-4 opacity-50" size={32} />
             <h3 className="text-2xl font-bold mb-2">Collect Payment</h3>
             <p className="text-blue-100 text-sm mb-8">Efficiently record fees and keep your gym finances healthy.</p>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
           >
             <DollarSign size={20} /> New Record
           </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard /></div>
              <h3 className="text-xl font-bold">Record Payment</h3>
            </div>
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Student</label>
                <select required className="w-full px-4 py-2 border rounded-xl outline-none" 
                  value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                  <option value="">Select Student</option>
                  {gymStudents.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.mobileNumber})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount Paid (₹)</label>
                  <input required type="number" className="w-full px-4 py-2 border rounded-xl outline-none" 
                    value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Pending (₹)</label>
                  <input required type="number" className="w-full px-4 py-2 border rounded-xl outline-none" 
                    value={formData.pendingAmount} onChange={e => setFormData({...formData, pendingAmount: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(PaymentMethod).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: method})}
                      className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${formData.paymentMethod === method ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-500 hover:border-blue-300'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
