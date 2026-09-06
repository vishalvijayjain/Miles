import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  KanbanSquare,
  TrendingUp,
  LayoutDashboard,
  ListTodo,
  Plus,
} from 'lucide-react';
import { AppTab } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsCreateTicketModalOpen } = useApp();

  const navItems: { tab: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'kanban', label: 'Kanban', icon: KanbanSquare },
    { tab: 'analysis', label: 'Progress', icon: TrendingUp },
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'list', label: 'Tickets', icon: ListTodo },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 dark:bg-[#1A1E19]/95 backdrop-blur-md border-t border-[#E8E2D9] dark:border-[#2E372D] px-2 py-1.5 flex items-center justify-around shadow-lg"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {navItems.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            type="button"
            onClick={() => setActiveTab(item.tab)}
            className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-[#4A5D44] dark:text-[#8B9D83] font-bold'
                : 'text-[#8C867E] dark:text-[#9DB095]'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-colors ${
                isActive ? 'bg-[#8B9D83]/20' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Central Quick Create Action Button (Min 48px touch target) */}
      <button
        type="button"
        onClick={() => setIsCreateTicketModalOpen(true)}
        aria-label="Create new ticket"
        className="min-h-[44px] min-w-[44px] -mt-3 w-12 h-12 rounded-full bg-[#4A5D44] text-[#FDFBF7] dark:bg-[#8B9D83] dark:text-[#1A1E19] flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer ring-4 ring-[#FDFBF7] dark:ring-[#1A1E19]"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {navItems.slice(2).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            type="button"
            onClick={() => setActiveTab(item.tab)}
            className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-[#4A5D44] dark:text-[#8B9D83] font-bold'
                : 'text-[#8C867E] dark:text-[#9DB095]'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-colors ${
                isActive ? 'bg-[#8B9D83]/20' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
