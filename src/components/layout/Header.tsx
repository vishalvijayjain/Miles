import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import {
  KanbanSquare,
  LayoutDashboard,
  ListTodo,
  TrendingUp,
  Plus,
  Moon,
  Sun,
  ChevronDown,
  Users,
  Database,
  Trash2,
  Settings,
  Sparkles,
  Check,
} from 'lucide-react';
import { MAX_PROFILES } from '../../services/ProfileService';

export const Header: React.FC = () => {
  const {
    profiles,
    activeProfile,
    switchProfile,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    setIsCreateTicketModalOpen,
    setIsProfileModalOpen,
    loadDemoData,
    clearAllTickets,
    tickets,
    trashTickets,
    setIsTrashModalOpen,
    isLoading,
  } = useApp();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const dataMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (dataMenuRef.current && !dataMenuRef.current.contains(event.target as Node)) {
        setIsDataMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-[#1A1E19]/95 backdrop-blur-md border-b border-[#E8E2D9] dark:border-[#2E372D] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Left: Brand & Profile Switcher */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#4A5D44] text-[#FDFBF7] dark:bg-[#8B9D83] dark:text-[#1A1E19] flex items-center justify-center shadow-xs">
                <KanbanSquare className="w-5 h-5" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-base font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5] tracking-tight leading-tight">
                  MilesToGo
                </h1>
                <p className="text-[11px] text-[#8B9D83] dark:text-[#9DB095] font-medium">
                  Personal Work Tracker
                </p>
              </div>
            </div>

            {/* Profile / Workspace Selector Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] bg-[#F4EFEA]/90 dark:bg-[#232922]/90 hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer text-left max-w-[180px] sm:max-w-[220px]"
                aria-haspopup="true"
                aria-expanded={isProfileDropdownOpen}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: activeProfile?.color || '#4A5D44' }}
                />
                <span className="text-xs sm:text-sm font-semibold text-[#3D3D3D] dark:text-[#F1EFEA] truncate">
                  {activeProfile?.name || 'Workspace'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C867E] dark:text-[#8B9D83] shrink-0 ml-auto" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-[#FDFBF7] dark:bg-[#222821] border border-[#E8E2D9] dark:border-[#353E33] shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-[#E8E2D9]/80 dark:border-[#2E372D] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8C867E] dark:text-[#9DB095] uppercase tracking-wider">
                      Workspaces ({profiles.length}/{MAX_PROFILES})
                    </span>
                  </div>

                  <div className="py-1 max-h-56 overflow-y-auto">
                    {profiles.map((p) => {
                      const isSelected = p.id === activeProfile?.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            switchProfile(p.id);
                            setIsProfileDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#8B9D83]/15 text-[#4A5D44] font-semibold dark:text-[#8B9D83]'
                              : 'text-[#3D3D3D] dark:text-[#F1EFEA] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: p.color || '#4A5D44' }}
                            />
                            <span className="truncate">{p.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#4A5D44] dark:text-[#8B9D83] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#E8E2D9]/80 dark:border-[#2E372D] pt-1 mt-1 px-1">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#4A5D44] dark:text-[#8B9D83] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#8B9D83]" />
                      <span>Manage Workspaces...</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* View Navigation Tabs */}
            <nav className="hidden md:flex items-center bg-[#EFEAE2] dark:bg-[#242B23] p-1 rounded-xl border border-[#E8E2D9]/60 dark:border-[#2E372D]">
              <button
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'kanban'
                    ? 'bg-[#FDFBF7] dark:bg-[#2B332A] text-[#4A5D44] dark:text-[#F1EFEA] shadow-xs'
                    : 'text-[#766F66] dark:text-[#9DB095] hover:text-[#3D3D3D] dark:hover:text-[#F1EFEA]'
                }`}
              >
                <KanbanSquare className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#FDFBF7] dark:bg-[#2B332A] text-[#4A5D44] dark:text-[#F1EFEA] shadow-xs'
                    : 'text-[#766F66] dark:text-[#9DB095] hover:text-[#3D3D3D] dark:hover:text-[#F1EFEA]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'analysis'
                    ? 'bg-[#FDFBF7] dark:bg-[#2B332A] text-[#4A5D44] dark:text-[#F1EFEA] shadow-xs'
                    : 'text-[#766F66] dark:text-[#9DB095] hover:text-[#3D3D3D] dark:hover:text-[#F1EFEA]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#4A5D44] dark:text-[#8B9D83]" />
                <span>Progress & Analysis</span>
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-[#FDFBF7] dark:bg-[#2B332A] text-[#4A5D44] dark:text-[#F1EFEA] shadow-xs'
                    : 'text-[#766F66] dark:text-[#9DB095] hover:text-[#3D3D3D] dark:hover:text-[#F1EFEA]'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>All Tickets</span>
              </button>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Demo Data & Utilities Menu */}
            <div className="relative" ref={dataMenuRef}>
              <button
                type="button"
                onClick={() => setIsDataMenuOpen((prev) => !prev)}
                className="p-2 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] text-[#5A554E] dark:text-[#9DB095] bg-[#FDFBF7] dark:bg-[#222821] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
                title="Data & Demo options"
                aria-label="Data tools"
              >
                <Database className="w-4 h-4" />
              </button>

              {isDataMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-2xl bg-[#FDFBF7] dark:bg-[#222821] border border-[#E8E2D9] dark:border-[#353E33] shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-bold text-[#8C867E] dark:text-[#9DB095] uppercase tracking-wider">
                    Workspace Data
                  </div>
                  <button
                    onClick={() => {
                      loadDemoData();
                      setIsDataMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#3D3D3D] dark:text-[#F1EFEA] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] text-left transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4A373]" />
                    <div>
                      <div className="font-medium">Load Demo Data</div>
                      <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095]">Sample tasks, bugs & blockers</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Clear all tickets from this profile?')) {
                        clearAllTickets();
                      }
                      setIsDataMenuOpen(false);
                    }}
                    disabled={tickets.length === 0}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#B85D52] hover:bg-[#B85D52]/10 text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Clear All Tickets</div>
                      <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095]">Remove tickets in this profile</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] text-[#5A554E] dark:text-[#9DB095] bg-[#FDFBF7] dark:bg-[#222821] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-[#4A5D44]" /> : <Sun className="w-4 h-4 text-[#D4A373]" />}
            </button>

            {/* Recently Deleted / Trash Modal Button */}
            <button
              onClick={() => setIsTrashModalOpen(true)}
              className="relative p-2 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] text-[#5A554E] dark:text-[#9DB095] bg-[#FDFBF7] dark:bg-[#222821] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
              title="Recently Deleted (60-day recoverable trash)"
              aria-label="Trash"
            >
              <Trash2 className="w-4 h-4 text-[#B85D52]" />
              {trashTickets.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B85D52] text-white text-[10px] font-bold flex items-center justify-center">
                  {trashTickets.length}
                </span>
              )}
            </button>

            {/* Create Ticket CTA */}
            <Button
              onClick={() => setIsCreateTicketModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              size="sm"
              className="font-semibold shadow-xs text-xs sm:text-sm"
            >
              Create Ticket
            </Button>
          </div>
        </div>

        {/* Tablet / Medium Screens Navigation Tabs */}
        <div className="hidden sm:flex md:hidden items-center justify-around border-t border-[#E8E2D9]/80 dark:border-[#2E372D] py-2 bg-[#FDFBF7] dark:bg-[#1A1E19]">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'kanban'
                ? 'text-[#4A5D44] dark:text-[#8B9D83] bg-[#8B9D83]/15'
                : 'text-[#766F66] dark:text-[#9DB095]'
            }`}
          >
            <KanbanSquare className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'dashboard'
                ? 'text-[#4A5D44] dark:text-[#8B9D83] bg-[#8B9D83]/15'
                : 'text-[#766F66] dark:text-[#9DB095]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'analysis'
                ? 'text-[#4A5D44] dark:text-[#8B9D83] bg-[#8B9D83]/15'
                : 'text-[#766F66] dark:text-[#9DB095]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#4A5D44] dark:text-[#8B9D83]" />
            <span>Progress & Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'list'
                ? 'text-[#4A5D44] dark:text-[#8B9D83] bg-[#8B9D83]/15'
                : 'text-[#766F66] dark:text-[#9DB095]'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>All Tickets</span>
          </button>
        </div>
      </div>
    </header>
  );
};
