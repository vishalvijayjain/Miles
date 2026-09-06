import React from 'react';
import { useApp } from '../../context/AppContext';
import { Input } from '../common/Input';
import { TicketPriority, TicketStatus, TicketType, SortField } from '../../types';
import {
  Search,
  SlidersHorizontal,
  X,
  ShieldAlert,
  AlertTriangle,
  CalendarCheck,
  ArrowUpDown,
} from 'lucide-react';

export const FilterBar: React.FC = () => {
  const {
    filters,
    setFilters,
    resetFilters,
    sort,
    setSort,
    tickets,
    filteredTickets,
  } = useApp();

  const isFiltered =
    Boolean(filters.search) ||
    filters.status !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.type !== 'ALL' ||
    filters.onlyBlocked ||
    filters.onlyOverdue ||
    filters.onlyExtended;

  const handleToggleOnlyBlocked = () => {
    setFilters((prev) => ({ ...prev, onlyBlocked: !prev.onlyBlocked }));
  };

  const handleToggleOnlyOverdue = () => {
    setFilters((prev) => ({ ...prev, onlyOverdue: !prev.onlyOverdue }));
  };

  const handleToggleOnlyExtended = () => {
    setFilters((prev) => ({ ...prev, onlyExtended: !prev.onlyExtended }));
  };

  return (
    <div className="bg-white dark:bg-[#222821] rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] p-3.5 sm:p-4 shadow-xs mb-6 space-y-3">
      {/* Top row: Search input & Main select filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search */}
        <div className="flex-1 relative">
          <Input
            placeholder="Search by ID, title, tags, description, blockers..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            leftIcon={<Search className="w-4 h-4" />}
            rightElement={
              filters.search ? (
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                  className="text-[#8C867E] hover:text-[#4A5D44] dark:hover:text-[#F1EFEA] p-0.5 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : undefined
            }
            className="text-xs sm:text-sm py-1.5"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full sm:w-36 shrink-0">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value as 'ALL' | TicketStatus,
              }))
            }
            className="w-full rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-xs px-2.5 py-2 focus:ring-2 focus:ring-[#8B9D83] cursor-pointer"
          >
            <option value="ALL">Status: All</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <div className="w-full sm:w-36 shrink-0">
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                priority: e.target.value as 'ALL' | TicketPriority,
              }))
            }
            className="w-full rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-xs px-2.5 py-2 focus:ring-2 focus:ring-[#8B9D83] cursor-pointer"
          >
            <option value="ALL">Priority: All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Type Dropdown */}
        <div className="w-full sm:w-36 shrink-0">
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                type: e.target.value as 'ALL' | TicketType,
              }))
            }
            className="w-full rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-xs px-2.5 py-2 focus:ring-2 focus:ring-[#8B9D83] cursor-pointer"
          >
            <option value="ALL">Type: All</option>
            <option value="TASK">Task</option>
            <option value="BUG">Bug</option>
            <option value="IMPROVEMENT">Improvement</option>
            <option value="PERSONAL">Personal</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Bottom row: Quick toggle filters, Sorting, and match counts */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8E2D9] dark:border-[#2E372D] text-xs">
        {/* Quick Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[#8C867E] dark:text-[#9DB095] mr-1 font-medium hidden sm:inline">
            Quick Filters:
          </span>

          <button
            type="button"
            onClick={handleToggleOnlyBlocked}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs transition-colors cursor-pointer ${
              filters.onlyBlocked
                ? 'bg-[#B85D52]/15 border-[#B85D52]/40 text-[#8A352C] dark:bg-[#B85D52]/25 dark:border-[#B85D52]/50 dark:text-[#E29890] font-semibold'
                : 'border-[#E8E2D9] dark:border-[#353E33] text-[#766F66] dark:text-[#9DB095] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#B85D52]" />
            <span>Blocked</span>
          </button>

          <button
            type="button"
            onClick={handleToggleOnlyOverdue}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs transition-colors cursor-pointer ${
              filters.onlyOverdue
                ? 'bg-[#C04E40]/15 border-[#C04E40]/40 text-[#85291E] dark:bg-[#C04E40]/25 dark:border-[#C04E40]/50 dark:text-[#E89C94] font-semibold'
                : 'border-[#E8E2D9] dark:border-[#353E33] text-[#766F66] dark:text-[#9DB095] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#C04E40]" />
            <span>Overdue</span>
          </button>

          <button
            type="button"
            onClick={handleToggleOnlyExtended}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs transition-colors cursor-pointer ${
              filters.onlyExtended
                ? 'bg-[#D4A373]/20 border-[#D4A373]/45 text-[#76481E] dark:bg-[#D4A373]/25 dark:border-[#D4A373]/50 dark:text-[#E6BA90] font-semibold'
                : 'border-[#E8E2D9] dark:border-[#353E33] text-[#766F66] dark:text-[#9DB095] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A]'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Extended</span>
          </button>

          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-[#8C867E] hover:text-[#4A5D44] dark:hover:text-[#F1EFEA] underline cursor-pointer text-xs ml-1"
            >
              <X className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

        {/* Sorting & Counter */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 text-[#766F66] dark:text-[#9DB095]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8B9D83]" />
            <span>Sort:</span>
            <select
              value={sort.field}
              onChange={(e) =>
                setSort((prev) => ({
                  ...prev,
                  field: e.target.value as SortField,
                }))
              }
              className="bg-transparent border-0 text-[#3D3D3D] dark:text-[#F1EFEA] font-medium focus:ring-0 cursor-pointer p-0 text-xs"
            >
              <option value="priority" className="bg-[#FDFBF7] dark:bg-[#222821]">Priority</option>
              <option value="deadline" className="bg-[#FDFBF7] dark:bg-[#222821]">Deadline</option>
              <option value="startDate" className="bg-[#FDFBF7] dark:bg-[#222821]">Start Date</option>
              <option value="createdAt" className="bg-[#FDFBF7] dark:bg-[#222821]">Created</option>
              <option value="updatedAt" className="bg-[#FDFBF7] dark:bg-[#222821]">Updated</option>
              <option value="ticketNumber" className="bg-[#FDFBF7] dark:bg-[#222821]">Ticket ID</option>
            </select>
            <button
              type="button"
              onClick={() =>
                setSort((prev) => ({
                  ...prev,
                  direction: prev.direction === 'asc' ? 'desc' : 'asc',
                }))
              }
              className="px-1.5 py-0.5 rounded text-[11px] font-bold uppercase hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] text-[#504639] dark:text-[#C2C9BF] cursor-pointer"
              title="Toggle sort direction"
            >
              {sort.direction}
            </button>
          </div>

          <span className="text-[#8C867E] dark:text-[#9DB095] text-xs">
            {filteredTickets.length} of {tickets.length} tickets
          </span>
        </div>
      </div>
    </div>
  );
};
