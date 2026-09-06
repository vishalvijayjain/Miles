import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Clock,
  CircleDot,
  AlertTriangle,
  ShieldAlert,
  CalendarCheck,
  TrendingUp,
  Layers,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import { PriorityBadge, TypeBadge, BlockerBadge, ExtensionBadge, OverdueBadge } from '../common/Badge';
import { formatDate, isTicketOverdue, getDaysRemaining, getEffectiveEndDate } from '../../utils/dateUtils';
import { Button } from '../common/Button';

export const DashboardView: React.FC = () => {
  const {
    stats,
    tickets,
    activeProfile,
    setSelectedTicket,
    setIsCreateTicketModalOpen,
    setActiveTab,
    setFilters,
    loadDemoData,
  } = useApp();

  // Jump to Kanban or List with a filter applied
  const filterAndGoToKanban = (filterPatch: any) => {
    setFilters((prev) => ({
      ...prev,
      ...filterPatch,
    }));
    setActiveTab('kanban');
  };

  // Blocked tickets
  const blockedTickets = tickets.filter(
    (t) => t.blockers && t.blockers.length > 0 && t.blockers.some((b) => b && b.trim().length > 0)
  );

  // Overdue tickets
  const overdueTickets = tickets.filter((t) =>
    isTicketOverdue(t.status, t.originalEndDate, t.revisedEndDate, t.extensionPeriod)
  );

  // Extended tickets
  const extendedTickets = tickets.filter(
    (t) => t.extensionPeriod && t.extensionPeriod > 0
  );

  // Critical & High priority tickets not closed
  const urgentTickets = tickets.filter(
    (t) => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== 'CLOSED'
  );

  // Recently updated tickets
  const recentTickets = [...tickets]
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Profile Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D9] dark:border-[#2E372D]">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5] flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activeProfile?.color || '#8B9D83' }}
            />
            {activeProfile?.name || 'Personal Workspace'} Dashboard
          </h2>
          <p className="text-xs text-[#8C867E] dark:text-[#9DB095] mt-0.5">
            Real-time metric summary and tracking for current workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab('kanban')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Go to Kanban
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateTicketModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total */}
        <button
          type="button"
          onClick={() => filterAndGoToKanban({ status: 'ALL', onlyBlocked: false, onlyOverdue: false, onlyExtended: false })}
          className="p-3.5 rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821] hover:border-[#8B9D83] dark:hover:border-[#8B9D83] transition-all text-left shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#8C867E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C867E] dark:text-[#9DB095]">
              Total
            </span>
            <Layers className="w-4 h-4 group-hover:text-[#4A5D44] dark:group-hover:text-[#8B9D83] transition-colors" />
          </div>
          <div className="text-2xl font-black font-serif text-[#3D3D3D] dark:text-[#F1EFEA]">
            {stats.total}
          </div>
          <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] mt-1 truncate">
            {stats.completionRate}% completed
          </div>
        </button>

        {/* To Do */}
        <button
          type="button"
          onClick={() => filterAndGoToKanban({ status: 'TODO', onlyBlocked: false, onlyOverdue: false, onlyExtended: false })}
          className="p-3.5 rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821] hover:border-[#8B9D83] dark:hover:border-[#8B9D83] transition-all text-left shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#8C867E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C867E] dark:text-[#9DB095]">
              To Do
            </span>
            <CircleDot className="w-4 h-4 text-[#8C867E]" />
          </div>
          <div className="text-2xl font-black font-serif text-[#504639] dark:text-[#C2C9BF]">
            {stats.todo}
          </div>
          <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] mt-1">Pending kickoff</div>
        </button>

        {/* In Progress */}
        <button
          type="button"
          onClick={() => filterAndGoToKanban({ status: 'IN_PROGRESS', onlyBlocked: false, onlyOverdue: false, onlyExtended: false })}
          className="p-3.5 rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821] hover:border-[#8B9D83] dark:hover:border-[#8B9D83] transition-all text-left shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#8C867E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C867E] dark:text-[#9DB095]">
              In Progress
            </span>
            <Clock className="w-4 h-4 text-[#8B9D83]" />
          </div>
          <div className="text-2xl font-black font-serif text-[#364931] dark:text-[#8B9D83]">
            {stats.inProgress}
          </div>
          <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] mt-1">Active items</div>
        </button>

        {/* Closed */}
        <button
          type="button"
          onClick={() => filterAndGoToKanban({ status: 'CLOSED', onlyBlocked: false, onlyOverdue: false, onlyExtended: false })}
          className="p-3.5 rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821] hover:border-[#4A5D44] dark:hover:border-[#8B9D83] transition-all text-left shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#8C867E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C867E] dark:text-[#9DB095]">
              Closed
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#4A5D44] dark:text-[#8B9D83]" />
          </div>
          <div className="text-2xl font-black font-serif text-[#2B3828] dark:text-[#C4D6BE]">
            {stats.closed}
          </div>
          <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] mt-1">Finished</div>
        </button>

        {/* Blocked */}
        <button
          type="button"
          onClick={() => filterAndGoToKanban({ onlyBlocked: true })}
          className={`p-3.5 rounded-2xl border transition-all text-left shadow-xs cursor-pointer group ${
            stats.blocked > 0
              ? 'border-[#B85D52]/40 dark:border-[#B85D52]/50 bg-[#B85D52]/10 dark:bg-[#B85D52]/20'
              : 'border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821]'
          }`}
        >
          <div className="flex items-center justify-between text-[#8C867E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A352C] dark:text-[#E29890]">
              Blocked
            </span>
            <ShieldAlert className="w-4 h-4 text-[#B85D52]" />
          </div>
          <div className="text-2xl font-black font-serif text-[#8A352C] dark:text-[#E29890]">
            {stats.blocked}
          </div>
          <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] mt-1">Has blockers</div>
        </button>

        {/* Overdue */}
        <button
          type="button"
          onClick={() => filterAndGoToKanban({ onlyOverdue: true })}
          className={`p-3.5 rounded-2xl border transition-all text-left shadow-xs cursor-pointer group ${
            stats.overdue > 0
              ? 'border-[#C04E40]/40 dark:border-[#C04E40]/50 bg-[#C04E40]/10 dark:bg-[#C04E40]/20'
              : 'border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821]'
          }`}
        >
          <div className="flex items-center justify-between text-[#8C867E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#85291E] dark:text-[#E89C94]">
              Overdue
            </span>
            <AlertTriangle className="w-4 h-4 text-[#C04E40]" />
          </div>
          <div className="text-2xl font-black font-serif text-[#85291E] dark:text-[#E89C94]">
            {stats.overdue}
          </div>
          <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] mt-1">Missed deadline</div>
        </button>

        {/* Extended */}
        <button
          type="button"
          onClick={() => filterAndGoToKanban({ onlyExtended: true })}
          className={`p-3.5 rounded-2xl border transition-all text-left shadow-xs cursor-pointer group ${
            stats.extended > 0
              ? 'border-[#D4A373]/40 dark:border-[#D4A373]/50 bg-[#D4A373]/15 dark:bg-[#D4A373]/20'
              : 'border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821]'
          }`}
        >
          <div className="flex items-center justify-between text-[#8C867E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#76481E] dark:text-[#E6BA90]">
              Extended
            </span>
            <CalendarCheck className="w-4 h-4 text-[#D4A373]" />
          </div>
          <div className="text-2xl font-black font-serif text-[#76481E] dark:text-[#E6BA90]">
            {stats.extended}
          </div>
          <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] mt-1">Deadline revised</div>
        </button>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="p-4 rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821] shadow-xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-[#504639] dark:text-[#C2C9BF]">
              Overall Workspace Progress ({stats.closed} of {stats.total} tickets closed)
            </span>
            <span className="font-bold text-[#3D3D3D] dark:text-[#F1EFEA]">
              {stats.completionRate}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#EFEAE2] dark:bg-[#2B332A] overflow-hidden flex">
            <div
              style={{ width: `${(stats.closed / stats.total) * 100}%` }}
              className="bg-[#4A5D44] h-full transition-all duration-300"
              title={`Closed: ${stats.closed}`}
            />
            <div
              style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
              className="bg-[#8B9D83] h-full transition-all duration-300"
              title={`In Progress: ${stats.inProgress}`}
            />
            <div
              style={{ width: `${(stats.todo / stats.total) * 100}%` }}
              className="bg-[#D9D1C5] dark:bg-[#434F3F] h-full transition-all duration-300"
              title={`To Do: ${stats.todo}`}
            />
          </div>
        </div>
      )}

      {/* If workspace is empty */}
      {tickets.length === 0 ? (
        <div className="rounded-[28px] border border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
          <Layers className="w-12 h-12 text-[#8B9D83] mx-auto mb-3" />
          <h3 className="text-lg font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5] mb-1">
            Ready to track your work?
          </h3>
          <p className="text-xs text-[#8C867E] dark:text-[#9DB095] mb-5">
            Create tickets with target dates, extensions, and blockers to view real-time metrics here.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() => setIsCreateTicketModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Ticket
            </Button>
            <Button
              variant="outline"
              onClick={() => loadDemoData()}
              leftIcon={<Sparkles className="w-4 h-4 text-[#D4A373]" />}
            >
              Load Demo Data
            </Button>
          </div>
        </div>
      ) : (
        /* Actionable Dashboard Sections Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Blockers Section */}
          <div className="rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#B85D52]" />
                <h3 className="text-sm font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
                  Active Blockers ({blockedTickets.length})
                </h3>
              </div>
              {blockedTickets.length > 0 && (
                <button
                  onClick={() => filterAndGoToKanban({ onlyBlocked: true })}
                  className="text-xs text-[#4A5D44] dark:text-[#8B9D83] hover:underline cursor-pointer font-medium"
                >
                  View in Kanban →
                </button>
              )}
            </div>

            {blockedTickets.length === 0 ? (
              <p className="text-xs text-[#8C867E] dark:text-[#9DB095] py-6 text-center">
                No active blockers! All tasks are clear to proceed.
              </p>
            ) : (
              <div className="space-y-2">
                {blockedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-2.5 rounded-xl border border-[#B85D52]/30 dark:border-[#B85D52]/40 bg-[#B85D52]/10 dark:bg-[#B85D52]/15 hover:bg-[#B85D52]/15 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-[#504639] dark:text-[#C2C9BF]">
                          {ticket.ticketNumber}
                        </span>
                        <PriorityBadge priority={ticket.priority} size="sm" />
                      </div>
                      <span className="text-[11px] font-medium text-[#8C867E] dark:text-[#9DB095]">
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#3D3D3D] dark:text-[#F1EFEA] line-clamp-1 mb-1">
                      {ticket.title}
                    </h4>
                    <div className="text-[11px] text-[#8A352C] dark:text-[#E29890] flex items-center gap-1">
                      <span className="font-semibold">Blocker:</span>
                      <span className="truncate">{ticket.blockers![0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overdue & Urgent Deadlines */}
          <div className="rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C04E40]" />
                <h3 className="text-sm font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
                  Overdue & Priority Focus ({overdueTickets.length + urgentTickets.length})
                </h3>
              </div>
              <button
                onClick={() => filterAndGoToKanban({ priority: 'CRITICAL' })}
                className="text-xs text-[#4A5D44] dark:text-[#8B9D83] hover:underline cursor-pointer font-medium"
              >
                View High Priority →
              </button>
            </div>

            {overdueTickets.length === 0 && urgentTickets.length === 0 ? (
              <p className="text-xs text-[#8C867E] dark:text-[#9DB095] py-6 text-center">
                No overdue or critical pending items.
              </p>
            ) : (
              <div className="space-y-2">
                {overdueTickets.slice(0, 3).map((ticket) => {
                  const effectiveEnd = getEffectiveEndDate(
                    ticket.originalEndDate,
                    ticket.revisedEndDate,
                    ticket.extensionPeriod
                  );
                  const days = getDaysRemaining(effectiveEnd);
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-2.5 rounded-xl border border-[#C04E40]/30 dark:border-[#C04E40]/40 bg-[#C04E40]/10 dark:bg-[#C04E40]/15 hover:bg-[#C04E40]/15 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-[#504639] dark:text-[#C2C9BF]">
                          {ticket.ticketNumber}
                        </span>
                        <OverdueBadge daysOverdue={days} size="sm" />
                      </div>
                      <h4 className="text-xs font-semibold text-[#3D3D3D] dark:text-[#F1EFEA] line-clamp-1">
                        {ticket.title}
                      </h4>
                      <p className="text-[11px] text-[#8C867E] dark:text-[#9DB095] mt-1">
                        Target date: {formatDate(effectiveEnd)}
                      </p>
                    </div>
                  );
                })}

                {urgentTickets
                  .filter((t) => !overdueTickets.some((o) => o.id === t.id))
                  .slice(0, 3)
                  .map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-2.5 rounded-xl border border-[#E8E2D9] dark:border-[#353E33] hover:border-[#8B9D83] dark:hover:border-[#8B9D83] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-[#504639] dark:text-[#C2C9BF]">
                          {ticket.ticketNumber}
                        </span>
                        <PriorityBadge priority={ticket.priority} size="sm" />
                      </div>
                      <h4 className="text-xs font-semibold text-[#3D3D3D] dark:text-[#F1EFEA] line-clamp-1">
                        {ticket.title}
                      </h4>
                      <p className="text-[11px] text-[#8C867E] dark:text-[#9DB095] mt-1">
                        Status: {ticket.status.replace('_', ' ')}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Extended Deadlines Watchlist */}
          <div className="rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#D4A373]" />
                <h3 className="text-sm font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
                  Extended Work Items ({extendedTickets.length})
                </h3>
              </div>
              {extendedTickets.length > 0 && (
                <button
                  onClick={() => filterAndGoToKanban({ onlyExtended: true })}
                  className="text-xs text-[#4A5D44] dark:text-[#8B9D83] hover:underline cursor-pointer font-medium"
                >
                  Filter Extended →
                </button>
              )}
            </div>

            {extendedTickets.length === 0 ? (
              <p className="text-xs text-[#8C867E] dark:text-[#9DB095] py-6 text-center">
                No tickets have deadline extensions.
              </p>
            ) : (
              <div className="space-y-2">
                {extendedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-2.5 rounded-xl border border-[#D4A373]/30 dark:border-[#D4A373]/40 bg-[#D4A373]/10 dark:bg-[#D4A373]/15 hover:bg-[#D4A373]/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-[#504639] dark:text-[#C2C9BF]">
                        {ticket.ticketNumber}
                      </span>
                      <ExtensionBadge
                        days={ticket.extensionPeriod!}
                        revisedDate={ticket.revisedEndDate}
                        size="sm"
                      />
                    </div>
                    <h4 className="text-xs font-semibold text-[#3D3D3D] dark:text-[#F1EFEA] line-clamp-1 mb-1">
                      {ticket.title}
                    </h4>
                    <div className="text-[11px] text-[#8C867E] dark:text-[#9DB095] flex justify-between">
                      <span>Original: {formatDate(ticket.originalEndDate)}</span>
                      <span className="font-semibold text-[#76481E] dark:text-[#E6BA90]">
                        New: {formatDate(ticket.revisedEndDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity / Updates */}
          <div className="rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-white dark:bg-[#222821] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8B9D83]" />
                <h3 className="text-sm font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
                  Recently Updated Tickets
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('list')}
                className="text-xs text-[#4A5D44] dark:text-[#8B9D83] hover:underline cursor-pointer font-medium"
              >
                View All →
              </button>
            </div>

            {recentTickets.length === 0 ? (
              <p className="text-xs text-[#8C867E] dark:text-[#9DB095] py-6 text-center">
                No tickets found.
              </p>
            ) : (
              <div className="space-y-2">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-2.5 rounded-xl border border-[#E8E2D9] dark:border-[#353E33] hover:border-[#8B9D83] dark:hover:border-[#8B9D83] transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-mono font-bold text-[#504639] dark:text-[#C2C9BF]">
                          {ticket.ticketNumber}
                        </span>
                        <TypeBadge type={ticket.type} size="sm" />
                      </div>
                      <h4 className="text-xs font-semibold text-[#3D3D3D] dark:text-[#F1EFEA] truncate">
                        {ticket.title}
                      </h4>
                    </div>

                    <div className="shrink-0 text-right">
                      <PriorityBadge priority={ticket.priority} size="sm" />
                      <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] mt-1">
                        {formatDate(ticket.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
