
"use client";
import React, { useState } from 'react';
import { AppProvider, useApp } from '@/app/store';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import GymManagement from '@/components/GymManagement';
import StudentManagement from '@/components/StudentManagement';
import PlanManagement from '@/components/PlanManagement';
import FeeManagement from '@/components/FeeManagement';
import OverdueStudents from '@/components/OverdueStudents';
import Toast from '@/components/Toast';

const Main: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { currentUser } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'gyms': return <GymManagement />;
      case 'students': return <StudentManagement />;
      case 'overdue': return <OverdueStudents />;
      case 'plans': return <PlanManagement />;
      case 'fees': return <FeeManagement />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
      <Toast />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

export default App;
