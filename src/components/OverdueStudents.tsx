
import React, { useState, useMemo } from 'react';
import { useApp } from '../app/store';
import { Student, PaymentMethod } from '@/types/types';
// Fixed missing ShieldCheck import
import { 
  AlertTriangle, 
  DollarSign, 
  Smartphone, 
  Clock, 
  CreditCard, 
  XCircle,
  Calendar,
  Search,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { notifyPaymentReceived, sendWhatsAppMessage } from '../services/whatsapp';

const OverdueStudents: React.FC = () => {
  const { students, payments, getStudentBalance, currentUser, addPayment, showToast } = useApp();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [paymentFormData, setPaymentFormData] = useState({
    amountPaid: 0,
    pendingAmount: 0,
    paymentMethod: PaymentMethod.CASH,
  });

  const overdueStudents = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return students.filter(student => {
      // Filter by gym
      if (currentUser?.gymId && student.gymId !== currentUser.gymId) return false;

      const balance = getStudentBalance(student.id);
      if (balance <= 0) return false;

      // Find last payment date
      const studentPayments = payments.filter(p => p.studentId === student.id);
      let lastActivityDate: Date;

      if (studentPayments.length > 0) {
        const sortedPayments = [...studentPayments].sort((a, b) => 
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
        lastActivityDate = new Date(sortedPayments[0].paymentDate);
      } else {
        // If no payment, use joining date
        lastActivityDate = new Date(student.joiningDate);
      }

      return lastActivityDate < sevenDaysAgo;
    }).filter(s => s.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [students, payments, currentUser, getStudentBalance, searchQuery]);

  const handleOpenPayment = (student: Student) => {
    setSelectedStudent(student);
    const balance = getStudentBalance(student.id);
    setPaymentFormData({
      amountPaid: balance,
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

  const handleSendReminder = async (student: Student) => {
    const balance = getStudentBalance(student.id);
    const msg = `Hi ${student.fullName}, this is a reminder from IronCore. You have a pending fee of ₹${balance} which is overdue for more than 7 days. Please settle your dues at the earliest. Thank you!`;
    const success = await sendWhatsAppMessage(student.mobileNumber, msg);
    if (success) {
      showToast("Reminder Sent", `WhatsApp notification sent to ${student.fullName}`, "success");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-rose-900">Overdue Fee Accounts</h3>
          <p className="text-rose-700/70 text-sm">
            List of students with pending balances who havent made a payment in over 7 days.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" size={16} />
          <input 
            type="text" 
            placeholder="Search defaulters..."
            className="w-full pl-9 pr-4 py-2 border border-rose-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {overdueStudents.map(student => {
          const balance = getStudentBalance(student.id);
          const studentPayments = payments.filter(p => p.studentId === student.id);
          const lastPayment = studentPayments.length > 0 
            ? new Date([...studentPayments].sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0].paymentDate)
            : new Date(student.joiningDate);
          
          const daysOverdue = Math.floor((new Date().getTime() - lastPayment.getTime()) / (1000 * 3600 * 24));

          return (
            <div key={student.id} className="bg-white rounded-2xl border-2 border-rose-50 shadow-sm hover:border-rose-200 transition-all p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-tighter transform rotate-45 translate-x-4 translate-y-2 w-20 text-center shadow-sm">
                Overdue
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <img src={student.photoUrl} className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border shadow-sm" alt={student.fullName} />
                <div>
                  <h4 className="font-bold text-slate-800">{student.fullName}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold">
                    <Clock size={12} />
                    {daysOverdue} days since last activity
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mobile</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Smartphone size={14} className="text-slate-300" />
                    {student.mobileNumber}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Pending</span>
                  <span className="font-black text-rose-600 text-lg">₹{balance}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-400">Last Payment</span>
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                    {lastPayment.toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => handleSendReminder(student)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-100 text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors"
                >
                  <MessageSquare size={14} />
                  WhatsApp
                </button>
                <button 
                  onClick={() => handleOpenPayment(student)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
                >
                  <DollarSign size={14} />
                  Pay Now
                </button>
              </div>
            </div>
          );
        })}

        {overdueStudents.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <ShieldCheck className="text-emerald-500" size={40} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Overdue Students</h3>
            <p className="text-slate-400 text-sm mt-1">Great job! All active members have made payments recently.</p>
          </div>
        )}
      </div>

      {/* Payment Modal Re-used from Student Management */}
      {isPaymentModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-50 p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Clear Overdue Fee</h3>
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
                Clear Dues
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverdueStudents;
