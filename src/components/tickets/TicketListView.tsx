import React from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from './FilterBar';
import {
  PriorityBadge,
  StatusBadge,
  TypeBadge,
  BlockerBadge,
  ExtensionBadge,
  OverdueBadge,
} from '../common/Badge';
import {
  formatDate,
  getEffectiveEndDate,
  isTicketOverdue,
  getDaysRemaining,
} from '../../utils/dateUtils';
import { TicketStatus } from '../../types';
import { Button } from '../common/Button';
import { Plus, Sparkles, FolderPlus, ArrowUpDown, GitBranch, Layers } from 'lucide-react';

export const TicketListView: React.FC = () => {
  const {
    filteredTickets,
    tickets,
    setSelectedTicket,
    setIsCreateTicketModalOpen,
    moveTicketStatus,
    loadDemoData,
    activeProfile,
    getParentOfTicket,
    childrenCountMap,
  } = useApp();

  return (
    <div className="w-full space-y-4">
      <FilterBar />

      {tickets.length === 0 ? (
        <div className="bg-white dark:bg-[#222821] rounded-[28px] border border-[#E8E2D9] dark:border-[#353E33] p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#8B9D83]/20 text-[#4A5D44] dark:text-[#8B9D83] flex items-center justify-center mx-auto mb-4">
            <FolderPlus className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5] mb-1.5">
            No tickets in {activeProfile?.name || 'this workspace'}
          </h3>
          <p className="text-xs text-[#8C867E] dark:text-[#9DB095] mb-6 leading-relaxed">
            Create tickets to start tracking tasks, or load demo data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
      ) : filteredTickets.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#222821] rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] text-[#8C867E] dark:text-[#9DB095] text-xs">
          No tickets match the selected filters or search query.
        </div>
      ) : (
        <div className="bg-white dark:bg-[#222821] rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8E2D9] dark:border-[#353E33] bg-[#F5F1EB] dark:bg-[#20261F] font-semibold text-[#504639] dark:text-[#C2C9BF]">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Target Date</th>
                  <th className="py-3 px-4">Indicators</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9] dark:divide-[#2E372D]">
                {filteredTickets.map((ticket) => {
                  const effectiveEnd = getEffectiveEndDate(
                    ticket.originalEndDate,
                    ticket.revisedEndDate,
                    ticket.extensionPeriod
                  );
                  const isOverdue = isTicketOverdue(
                    ticket.status,
                    ticket.originalEndDate,
                    ticket.revisedEndDate,
                    ticket.extensionPeriod
                  );
                  const daysRemaining = getDaysRemaining(effectiveEnd);
                  const hasBlocker =
                    ticket.blockers &&
                    ticket.blockers.length > 0 &&
                    ticket.blockers.some((b) => b && b.trim().length > 0);
                  const isExtended =
                    Boolean(ticket.extensionPeriod) && ticket.extensionPeriod! > 0;
                  const parentTicket = ticket.parentTicketId
                    ? getParentOfTicket(ticket.id)
                    : null;
                  const subtaskCount = childrenCountMap[ticket.id] || 0;
                  const cleanSnippet = ticket.description
                    ? ticket.description.replace(/<[^>]*>?/gm, '').trim()
                    : '';

                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="hover:bg-[#FDFBF7] dark:hover:bg-[#252B24] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#504639] dark:text-[#C2C9BF] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {parentTicket && (
                            <GitBranch className="w-3.5 h-3.5 text-[#8B9D83] shrink-0" />
                          )}
                          <span>{ticket.ticketNumber}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {parentTicket && (
                          <div className="text-[10px] text-[#8C867E] dark:text-[#9DB095] flex items-center gap-1 mb-0.5">
                            <span>Under:</span>
                            <span className="font-mono font-semibold text-[#4A5D44] dark:text-[#A1B39D]">
                              {parentTicket.ticketNumber}
                            </span>
                          </div>
                        )}
                        <div className="font-semibold text-[#3D3D3D] dark:text-[#F1EFEA] truncate flex items-center gap-1.5">
                          <span className="truncate">{ticket.title}</span>
                          {subtaskCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#8B9D83]/15 text-[#4A5D44] dark:text-[#A1B39D] shrink-0">
                              <Layers className="w-2.5 h-2.5" />
                              {subtaskCount}
                            </span>
                          )}
                        </div>
                        {cleanSnippet && (
                          <div className="text-[11px] text-[#8C867E] dark:text-[#9DB095] truncate mt-0.5">
                            {cleanSnippet}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={ticket.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={ticket.priority} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <TypeBadge type={ticket.type} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-[#504639] dark:text-[#C2C9BF]">
                        {effectiveEnd ? (
                          <div>
                            <div>{formatDate(effectiveEnd)}</div>
                            {isExtended && (
                              <div className="text-[10px] text-[#76481E] dark:text-[#E6BA90] font-medium">
                                Orig: {formatDate(ticket.originalEndDate)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#8C867E] dark:text-[#9DB095]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {hasBlocker && (
                            <BlockerBadge
                              count={ticket.blockers?.length}
                              text={ticket.blockers?.[0]}
                              size="sm"
                            />
                          )}
                          {isOverdue && (
                            <OverdueBadge daysOverdue={daysRemaining} size="sm" />
                          )}
                          {isExtended && (
                            <ExtensionBadge
                              days={ticket.extensionPeriod!}
                              revisedDate={ticket.revisedEndDate}
                              size="sm"
                            />
                          )}
                        </div>
                      </td>

                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={ticket.status}
                          onChange={(e) =>
                            moveTicketStatus(ticket.id, e.target.value as TicketStatus)
                          }
                          className="rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[11px] px-2.5 py-1 text-[#3D3D3D] dark:text-[#F1EFEA] focus:ring-1 focus:ring-[#8B9D83] cursor-pointer"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
