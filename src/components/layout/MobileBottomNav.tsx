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
      id="mobile-bottom-navigation"
      data-protected-zone="bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 dark:bg-[#1A1E19]/95 backdrop-blur-lg border-t border-[#E8E2D9] dark:border-[#2E372D] shadow-lg select-none print:hidden transition-colors"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="h-14 flex items-center justify-around max-w-md mx-auto px-2">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 h-full max-w-[76px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer select-none touch-manipulation ${
                isActive
                  ? 'text-[#4A5D44] dark:text-[#8B9D83] font-bold'
                  : 'text-[#8C867E] dark:text-[#9DB095] hover:text-[#3D3D3D] dark:hover:text-[#F1EFEA]'
              }`}
            >
              <div
                className={`relative px-2.5 py-1 rounded-xl transition-all duration-150 flex items-center justify-center ${
                  isActive
                    ? 'bg-[#4A5D44]/12 dark:bg-[#8B9D83]/20 shadow-2xs scale-105'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] tracking-tight leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Central Quick Create Action Button (Min 48px touch target, floating over bar) */}
        <div className="flex-1 max-w-[64px] flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsCreateTicketModalOpen(true)}
            aria-label="Create new ticket"
            className="-mt-5 w-12 h-12 rounded-full bg-[#4A5D44] text-[#FDFBF7] dark:bg-[#8B9D83] dark:text-[#1A1E19] flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer ring-4 ring-[#FDFBF7] dark:ring-[#1A1E19] touch-manipulation"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 h-full max-w-[76px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer select-none touch-manipulation ${
                isActive
                  ? 'text-[#4A5D44] dark:text-[#8B9D83] font-bold'
                  : 'text-[#8C867E] dark:text-[#9DB095] hover:text-[#3D3D3D] dark:hover:text-[#F1EFEA]'
              }`}
            >
              <div
                className={`relative px-2.5 py-1 rounded-xl transition-all duration-150 flex items-center justify-center ${
                  isActive
                    ? 'bg-[#4A5D44]/12 dark:bg-[#8B9D83]/20 shadow-2xs scale-105'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] tracking-tight leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
