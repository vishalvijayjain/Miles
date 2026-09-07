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
  Database,
  Trash2,
  Settings,
  Sparkles,
  Check,
  Menu,
  X,
  Cloud,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';
import { MAX_PROFILES } from '../../services/ProfileService';
import { AppTab } from '../../types';

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
    syncStatus,
    setIsCloudSyncModalOpen,
  } = useApp();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const dataMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or touch
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setIsProfileDropdownOpen(false);
      }
      if (dataMenuRef.current && !dataMenuRef.current.contains(target)) {
        setIsDataMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        // Only close if not clicking the toggle button
        const isToggle = (target as HTMLElement).closest?.('[data-mobile-toggle="true"]');
        if (!isToggle) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close mobile menu on tab change or window resize to desktop
  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems: { tab: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'kanban', label: 'Kanban', icon: KanbanSquare },
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'analysis', label: 'Progress & Analysis', icon: TrendingUp },
    { tab: 'list', label: 'All Tickets', icon: ListTodo },
  ];

  return (
    <header
      id="app-header"
      data-protected-zone="header"
      className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-[#1A1E19]/95 backdrop-blur-md border-b border-[#E8E2D9] dark:border-[#2E372D] transition-colors"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4">
          
          {/* Left: Brand & Profile Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-1">
            {/* Logo */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#4A5D44] text-[#FDFBF7] dark:bg-[#8B9D83] dark:text-[#1A1E19] flex items-center justify-center shadow-xs">
                <KanbanSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm sm:text-base font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5] tracking-tight leading-none">
                  Miles
                </h1>
                <p className="text-[10px] text-[#8B9D83] dark:text-[#9DB095] font-medium leading-tight hidden sm:block mt-0.5">
                  Personal Work Tracker
                </p>
              </div>
            </div>

            {/* Profile / Workspace Selector Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                id="header-workspace-selector"
                data-protected-zone="header-workspace"
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] bg-[#F4EFEA]/90 dark:bg-[#232922]/90 hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer text-left min-w-[75px] max-w-[115px] xs:max-w-[145px] sm:max-w-[180px] md:max-w-[220px] touch-manipulation min-h-[36px]"
                aria-haspopup="true"
                aria-expanded={isProfileDropdownOpen}
              >
                <span
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: activeProfile?.color || '#4A5D44' }}
                />
                <span className="text-xs sm:text-sm font-semibold text-[#3D3D3D] dark:text-[#F1EFEA] truncate">
                  {activeProfile?.name || 'Workspace'}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8C867E] dark:text-[#8B9D83] shrink-0 ml-auto" />
              </button>

              {isProfileDropdownOpen && (
                <>
                  {/* Backdrop on mobile */}
                  <div
                    className="fixed inset-0 z-30 sm:hidden bg-black/20"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    onTouchStart={() => setIsProfileDropdownOpen(false)}
                  />
                  <div
                    data-protected-zone="workspace-dropdown"
                    className="absolute left-0 mt-1.5 w-60 sm:w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#FDFBF7] dark:bg-[#222821] border border-[#E8E2D9] dark:border-[#353E33] shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                  >
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
                </>
              )}
            </div>

            {/* Desktop & Tablet Navigation Tabs (Visible on screens >= 768px) */}
            <nav className="hidden md:flex items-center bg-[#EFEAE2] dark:bg-[#242B23] p-1 rounded-xl border border-[#E8E2D9]/60 dark:border-[#2E372D]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => handleSelectTab(item.tab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#FDFBF7] dark:bg-[#2B332A] text-[#4A5D44] dark:text-[#F1EFEA] shadow-xs'
                        : 'text-[#766F66] dark:text-[#9DB095] hover:text-[#3D3D3D] dark:hover:text-[#F1EFEA]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Cloud Sync Status Pill - Guaranteed visibility across all mobile viewports */}
            <button
              type="button"
              id="header-cloud-sync-btn"
              data-protected-zone="header-sync"
              onClick={() => setIsCloudSyncModalOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] bg-[#FDFBF7] dark:bg-[#222821] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer text-xs shrink-0 min-h-[36px] touch-manipulation"
              title="Cloud Database Sync & Device Pairing"
              aria-label={`Cloud database sync: ${syncStatus}`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-500 animate-pulse ring-2 ring-amber-500/20'
                    : 'bg-zinc-400'
                }`}
              />
              <span className="font-semibold text-xs text-[#5A554E] dark:text-[#9DB095] whitespace-nowrap">
                <span className="hidden xs:inline">{syncStatus === 'synced' ? 'Cloud Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}</span>
                <span className="xs:hidden">{syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing' : 'Offline'}</span>
              </span>
            </button>

            {/* Mobile Direct Theme Toggle - Fast 1-tap theme switch on mobile */}
            <button
              type="button"
              onClick={toggleTheme}
              className="md:hidden p-2 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] text-[#5A554E] dark:text-[#9DB095] bg-[#FDFBF7] dark:bg-[#222821] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0 touch-manipulation"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-[#4A5D44]" /> : <Sun className="w-4 h-4 text-[#D4A373]" />}
            </button>

            {/* Mobile Tools Menu Toggle */}
            <button
              type="button"
              id="header-nav-toggle"
              data-protected-zone="menu-toggle"
              data-mobile-toggle="true"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Workspace tools and settings"
              aria-expanded={isMobileMenuOpen}
              className="md:hidden relative p-2 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] text-[#4A5D44] dark:text-[#8B9D83] bg-[#FDFBF7] dark:bg-[#222821] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0 touch-manipulation"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
              {trashTickets.length > 0 && !isMobileMenuOpen && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#B85D52] ring-2 ring-[#FDFBF7] dark:ring-[#222821]" />
              )}
            </button>

            {/* Tablet & Desktop Actions (Hidden on Mobile < 768px) */}
            <div className="hidden md:flex items-center gap-2">
              {/* Demo Data Menu */}
              <div className="relative" ref={dataMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsDataMenuOpen((prev) => !prev)}
                  className="p-2 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] text-[#5A554E] dark:text-[#9DB095] bg-[#FDFBF7] dark:bg-[#222821] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                  title="Workspace Data Tools"
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

              {/* Theme Toggle on Tablet/Desktop */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] text-[#5A554E] dark:text-[#9DB095] bg-[#FDFBF7] dark:bg-[#222821] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-4 h-4 text-[#4A5D44]" /> : <Sun className="w-4 h-4 text-[#D4A373]" />}
              </button>

              {/* Trash Button */}
              <button
                onClick={() => setIsTrashModalOpen(true)}
                className="relative p-2 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] text-[#5A554E] dark:text-[#9DB095] bg-[#FDFBF7] dark:bg-[#222821] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Recently Deleted (60-day recoverable trash)"
              >
                <Trash2 className="w-4 h-4 text-[#B85D52]" />
                {trashTickets.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B85D52] text-white text-[10px] font-bold flex items-center justify-center">
                    {trashTickets.length}
                  </span>
                )}
              </button>

              {/* Create Ticket CTA - Visible on tablets and desktop */}
              <Button
                onClick={() => setIsCreateTicketModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                size="sm"
                className="font-semibold shadow-xs text-xs sm:text-sm px-3 py-1.5 shrink-0 min-h-[38px]"
              >
                Create Ticket
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Mobile Tools & Utilities Drawer with Backdrop */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
            onClick={() => setIsMobileMenuOpen(false)}
            onTouchStart={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={mobileMenuRef}
            data-protected-zone="menu"
            className="md:hidden absolute top-full right-2 left-2 xs:left-auto xs:right-3 xs:w-80 z-50 mt-1 rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-[#FDFBF7]/98 dark:bg-[#222821]/98 backdrop-blur-xl shadow-2xl p-3.5 animate-in fade-in zoom-in-95 duration-150 max-h-[82vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E8E2D9] dark:border-[#2E372D] mb-2.5">
              <span className="text-xs font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
                Workspace Tools & Utilities
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#8C867E] hover:text-[#3D3D3D] dark:text-[#9DB095] dark:hover:text-[#F1EFEA] p-1 rounded-lg cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCloudSyncModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#F4EFEA] dark:bg-[#1A1E19] text-[#4A5D44] dark:text-[#8B9D83] hover:bg-[#EFEAE2] transition-colors cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4" />
                  <div className="text-left">
                    <div>Pair Devices & Cloud Sync</div>
                    <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] font-normal">
                      Sync across iPhone, iPad & Mac
                    </div>
                  </div>
                </div>
                <Cloud className="w-3.5 h-3.5 text-[#8C867E] dark:text-[#9DB095]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsTrashModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#F4EFEA] dark:bg-[#1A1E19] text-[#B85D52] hover:bg-[#B85D52]/10 transition-colors cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4" />
                  <div className="text-left">
                    <div>Recoverable Trash</div>
                    <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] font-normal">
                      Restore deleted tickets within 60 days
                    </div>
                  </div>
                </div>
                {trashTickets.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#B85D52] text-white text-[10px] font-bold">
                    {trashTickets.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  loadDemoData();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#F4EFEA] dark:bg-[#1A1E19] text-[#D4A373] hover:bg-[#EFEAE2] transition-colors cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-[#3D3D3D] dark:text-[#F1EFEA]">Load Sample Demo Data</div>
                    <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] font-normal">
                      Add sample tickets, blockers & tags
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#F4EFEA] dark:bg-[#1A1E19] text-[#3D3D3D] dark:text-[#F1EFEA] hover:bg-[#EFEAE2] transition-colors cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-[#8C867E]" />
                  <div className="text-left">
                    <div>Manage Workspaces</div>
                    <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] font-normal">
                      Create, rename or color workspaces
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
