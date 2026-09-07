import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ProfileModal } from './components/layout/ProfileModal';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { DashboardView } from './components/dashboard/DashboardView';
import { TicketListView } from './components/tickets/TicketListView';
import { ProgressAnalysisView } from './components/analysis/ProgressAnalysisView';
import { FloatingProgressWidget } from './components/progress/FloatingProgressWidget';
import { TicketModal } from './components/tickets/TicketModal';
import { TrashModal } from './components/trash/TrashModal';
import { ToastContainer } from './components/common/Toast';
import { CloudSyncModal } from './components/layout/CloudSyncModal';
import { Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#8B9D83] animate-spin mb-3" />
        <p className="text-xs font-medium text-[#8C867E] dark:text-[#9DB095]">
          Loading workspace and tickets...
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
      {activeTab === 'kanban' && <KanbanBoard />}
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'analysis' && <ProgressAnalysisView />}
      {activeTab === 'list' && <TicketListView />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { isCloudSyncModalOpen, setIsCloudSyncModalOpen } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] dark:bg-[#1A1E19] text-[#3D3D3D] dark:text-[#F1EFEA] transition-colors duration-200 font-sans">
      <Header />
      <FloatingProgressWidget />
      <MainContent />
      <MobileBottomNav />
      <TicketModal />
      <TrashModal />
      <ProfileModal />
      <CloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

