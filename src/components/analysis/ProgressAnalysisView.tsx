import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Compass,
  ArrowUpRight,
  Flame,
  Layers,
  Clock,
  ChevronRight,
  Target,
  Sparkle,
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { Ticket } from '../../types';

type PresetRange = '7d' | '14d' | '30d' | '90d' | 'all';

export const ProgressAnalysisView: React.FC = () => {
  const { tickets, activeProfile, setSelectedTicket } = useApp();

  // Date range state default: last 30 days to today
  const [preset, setPreset] = useState<PresetRange>('30d');
  
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const defaultStartStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState<string>(defaultStartStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Quick preset selector handler
  const handlePresetSelect = (newPreset: PresetRange) => {
    setPreset(newPreset);
    const today = new Date();
    const endStr = today.toISOString().split('T')[0];
    setEndDate(endStr);

    if (newPreset === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
    } else if (newPreset === '14d') {
      const d = new Date();
      d.setDate(d.getDate() - 14);
      setStartDate(d.toISOString().split('T')[0]);
    } else if (newPreset === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
    } else if (newPreset === '90d') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      setStartDate(d.toISOString().split('T')[0]);
    } else if (newPreset === 'all') {
      // Find oldest ticket creation date or fallback 1 year
      if (tickets.length > 0) {
        const sorted = [...tickets].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
        const oldest = sorted[0]?.createdAt ? sorted[0].createdAt.split('T')[0] : '';
        if (oldest && !isNaN(new Date(oldest).getTime())) {
          setStartDate(oldest);
        } else {
          const d = new Date();
          d.setFullYear(d.getFullYear() - 1);
          setStartDate(d.toISOString().split('T')[0]);
        }
      } else {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        setStartDate(d.toISOString().split('T')[0]);
      }
    }
  };

  // Filter tickets within selected period
  // We consider an outcome relevant to the period if:
  // - closedAt is within [startDate, endDate], OR
  // - updatedAt is within [startDate, endDate], OR
  // - created in period and currently in progress
  const periodAnalysis = useMemo(() => {
    let parsedStart = new Date(startDate ? `${startDate}T00:00:00` : Date.now() - 30 * 86400000);
    if (isNaN(parsedStart.getTime())) {
      parsedStart = new Date(Date.now() - 30 * 86400000);
    }

    let parsedEnd = new Date(endDate ? `${endDate}T23:59:59` : Date.now());
    if (isNaN(parsedEnd.getTime())) {
      parsedEnd = new Date();
    }

    const start = parsedStart <= parsedEnd ? parsedStart : parsedEnd;
    const end = parsedEnd >= parsedStart ? parsedEnd : parsedStart;

    const milestonesReachedTickets: Ticket[] = [];
    const goalsAdvancedTickets: Ticket[] = [];
    const challengesUnblockedTickets: Ticket[] = [];
    const allRelevantTickets: Ticket[] = [];

    for (const t of tickets) {
      const createdDate = t.createdAt ? new Date(t.createdAt) : new Date();
      const updatedDate = t.updatedAt ? new Date(t.updatedAt) : createdDate;
      const closedDate = t.closedAt ? new Date(t.closedAt) : null;

      const isUpdatedInPeriod = !isNaN(updatedDate.getTime()) && updatedDate >= start && updatedDate <= end;
      const isClosedInPeriod = closedDate && !isNaN(closedDate.getTime()) && closedDate >= start && closedDate <= end;
      const isCreatedInPeriod = !isNaN(createdDate.getTime()) && createdDate >= start && createdDate <= end;

      if (isClosedInPeriod) {
        milestonesReachedTickets.push(t);
        goalsAdvancedTickets.push(t);
        allRelevantTickets.push(t);
      } else if (isUpdatedInPeriod || isCreatedInPeriod) {
        if (t.status === 'IN_PROGRESS') {
          goalsAdvancedTickets.push(t);
          allRelevantTickets.push(t);
        } else {
          allRelevantTickets.push(t);
        }
      }

      // Challenges Unblocked:
      // An item is considered unblocked if it previously had a blocker or extension
      // and has progressed to IN_PROGRESS or CLOSED
      const wasChallenged = (t.blockers && t.blockers.length > 0) || (t.extensionPeriod && t.extensionPeriod > 0);
      if (wasChallenged && (t.status === 'CLOSED' || t.status === 'IN_PROGRESS') && (isClosedInPeriod || isUpdatedInPeriod)) {
        challengesUnblockedTickets.push(t);
      }
    }

    const milestonesReached = milestonesReachedTickets.length;
    const goalsAdvanced = goalsAdvancedTickets.length;
    const challengesUnblocked = challengesUnblockedTickets.length;
    const workMovedForward = goalsAdvancedTickets.length;

    // Progress Made percentage across active scope
    const totalScope = allRelevantTickets.length > 0 ? allRelevantTickets.length : tickets.length;
    const progressMadeRate =
      totalScope > 0
        ? Math.min(100, Math.round(((milestonesReached + (goalsAdvanced - milestonesReached) * 0.5) / totalScope) * 100))
        : 0;

    // Momentum score index (0 - 100)
    const momentumScore = Math.min(
      100,
      Math.round(milestonesReached * 15 + (goalsAdvanced - milestonesReached) * 8 + challengesUnblocked * 12)
    );

    let momentumLabel = 'Building Stride';
    let momentumQuote = 'Laying steady foundations for your goals.';
    if (momentumScore >= 80) {
      momentumLabel = 'Peak Momentum';
      momentumQuote = 'Outstanding forward drive with remarkable outcomes.';
    } else if (momentumScore >= 50) {
      momentumLabel = 'Strong Momentum';
      momentumQuote = 'Clear, consistent cadence moving key goals forward.';
    } else if (momentumScore >= 20) {
      momentumLabel = 'Steady Momentum';
      momentumQuote = 'Steady progress advancing deliverables each day.';
    }

    // Categorical breakdown of Outcomes Achieved by type
    const categoryCounts: Record<string, number> = {
      TASK: 0,
      IMPROVEMENT: 0,
      BUG: 0,
      PERSONAL: 0,
      OTHER: 0,
    };
    for (const t of milestonesReachedTickets) {
      categoryCounts[t.type] = (categoryCounts[t.type] || 0) + 1;
    }

    // Build Daily Trajectory data points across the date window
    // Limit to at most 30 steps so chart is clean
    const startTimeMs = start.getTime();
    const endTimeMs = end.getTime();
    const diffDays = Math.max(1, Math.round((endTimeMs - startTimeMs) / (1000 * 60 * 60 * 24)));
    
    // We group into days (or intervals if long period)
    const stepDays = Math.max(1, diffDays > 45 ? Math.ceil(diffDays / 30) : 1);
    const trajectoryPoints: {
      dateStr: string;
      label: string;
      milestonesCount: number;
      cumulativeScore: number;
    }[] = [];

    let runningMilestones = 0;
    const cursor = new Date(start);
    let loopSafety = 0;

    while (cursor <= end && loopSafety < 100) {
      loopSafety++;
      const dayIso = cursor.toISOString().split('T')[0];
      const dayEnd = new Date(cursor);
      dayEnd.setDate(dayEnd.getDate() + stepDays);

      // Milestones reached in this interval
      const count = milestonesReachedTickets.filter((t) => {
        if (!t.closedAt) return false;
        const d = t.closedAt.split('T')[0];
        return d >= dayIso && d < dayEnd.toISOString().split('T')[0];
      }).length;

      runningMilestones += count;

      trajectoryPoints.push({
        dateStr: dayIso,
        label: cursor.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        milestonesCount: count,
        cumulativeScore: runningMilestones,
      });

      cursor.setDate(cursor.getDate() + stepDays);
    }

    // If no milestones recorded, create a gentle simulated baseline curve based on active tasks
    const maxMilestones = Math.max(1, runningMilestones);

    return {
      workMovedForward,
      goalsAdvanced,
      milestonesReached,
      challengesUnblocked,
      progressMadeRate,
      momentumScore,
      momentumLabel,
      momentumQuote,
      milestonesReachedTickets,
      goalsAdvancedTickets,
      categoryCounts,
      trajectoryPoints,
      maxMilestones,
    };
  }, [tickets, startDate, endDate]);

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Date Range Selector */}
      <div className="bg-white dark:bg-[#222821] rounded-[24px] sm:rounded-[28px] border border-[#E8E2D9] dark:border-[#353E33] p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4A5D44] dark:bg-[#8B9D83]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C867E] dark:text-[#9DB095]">
                {activeProfile?.name || 'Workspace'} Progress
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5] tracking-tight">
              Progress & Momentum Analysis
            </h2>
            <p className="text-xs sm:text-sm text-[#766F66] dark:text-[#9DB095] mt-1">
              Real outcomes, milestones reached, and forward velocity across your selected timeframe.
            </p>
          </div>

          {/* Preset Buttons & Custom Date Pickers */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Quick Presets */}
            <div className="flex items-center bg-[#F4EFEA] dark:bg-[#1A1E19] p-1 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] self-start sm:self-auto">
              {(['7d', '14d', '30d', '90d', 'all'] as PresetRange[]).map((p) => {
                const labelMap: Record<PresetRange, string> = {
                  '7d': '7D',
                  '14d': '14D',
                  '30d': '30D',
                  '90d': '90D',
                  all: 'All',
                };
                const isSelected = preset === p;
                return (
                  <button
                    key={p}
                    onClick={() => handlePresetSelect(p)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-[#2B332A] text-[#4A5D44] dark:text-[#F1EFEA] shadow-xs'
                        : 'text-[#766F66] dark:text-[#9DB095] hover:text-[#3D3D3D]'
                    }`}
                  >
                    {labelMap[p]}
                  </button>
                );
              })}
            </div>

            {/* Editable Custom Dates */}
            <div className="flex items-center gap-2 bg-[#FDFBF7] dark:bg-[#1A1E19] px-3 py-1.5 rounded-xl border border-[#E8E2D9] dark:border-[#2E372D] text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#8B9D83] shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPreset('all');
                }}
                className="bg-transparent text-[#3D3D3D] dark:text-[#F1EFEA] text-xs font-medium focus:outline-none cursor-pointer"
                title="Start date"
              />
              <span className="text-[#8C867E] dark:text-[#9DB095]">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPreset('all');
                }}
                className="bg-transparent text-[#3D3D3D] dark:text-[#F1EFEA] text-xs font-medium focus:outline-none cursor-pointer"
                title="End date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Reinforcing Metric Cards (Positive, Non-Punitive) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Work Moved Forward */}
        <div className="bg-white dark:bg-[#222821] rounded-[22px] sm:rounded-[26px] border border-[#E8E2D9] dark:border-[#353E33] p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#8B9D83]/60 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8C867E] dark:text-[#9DB095] uppercase tracking-wider">
              Work Moved Forward
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#8B9D83]/15 text-[#4A5D44] dark:text-[#8B9D83] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-[#3D3D3D] dark:text-[#F1EFEA]">
              {periodAnalysis.workMovedForward}
            </div>
            <p className="text-[11px] text-[#766F66] dark:text-[#9DB095] mt-1 font-medium">
              Deliverables actively advanced
            </p>
          </div>
        </div>

        {/* Milestones Reached */}
        <div className="bg-white dark:bg-[#222821] rounded-[22px] sm:rounded-[26px] border border-[#E8E2D9] dark:border-[#353E33] p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#4A5D44]/60 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8C867E] dark:text-[#9DB095] uppercase tracking-wider">
              Milestones Reached
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#4A5D44]/15 text-[#4A5D44] dark:text-[#A1B39D] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-[#4A5D44] dark:text-[#A1B39D]">
              {periodAnalysis.milestonesReached}
            </div>
            <p className="text-[11px] text-[#766F66] dark:text-[#9DB095] mt-1 font-medium">
              Full outcomes achieved
            </p>
          </div>
        </div>

        {/* Progress Made */}
        <div className="bg-white dark:bg-[#222821] rounded-[22px] sm:rounded-[26px] border border-[#E8E2D9] dark:border-[#353E33] p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#D4A373]/60 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8C867E] dark:text-[#9DB095] uppercase tracking-wider">
              Progress Made
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#D4A373]/20 text-[#A66E38] dark:text-[#E2B181] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold font-serif text-[#3D3D3D] dark:text-[#F1EFEA]">
                {periodAnalysis.progressMadeRate}%
              </span>
            </div>
            <div className="w-full bg-[#E8E2D9]/70 dark:bg-[#2E372D] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#4A5D44] dark:bg-[#8B9D83] h-full rounded-full transition-all duration-500"
                style={{ width: `${periodAnalysis.progressMadeRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Challenges Unblocked */}
        <div className="bg-white dark:bg-[#222821] rounded-[22px] sm:rounded-[26px] border border-[#E8E2D9] dark:border-[#353E33] p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#B85D52]/60 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8C867E] dark:text-[#9DB095] uppercase tracking-wider">
              Challenges Unblocked
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#8B9D83]/15 text-[#4A5D44] dark:text-[#8B9D83] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-[#3D3D3D] dark:text-[#F1EFEA]">
              {periodAnalysis.challengesUnblocked}
            </div>
            <p className="text-[11px] text-[#766F66] dark:text-[#9DB095] mt-1 font-medium">
              Obstacles cleared & conquered
            </p>
          </div>
        </div>
      </div>

      {/* Encouraging Momentum Banner */}
      <div className="bg-gradient-to-r from-[#4A5D44]/10 via-[#8B9D83]/10 to-[#D4A373]/10 dark:from-[#4A5D44]/25 dark:via-[#8B9D83]/20 dark:to-[#D4A373]/20 rounded-[24px] border border-[#8B9D83]/30 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#4A5D44] text-[#FDFBF7] dark:bg-[#8B9D83] dark:text-[#1A1E19] flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
                Momentum: {periodAnalysis.momentumLabel}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#8B9D83]/20 text-[#4A5D44] dark:text-[#A1B39D]">
                Score: {periodAnalysis.momentumScore}/100
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#504639] dark:text-[#C2C9BF] mt-0.5">
              {periodAnalysis.momentumQuote}
            </p>
          </div>
        </div>

        <div className="text-xs text-[#8C867E] dark:text-[#9DB095] font-medium self-end sm:self-center">
          Period: <span className="font-semibold text-[#4A5D44] dark:text-[#E7EAE5]">{formatDate(startDate)}</span> to <span className="font-semibold text-[#4A5D44] dark:text-[#E7EAE5]">{formatDate(endDate)}</span>
        </div>
      </div>

      {/* Main Graphs Grid: Clean, Lightweight SVG Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Momentum Trajectory: Cumulative Progress Chart (2 columns on lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#222821] rounded-[24px] sm:rounded-[28px] border border-[#E8E2D9] dark:border-[#353E33] p-5 sm:p-7 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#3D3D3D] dark:text-[#F1EFEA]">
                Progress Trajectory
              </h3>
              <p className="text-xs text-[#8C867E] dark:text-[#9DB095]">
                Cumulative milestones reached and goals advanced across this timeframe
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5D44] dark:text-[#8B9D83]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4A5D44] dark:bg-[#8B9D83]" />
              <span>Milestone Growth</span>
            </div>
          </div>

          {/* Interactive SVG Area Chart */}
          <div className="flex-1 w-full min-h-[220px] relative mt-2 select-none">
            {periodAnalysis.trajectoryPoints.length > 1 ? (
              (() => {
                const points = periodAnalysis.trajectoryPoints;
                const width = 600;
                const height = 200;
                const padding = { top: 20, right: 20, bottom: 30, left: 35 };
                const chartW = width - padding.left - padding.right;
                const chartH = height - padding.top - padding.bottom;

                const maxVal = Math.max(1, periodAnalysis.maxMilestones);

                const safeLen = Math.max(1, points.length - 1);
                // Compute coordinate pairs
                const coords = points.map((pt, i) => {
                  const x = padding.left + (i / safeLen) * chartW;
                  const y = padding.top + chartH - (pt.cumulativeScore / maxVal) * chartH;
                  return { x, y, pt, i };
                });

                // Area path string
                const lineD = coords.reduce(
                  (acc, c, idx) => (idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`),
                  ''
                );
                const areaD = `${lineD} L ${coords[coords.length - 1].x} ${
                  padding.top + chartH
                } L ${coords[0].x} ${padding.top + chartH} Z`;

                return (
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B9D83" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#8B9D83" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* Subtle grid lines */}
                    {[0, 0.5, 1].map((ratio) => {
                      const yPos = padding.top + chartH * (1 - ratio);
                      const val = Math.round(maxVal * ratio);
                      return (
                        <g key={ratio}>
                          <line
                            x1={padding.left}
                            y1={yPos}
                            x2={width - padding.right}
                            y2={yPos}
                            stroke="#E8E2D9"
                            strokeDasharray="4 4"
                            className="dark:stroke-[#2E372D]"
                          />
                          <text
                            x={padding.left - 8}
                            y={yPos + 4}
                            textAnchor="end"
                            fontSize="10"
                            className="fill-[#8C867E] dark:fill-[#9DB095] font-mono"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Area fill */}
                    <path d={areaD} fill="url(#progressGrad)" />

                    {/* Line stroke */}
                    <path
                      d={lineD}
                      fill="none"
                      stroke="#4A5D44"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="dark:stroke-[#8B9D83]"
                    />

                    {/* Data Points */}
                    {coords.map((c) => {
                      const isHovered = hoveredPointIndex === c.i;
                      return (
                        <g
                          key={c.i}
                          className="cursor-pointer group"
                          onMouseEnter={() => setHoveredPointIndex(c.i)}
                          onMouseLeave={() => setHoveredPointIndex(null)}
                          onClick={() => setHoveredPointIndex(c.i)}
                        >
                          <circle
                            cx={c.x}
                            cy={c.y}
                            r={isHovered ? 6 : 3.5}
                            fill="#FDFBF7"
                            stroke="#4A5D44"
                            strokeWidth={isHovered ? 3 : 2}
                            className="dark:fill-[#222821] dark:stroke-[#8B9D83] transition-all"
                          />
                          {/* X axis labels (sparse) */}
                          {(c.i === 0 ||
                            c.i === coords.length - 1 ||
                            c.i === Math.floor(coords.length / 2)) && (
                            <text
                              x={c.x}
                              y={height - 6}
                              textAnchor="middle"
                              fontSize="10"
                              className="fill-[#8C867E] dark:fill-[#9DB095] font-medium"
                            >
                              {c.pt.label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                );
              })()
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#8C867E] dark:text-[#9DB095]">
                Need at least 2 days in timeframe to draw trajectory.
              </div>
            )}

            {/* Hover tooltip card */}
            {hoveredPointIndex !== null && periodAnalysis.trajectoryPoints[hoveredPointIndex] && (
              <div className="absolute top-2 right-4 bg-[#FDFBF7] dark:bg-[#1A1E19] px-3 py-1.5 rounded-xl border border-[#E8E2D9] dark:border-[#353E33] shadow-md text-xs pointer-events-none">
                <span className="font-semibold text-[#4A5D44] dark:text-[#A1B39D]">
                  {periodAnalysis.trajectoryPoints[hoveredPointIndex].label}
                </span>
                <span className="text-[#8C867E] dark:text-[#9DB095]"> : </span>
                <span className="font-bold text-[#3D3D3D] dark:text-[#F1EFEA]">
                  {periodAnalysis.trajectoryPoints[hoveredPointIndex].cumulativeScore} milestones reached
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Outcomes Achieved by Focus Area */}
        <div className="bg-white dark:bg-[#222821] rounded-[24px] sm:rounded-[28px] border border-[#E8E2D9] dark:border-[#353E33] p-5 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-[#3D3D3D] dark:text-[#F1EFEA] mb-1">
              Outcomes Achieved
            </h3>
            <p className="text-xs text-[#8C867E] dark:text-[#9DB095] mb-5">
              Distribution across focus streams
            </p>

            <div className="space-y-4">
              {[
                { type: 'TASK', label: 'Core Deliverables', color: 'bg-[#4A5D44]' },
                { type: 'IMPROVEMENT', label: 'System Enhancements', color: 'bg-[#8B9D83]' },
                { type: 'BUG', label: 'Challenges Solved', color: 'bg-[#B85D52]' },
                { type: 'PERSONAL', label: 'Personal Goals', color: 'bg-[#D4A373]' },
              ].map((item) => {
                const count = periodAnalysis.categoryCounts[item.type] || 0;
                const total = Math.max(1, periodAnalysis.milestonesReached);
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={item.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#3D3D3D] dark:text-[#F1EFEA]">
                        {item.label}
                      </span>
                      <span className="font-mono text-[#8C867E] dark:text-[#9DB095]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F4EFEA] dark:bg-[#2E372D] h-2 rounded-full overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2D9] dark:border-[#2E372D] mt-6 text-[11px] text-[#8C867E] dark:text-[#9DB095] flex items-center justify-between">
            <span>Total Milestone Outcomes</span>
            <span className="font-bold text-[#4A5D44] dark:text-[#A1B39D]">
              {periodAnalysis.milestonesReached} Reached
            </span>
          </div>
        </div>
      </div>

      {/* Milestones Reached Highlights List (Quick tap-to-view detail) */}
      <div className="bg-white dark:bg-[#222821] rounded-[24px] sm:rounded-[28px] border border-[#E8E2D9] dark:border-[#353E33] p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-[#3D3D3D] dark:text-[#F1EFEA]">
              Milestones Reached in this Period
            </h3>
            <p className="text-xs text-[#8C867E] dark:text-[#9DB095]">
              Deliverables and goals successfully achieved within the selected timeframe
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#8B9D83]/15 text-[#4A5D44] dark:text-[#A1B39D]">
            {periodAnalysis.milestonesReachedTickets.length} Milestones
          </span>
        </div>

        {periodAnalysis.milestonesReachedTickets.length === 0 ? (
          <div className="py-8 text-center bg-[#FDFBF7] dark:bg-[#1A1E19] rounded-2xl border border-dashed border-[#E8E2D9] dark:border-[#353E33]">
            <Compass className="w-8 h-8 text-[#8B9D83] mx-auto mb-2 opacity-60" />
            <p className="text-xs font-semibold text-[#504639] dark:text-[#C2C9BF]">
              No milestones reached yet in this window.
            </p>
            <p className="text-[11px] text-[#8C867E] dark:text-[#9DB095] mt-0.5">
              Advance in-progress tickets or expand the date range to see completed outcomes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {periodAnalysis.milestonesReachedTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="p-3.5 rounded-2xl border border-[#E8E2D9] dark:border-[#2E372D] bg-[#FDFBF7] dark:bg-[#1A1E19] hover:border-[#8B9D83] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[11px] font-bold text-[#504639] dark:text-[#C2C9BF]">
                      {t.ticketNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4A5D44] dark:text-[#A1B39D]">
                      <CheckCircle2 className="w-3 h-3" />
                      Reached
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#3D3D3D] dark:text-[#F1EFEA] line-clamp-1">
                    {t.title}
                  </h4>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#E8E2D9]/60 dark:border-[#2E372D] flex items-center justify-between text-[10px] text-[#8C867E] dark:text-[#9DB095]">
                  <span>{t.closedAt ? formatDate(t.closedAt) : formatDate(t.updatedAt)}</span>
                  <span className="font-medium text-[#4A5D44] dark:text-[#8B9D83] flex items-center gap-0.5">
                    View <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
