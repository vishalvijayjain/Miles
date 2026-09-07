import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  TrendingUp,
  X,
  ChevronRight,
  Flame,
  Compass,
  PartyPopper,
  Move,
} from 'lucide-react';
import {
  Position,
  getSafeAreaInsets,
  getProtectedZones,
  findNearestValidPosition,
  getOptimalPopoverPlacement,
  getUsableViewport,
} from '../../utils/collisionAvoidance';

const STORAGE_KEY = 'miles_progress_widget_pos_v2';
const DRAG_THRESHOLD = 6; // Pixels moved before considering a gesture a drag instead of a tap

export const FloatingProgressWidget: React.FC = () => {
  const { stats, setActiveTab, lastCelebratedAt, celebrateProgress } = useApp();

  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showCelebrationBurst, setShowCelebrationBurst] = useState(false);
  const [justLeveledUp, setJustLeveledUp] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Drag tracking refs
  const dragStartPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const isPointerDownRef = useRef<boolean>(false);

  // Measure widget dimensions
  const getWidgetDimensions = useCallback(() => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      return {
        width: rect.width || 116,
        height: rect.height || 44,
      };
    }
    return { width: 116, height: 44 };
  }, []);

  // Compute a clean initial default position (top right, below header, safe from edges)
  const getDefaultPosition = useCallback((): Position => {
    if (typeof window === 'undefined') return { x: 20, y: 80 };
    const insets = getSafeAreaInsets();
    const { width: w, height: h } = getWidgetDimensions();
    const header = document.querySelector('header');
    const headerBottom = header ? header.getBoundingClientRect().bottom : insets.top + 60;

    const x = Math.max(12, window.innerWidth - insets.right - w - 16);
    const y = Math.max(headerBottom + 12, insets.top + 72);

    const zones = getProtectedZones();
    const result = findNearestValidPosition({ x, y }, w, h, zones, insets);
    return result.position;
  }, [getWidgetDimensions]);

  // Initialize position from sessionStorage or default
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let initialPos: Position | null = null;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          initialPos = parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }

    const { width: w, height: h } = getWidgetDimensions();
    const insets = getSafeAreaInsets();
    const zones = getProtectedZones();

    if (initialPos) {
      // Validate saved position against current collision zones and viewport
      const valid = findNearestValidPosition(initialPos, w, h, zones, insets);
      setPosition(valid.position);
    } else {
      const defaultPos = getDefaultPosition();
      setPosition(defaultPos);
    }
  }, [getDefaultPosition, getWidgetDimensions]);

  // Re-validate and adapt position on viewport resize or orientation change
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setPosition((prev) => {
          if (!prev) return getDefaultPosition();
          const { width: w, height: h } = getWidgetDimensions();
          const insets = getSafeAreaInsets();
          const zones = getProtectedZones();
          const res = findNearestValidPosition(prev, w, h, zones, insets);
          return res.position;
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [getDefaultPosition, getWidgetDimensions]);

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

  // Outside click & Escape key to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        widgetRef.current &&
        !widgetRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Pointer Handlers for seamless touch & mouse dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Prevent default scrolling on mobile touch
    isPointerDownRef.current = true;
    hasMovedRef.current = false;

    dragStartPointerRef.current = { x: e.clientX, y: e.clientY };
    const currentX = position ? position.x : 0;
    const currentY = position ? position.y : 0;
    dragStartPosRef.current = { x: currentX, y: currentY };

    // Capture pointer events
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if unsupported
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const deltaX = e.clientX - dragStartPointerRef.current.x;
    const deltaY = e.clientY - dragStartPointerRef.current.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (!hasMovedRef.current && distance >= DRAG_THRESHOLD) {
      hasMovedRef.current = true;
      setIsDragging(true);
      setIsCorrecting(false);
    }

    if (hasMovedRef.current) {
      const { width: w, height: h } = getWidgetDimensions();
      const insets = getSafeAreaInsets();
      const { minX, maxX, minY, maxY } = getUsableViewport(w, h, insets, 4);

      // Free 1:1 tracking clamped strictly inside usable viewport bounds
      const rawX = dragStartPosRef.current.x + deltaX;
      const rawY = dragStartPosRef.current.y + deltaY;

      const clampedX = Math.max(minX, Math.min(maxX, rawX));
      const clampedY = Math.max(minY, Math.min(maxY, rawY));

      setPosition({ x: clampedX, y: clampedY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    if (!hasMovedRef.current) {
      // Pure Tap: toggle/open the frosted focus popover
      setIsDragging(false);
      setIsOpen((prev) => !prev);
      return;
    }

    // Finished dragging: execute intelligent collision avoidance
    setIsDragging(false);

    if (position) {
      const { width: w, height: h } = getWidgetDimensions();
      const insets = getSafeAreaInsets();
      const zones = getProtectedZones();

      const resolved = findNearestValidPosition(position, w, h, zones, insets);

      if (resolved.hadCollision) {
        setIsCorrecting(true);
        setPosition(resolved.position);
        setTimeout(() => setIsCorrecting(false), 260);
      } else {
        setPosition(resolved.position);
      }

      // Persist chosen valid position for session
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(resolved.position));
      } catch {
        // Storage failover
      }
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    if (position) {
      const { width: w, height: h } = getWidgetDimensions();
      const insets = getSafeAreaInsets();
      const zones = getProtectedZones();
      const resolved = findNearestValidPosition(position, w, h, zones, insets);
      setPosition(resolved.position);
    }
  };

  // Progress metrics calculation
  const percentage = stats.completionRate;
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getMotivationalPhrase = () => {
    if (percentage === 100) return 'Everything achieved! You are a powerhouse.';
    if (percentage >= 75) return 'Crushing it! The finish line is in sight.';
    if (percentage >= 50) return 'Over halfway there. Excellent momentum!';
    if (percentage >= 25) return 'Great progress! Steady stride forward.';
    if (percentage > 0) return 'Underway! Every step counts.';
    return 'Ready to roll. Start your first milestone!';
  };

  // Compute optimal popover placement when focused
  const popoverDimensions = {
    width: typeof window !== 'undefined' ? Math.min(340, window.innerWidth - 24) : 320,
    height: 380,
  };

  const insets = typeof window !== 'undefined' ? getSafeAreaInsets() : { top: 0, right: 0, bottom: 0, left: 0 };
  const widgetDims = getWidgetDimensions();

  const popoverPlacement = position
    ? getOptimalPopoverPlacement(
        position,
        widgetDims.width,
        widgetDims.height,
        popoverDimensions.width,
        popoverDimensions.height,
        insets
      )
    : { left: 16, top: 90, placement: 'below' as const };

  return (
    <>
      {/* 1. Frosted Focus Backdrop: Dim and blur the dashboard when widget is focused */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 2. Draggable Progress Widget Container */}
      {position && (
        <div
          ref={widgetRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            touchAction: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
          className={`fixed top-0 left-0 select-none print:hidden cursor-grab active:cursor-grabbing ${
            isOpen ? 'z-50' : 'z-35'
          } ${
            isCorrecting ? 'transition-transform duration-250 ease-out' : ''
          }`}
          title="Drag to reposition anywhere • Tap for details"
        >
          {/* Rewarding celebration toast bubble when progress advances */}
          {showCelebrationBurst && (
            <div className="absolute -top-9 right-0 bg-[#4A5D44] text-[#FDFBF7] dark:bg-[#8B9D83] dark:text-[#1A1E19] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce motion-reduce:animate-none pointer-events-none whitespace-nowrap z-10">
              <Sparkles className="w-3 h-3 text-[#D4A373] animate-spin motion-reduce:animate-none" />
              <span>Progress Advanced! +</span>
            </div>
          )}

          {/* Floating Pill: circular ring + percentage + subtle drag indicator */}
          <div
            className={`group relative flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-full bg-[#FDFBF7]/95 dark:bg-[#222821]/95 backdrop-blur-md border border-[#E8E2D9] dark:border-[#353E33] shadow-md transition-all duration-150 shrink-0 ${
              isDragging
                ? 'shadow-2xl scale-105 ring-2 ring-[#4A5D44] dark:ring-[#8B9D83] opacity-95'
                : isOpen
                ? 'ring-2 ring-[#4A5D44] dark:ring-[#8B9D83] shadow-xl'
                : 'hover:shadow-lg hover:border-[#8B9D83] dark:hover:border-[#8B9D83]'
            } ${
              justLeveledUp ? 'scale-105 ring-2 ring-[#4A5D44] dark:ring-[#8B9D83]' : ''
            }`}
          >
            {/* Circular Progress Ring */}
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 -rotate-90 transform" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3.5"
                  fill="transparent"
                  className="text-[#E8E2D9] dark:text-[#2E372D]"
                />
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
                  className="text-[#4A5D44] dark:text-[#8B9D83] transition-all duration-500 ease-out"
                />
              </svg>

              {/* Motivational Icon in center */}
              <div className="absolute inset-0 flex items-center justify-center text-[#4A5D44] dark:text-[#8B9D83]">
                {percentage >= 75 ? (
                  <Flame className="w-3 h-3 text-[#D4A373]" />
                ) : percentage >= 40 ? (
                  <Sparkles className="w-3 h-3 text-[#4A5D44] dark:text-[#8B9D83]" />
                ) : (
                  <Compass className="w-3 h-3 text-[#8C867E] dark:text-[#9DB095]" />
                )}
              </div>
            </div>

            {/* Text Percentage */}
            <div className="flex flex-col items-start leading-none shrink-0">
              <span className="text-xs sm:text-[13px] font-bold font-mono text-[#3D3D3D] dark:text-[#F1EFEA] whitespace-nowrap">
                {percentage}%
              </span>
              <span className="text-[9px] font-semibold text-[#8C867E] dark:text-[#9DB095] uppercase tracking-wider hidden xs:inline mt-0.5">
                Progress
              </span>
            </div>

            {/* Subtle drag handle glyph */}
            <div className="text-[#8C867E]/50 group-hover:text-[#8C867E] dark:text-[#9DB095]/50 transition-colors pl-0.5">
              <Move className="w-3 h-3" />
            </div>
          </div>
        </div>
      )}

      {/* 3. Popover Detail Card: Positioned strictly within the usable viewport */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label="Progress summary"
          data-protected-zone="dialog"
          style={{
            position: 'fixed',
            left: `${popoverPlacement.left}px`,
            top: `${popoverPlacement.top}px`,
            width: `${popoverDimensions.width}px`,
          }}
          className="z-50 rounded-[24px] bg-[#FDFBF7]/98 dark:bg-[#222821]/98 backdrop-blur-xl border border-[#E8E2D9] dark:border-[#353E33] shadow-2xl p-4 sm:p-5 animate-in fade-in zoom-in-95 duration-150 select-text max-h-[85vh] overflow-y-auto"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9] dark:border-[#2E372D]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#8B9D83]/20 text-[#4A5D44] dark:text-[#8B9D83] flex items-center justify-center shrink-0">
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
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close progress summary"
              className="text-[#8C867E] hover:text-[#3D3D3D] dark:text-[#9DB095] dark:hover:text-[#F1EFEA] p-1.5 rounded-lg hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Motivational phrase */}
          <div className="my-3 p-2.5 sm:p-3 rounded-2xl bg-[#F4EFEA]/80 dark:bg-[#1A1E19]/80 border border-[#E8E2D9]/70 dark:border-[#2E372D]">
            <p className="text-xs font-medium text-[#4A5D44] dark:text-[#A1B39D] leading-relaxed">
              "{getMotivationalPhrase()}"
            </p>
          </div>

          {/* Stats Grid - Milestones, In Motion, Queued */}
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
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('analysis');
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#4A5D44] text-[#FDFBF7] dark:bg-[#8B9D83] dark:text-[#1A1E19] hover:opacity-95 transition-opacity cursor-pointer shadow-xs min-h-[44px]"
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                View Full Analysis & Graphs
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                celebrateProgress();
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] bg-[#F4EFEA] dark:bg-[#1A1E19] hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] transition-colors cursor-pointer min-h-[40px]"
            >
              <PartyPopper className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Celebrate Today's Effort</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
