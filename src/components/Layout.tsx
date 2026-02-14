
// import React from 'react';
// import { useApp } from '../app/store';
// import { Role } from '@/type/types';  
// import { 
//   LayoutDashboard, 
//   Users, 
//   CreditCard, 
//   Settings, 
//   LogOut, 
//   UserCircle, 
//   Building2, 
//   ClipboardList,
//   ChevronRight,
//   ShieldCheck,
//   AlertTriangle
// } from 'lucide-react';

// interface LayoutProps {
//   children: React.ReactNode;
//   activeTab: string;
//   setActiveTab: (tab: string) => void;
// }

// const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
//   const { currentUser, logout, login, users } = useApp();

//   if (!currentUser) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
//         <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
//           <h1 className="text-2xl font-bold mb-6 text-center text-slate-800">IronCore Login</h1>
//           <div className="space-y-4">
//             {users.map(u => (
//               <button
//                 key={u.id}
//                 onClick={() => login(u.email)}
//                 className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
//               >
//                 <div className="text-left">
//                   <div className="font-semibold">{u.name}</div>
//                   <div className="text-xs text-slate-500 uppercase tracking-wider">{u.role.replace('_', ' ')}</div>
//                 </div>
//                 <ChevronRight size={18} className="text-slate-400" />
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.EMPLOYEE] },
//     { id: 'gyms', label: 'Gym Management', icon: Building2, roles: [Role.SUPER_ADMIN] },
//     { id: 'students', label: 'Students', icon: Users, roles: [Role.GYM_ADMIN, Role.EMPLOYEE] },
//     { id: 'overdue', label: 'Overdue Payments', icon: AlertTriangle, roles: [Role.GYM_ADMIN, Role.EMPLOYEE] },
//     { id: 'plans', label: 'Plans', icon: ClipboardList, roles: [Role.GYM_ADMIN] },
//     { id: 'fees', label: 'Fee Tracking', icon: CreditCard, roles: [Role.GYM_ADMIN, Role.EMPLOYEE] },
//   ];

//   const allowedItems = menuItems.filter(item => item.roles.includes(currentUser.role));

//   return (
//     <div className="min-h-screen flex bg-slate-50">
//       {/* Sidebar */}
//       <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
//         <div className="p-6">
//           <div className="flex items-center gap-3 mb-8">
//             <div className="bg-blue-600 p-2 rounded-lg">
//               <ShieldCheck className="text-white" />
//             </div>
//             <h1 className="text-xl font-bold tracking-tight">IRONCORE</h1>
//           </div>
          
//           <nav className="space-y-1">
//             {allowedItems.map(item => (
//               <button
//                 key={item.id}
//                 onClick={() => setActiveTab(item.id)}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
//                   activeTab === item.id 
//                     ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
//                     : 'text-slate-400 hover:text-white hover:bg-slate-800'
//                 }`}
//               >
//                 <item.icon size={20} />
//                 <span className="font-medium">{item.label}</span>
//               </button>
//             ))}
//           </nav>
//         </div>

//         <div className="mt-auto p-6 border-t border-slate-800">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-blue-400 border border-slate-600">
//               <UserCircle size={24} />
//             </div>
//             <div className="overflow-hidden">
//               <p className="text-sm font-semibold truncate">{currentUser.name}</p>
//               <p className="text-[10px] text-slate-500 uppercase font-bold truncate">{currentUser.role.replace('_', ' ')}</p>
//             </div>
//           </div>
//           <button 
//             onClick={logout}
//             className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
//           >
//             <LogOut size={20} />
//             <span className="font-medium">Sign Out</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 ml-64 p-8">
//         <header className="flex justify-between items-center mb-8">
//           <div>
//             <h2 className="text-2xl font-bold text-slate-800">
//               {menuItems.find(i => i.id === activeTab)?.label}
//             </h2>
//             <p className="text-slate-500 text-sm">Welcome back to IronCore Management System.</p>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="bg-white border rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-slate-600">
//               <span className="w-2 h-2 rounded-full bg-green-500"></span>
//               System Live
//             </div>
//           </div>
//         </header>
        
//         <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Layout;


import React, { useState } from 'react';
import { useApp } from '../app/store';
import { Role } from '@/types/types';  
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  UserCircle, 
  Building2, 
  ClipboardList,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout, login, users } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-slate-800">IronCore Login</h1>
          <div className="space-y-4">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => login(u.email)}
                className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="text-left">
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">{u.role.replace('_', ' ')}</div>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.EMPLOYEE] },
    { id: 'gyms', label: 'Gym Management', icon: Building2, roles: [Role.SUPER_ADMIN] },
    { id: 'students', label: 'Students', icon: Users, roles: [Role.GYM_ADMIN, Role.EMPLOYEE] },
    { id: 'overdue', label: 'Overdue Payments', icon: AlertTriangle, roles: [Role.GYM_ADMIN, Role.EMPLOYEE] },
    { id: 'plans', label: 'Plans', icon: ClipboardList, roles: [Role.GYM_ADMIN] },
    { id: 'fees', label: 'Fee Tracking', icon: CreditCard, roles: [Role.GYM_ADMIN, Role.EMPLOYEE] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-slate-900 text-white flex flex-col fixed h-full z-50 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden text-slate-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">IRONCORE</h1>
          </div>
          
          <nav className="space-y-1">
            {allowedItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-blue-400 border border-slate-600">
              <UserCircle size={24} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold truncate">{currentUser.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-900"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded">
              <ShieldCheck className="text-white" size={18} />
            </div>
            <h1 className="text-lg font-bold text-slate-800">IRONCORE</h1>
          </div>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Welcome back to IronCore Management System.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white border rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="hidden sm:inline">System Live</span>
                <span className="sm:hidden">Live</span>
              </div>
            </div>
          </header>
          
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;