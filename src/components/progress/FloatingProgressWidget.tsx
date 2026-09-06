import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  TrendingUp,
  X,
  ChevronRight,
  Plus,
  Flame,
  CheckCircle2,
  Compass,
  PartyPopper,
} from 'lucide-react';

export const FloatingProgressWidget: React.FC = () => {
  const {
    stats,
    setActiveTab,
    setIsCreateTicketModalOpen,
    lastCelebratedAt,
    celebrateProgress,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [showCelebrationBurst, setShowCelebrationBurst] = useState(false);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Trigger celebration visual when progress advances
  useEffect(() => {
    if (lastCelebratedAt > 0) {
      setShowCelebrationBurst(true);
      setJustLeveledUp(true);
      const timer = setTimeout(() => {
        setShowCelebrationBurst(false);
        setJustLeveledUp(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [lastCelebratedAt]);

  // Outside click to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const percentage = stats.completionRate;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Encouraging motivational message
  const getMotivationalPhrase = () => {
    if (percentage === 100) return 'Everything achieved! You are a powerhouse.';
    if (percentage >= 75) return 'Crushing it! The finish line is in sight.';
    if (percentage >= 50) return 'Over halfway there. Excellent momentum!';
    if (percentage >= 25) return 'Great progress! Steady stride forward.';
    if (percentage > 0) return 'Underway! Every step counts.';
    return 'Ready to roll. Start your first milestone!';
  };

  return (
    <div
      ref={popoverRef}
      className="fixed top-20 right-3 sm:right-6 z-40 select-none print:hidden"
    >
      {/* Rewarding celebration toast bubble when progress increases */}
      {showCelebrationBurst && (
        <div className="absolute -top-9 right-0 bg-[#4A5D44] text-[#FDFBF7] dark:bg-[#8B9D83] dark:text-[#1A1E19] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce pointer-events-none whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-[#D4A373] animate-spin" />
          <span>Progress Advanced! +</span>
        </div>
      )}

      {/* Floating Toy Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View current progress detail"
        aria-expanded={isOpen}
        className={`group relative flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#FDFBF7]/95 dark:bg-[#222821]/95 backdrop-blur-md border border-[#E8E2D9] dark:border-[#353E33] shadow-md hover:shadow-lg hover:border-[#8B9D83] dark:hover:border-[#8B9D83] transition-all duration-200 cursor-pointer ${
          justLeveledUp ? 'scale-110 ring-2 ring-[#4A5D44] dark:ring-[#8B9D83]' : 'hover:scale-105 active:scale-95'
        }`}
      >
        {/* Circular Progress Ring */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 40 40">
            {/* Background circle */}
            <circle
              cx="20"
              cy="20"
              r={radius}
              stroke="currentColor"
              strokeWidth="3.5"
              fill="transparent"
              className="text-[#E8E2D9] dark:text-[#2E372D]"
            />
            {/* Animated progress stroke */}
            <circle
              cx="20"
              cy="20"
              r={radius}
              stroke="currentColor"
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-[#4A5D44] dark:text-[#8B9D83] transition-all duration-700 ease-out"
            />
          </svg>

          {/* Motivational Icon in center */}
          <div className="absolute inset-0 flex items-center justify-center text-[#4A5D44] dark:text-[#8B9D83] group-hover:rotate-12 transition-transform duration-300">
            {percentage >= 75 ? (
              <Flame className="w-3.5 h-3.5 text-[#D4A373] animate-pulse" />
            ) : percentage >= 40 ? (
              <Sparkles className="w-3.5 h-3.5 text-[#4A5D44] dark:text-[#8B9D83]" />
            ) : (
              <Compass className="w-3.5 h-3.5 text-[#8C867E] dark:text-[#9DB095]" />
            )}
          </div>
        </div>

        {/* Text Percentage */}
        <div className="flex flex-col items-start pr-0.5">
          <span className="text-[11px] font-bold font-mono text-[#3D3D3D] dark:text-[#F1EFEA] leading-tight">
            {percentage}%
          </span>
          <span className="text-[9px] font-semibold text-[#8C867E] dark:text-[#9DB095] uppercase tracking-wider hidden xs:inline">
            Progress
          </span>
        </div>
      </button>

      {/* Popover Detail Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-[24px] bg-[#FDFBF7] dark:bg-[#222821] border border-[#E8E2D9] dark:border-[#353E33] shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9] dark:border-[#2E372D]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#8B9D83]/20 text-[#4A5D44] dark:text-[#8B9D83] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
                  Active Momentum
                </h4>
                <p className="text-[10px] text-[#8C867E] dark:text-[#9DB095]">
                  Workspace progress tracker
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8C867E] hover:text-[#3D3D3D] dark:text-[#9DB095] dark:hover:text-[#F1EFEA] p-1 rounded-lg hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Motivational phrase */}
          <div className="my-3.5 p-3 rounded-2xl bg-[#F4EFEA]/80 dark:bg-[#1A1E19]/80 border border-[#E8E2D9]/70 dark:border-[#2E372D]">
            <p className="text-xs font-medium text-[#4A5D44] dark:text-[#A1B39D] leading-relaxed">
              "{getMotivationalPhrase()}"
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center my-3">
            <div className="p-2 rounded-xl bg-white dark:bg-[#1A1E19] border border-[#E8E2D9] dark:border-[#2E372D]">
              <div className="text-sm font-bold font-mono text-[#4A5D44] dark:text-[#8B9D83]">
                {stats.closed}
              </div>
              <div className="text-[9px] text-[#8C867E] dark:text-[#9DB095] font-semibold uppercase tracking-wider mt-0.5">
                Milestones
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-[#1A1E19] border border-[#E8E2D9] dark:border-[#2E372D]">
              <div className="text-sm font-bold font-mono text-[#D4A373]">
                {stats.inProgress}
              </div>
              <div className="text-[9px] text-[#8C867E] dark:text-[#9DB095] font-semibold uppercase tracking-wider mt-0.5">
                In Motion
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-[#1A1E19] border border-[#E8E2D9] dark:border-[#2E372D]">
              <div className="text-sm font-bold font-mono text-[#766F66] dark:text-[#9DB095]">
                {stats.todo}
              </div>
              <div className="text-[9px] text-[#8C867E] dark:text-[#9DB095] font-semibold uppercase tracking-wider mt-0.5">
                Queued
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setActiveTab('analysis');
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#4A5D44] text-[#FDFBF7] dark:bg-[#8B9D83] dark:text-[#1A1E19] hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                View Full Analysis & Graphs
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                celebrateProgress();
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] bg-[#F4EFEA] dark:bg-[#1A1E19] hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
            >
              <PartyPopper className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Celebrate Today's Effort</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
