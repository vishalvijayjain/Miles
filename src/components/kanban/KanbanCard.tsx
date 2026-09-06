import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  PriorityBadge,
  TypeBadge,
  BlockerBadge,
  ExtensionBadge,
  OverdueBadge,
} from '../common/Badge';
import {
  formatDate,
  isTicketOverdue,
  getDaysRemaining,
  getEffectiveEndDate,
} from '../../utils/dateUtils';
import {
  Calendar,
  MoreVertical,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  CircleDot,
  GitBranch,
  Layers,
} from 'lucide-react';

interface KanbanCardProps {
  ticket: Ticket;
  onDragStart: (e: React.DragEvent, ticketId: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ ticket, onDragStart }) => {
  const { setSelectedTicket, moveTicketStatus, getParentOfTicket, childrenCountMap } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const parentTicket = ticket.parentTicketId ? getParentOfTicket(ticket.id) : null;
  const subtasksCount = childrenCountMap[ticket.id] || 0;

  // Plain-text snippet for rich-text description
  const descriptionSnippet = ticket.description
    ? ticket.description.replace(/<[^>]*>?/gm, '').trim()
    : '';

  const effectiveEndDate = getEffectiveEndDate(
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

  const daysRemaining = getDaysRemaining(effectiveEndDate);

  const hasBlocker =
    ticket.blockers &&
    ticket.blockers.length > 0 &&
    ticket.blockers.some((b) => b && b.trim().length > 0);

  const isExtended =
    Boolean(ticket.extensionPeriod) &&
    ticket.extensionPeriod! > 0 &&
    Boolean(ticket.revisedEndDate);

  const isClosed = ticket.status === 'CLOSED';

  const handleStatusChange = (newStatus: TicketStatus) => {
    moveTicketStatus(ticket.id, newStatus);
    setIsMenuOpen(false);
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e, ticket.id);
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => setSelectedTicket(ticket)}
      className={`group relative rounded-2xl border bg-white dark:bg-[#252C24] p-4 shadow-xs transition-all hover:shadow-md cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'opacity-40 scale-98 border-[#8B9D83]' : ''
      } ${
        isClosed
          ? 'border-[#E8E2D9]/80 dark:border-[#353E33]/80 opacity-80 hover:opacity-100 bg-[#FBF9F5] dark:bg-[#20261F]'
          : hasBlocker
          ? 'border-[#B85D52]/50 bg-[#B85D52]/5 dark:border-[#B85D52]/40 dark:bg-[#B85D52]/10'
          : isOverdue
          ? 'border-[#B85D52]/50 dark:border-[#B85D52]/40'
          : 'border-[#E8E2D9] dark:border-[#353E33] hover:border-[#8B9D83] dark:hover:border-[#8B9D83]'
      }`}
    >
      {/* Top row: Ticket ID, Type badge, and Status Move Quick Action Menu */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold text-[#8C867E] dark:text-[#9DB095] shrink-0 font-mono tracking-wide">
            {ticket.ticketNumber}
          </span>
          <TypeBadge type={ticket.type} size="sm" />
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <PriorityBadge priority={ticket.priority} size="sm" />

          {/* Quick status dropdown for accessible keyboard / mobile movement */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-1 rounded-lg text-[#8C867E] hover:text-[#4A5D44] dark:hover:text-[#F1EFEA] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
              title="Change Status"
              aria-label="Move ticket"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-2xl bg-[#FDFBF7] dark:bg-[#222821] border border-[#E8E2D9] dark:border-[#353E33] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-[#8C867E] dark:text-[#9DB095]">
                  Move To:
                </div>
                {ticket.status !== 'TODO' && (
                  <button
                    onClick={() => handleStatusChange('TODO')}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#3D3D3D] dark:text-[#F1EFEA] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] text-left cursor-pointer"
                  >
                    <CircleDot className="w-3 h-3 text-[#8C867E]" />
                    <span>To Do</span>
                  </button>
                )}
                {ticket.status !== 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#3D3D3D] dark:text-[#F1EFEA] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] text-left cursor-pointer"
                  >
                    <Clock className="w-3 h-3 text-[#8B9D83]" />
                    <span>In Progress</span>
                  </button>
                )}
                {ticket.status !== 'CLOSED' && (
                  <button
                    onClick={() => handleStatusChange('CLOSED')}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#3D3D3D] dark:text-[#F1EFEA] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] text-left cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#4A5D44]" />
                    <span>Closed</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parent Hierarchy link if child ticket */}
      {parentTicket && (
        <div className="flex items-center gap-1 text-[11px] font-medium text-[#4A5D44] dark:text-[#A1B39D] mb-1.5">
          <GitBranch className="w-3 h-3 text-[#8B9D83]" />
          <span className="font-mono font-semibold">{parentTicket.ticketNumber}</span>
          <span className="text-[#8C867E] dark:text-[#9DB095]">/</span>
          <span className="truncate max-w-[140px]">{parentTicket.title}</span>
        </div>
      )}

      {/* Ticket Title */}
      <h3
        className={`text-sm font-semibold text-[#3D3D3D] dark:text-[#F1EFEA] mb-1.5 leading-snug line-clamp-2 ${
          isClosed ? 'line-through text-[#8C867E] dark:text-[#7D887A]' : ''
        }`}
      >
        {ticket.title}
      </h3>

      {/* Description Snippet */}
      {descriptionSnippet && (
        <p className="text-xs text-[#766F66] dark:text-[#9DB095] line-clamp-2 mb-2.5 leading-relaxed">
          {descriptionSnippet}
        </p>
      )}

      {/* Subtasks Count Badge if parent */}
      {subtasksCount > 0 && (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#8B9D83]/15 text-[#4A5D44] dark:text-[#A1B39D] border border-[#8B9D83]/30 mb-2">
          <Layers className="w-3 h-3 text-[#8B9D83]" />
          <span>{subtasksCount} {subtasksCount === 1 ? 'subtask' : 'subtasks'}</span>
        </div>
      )}

      {/* Blocker Alert Banner (if active) */}
      {hasBlocker && (
        <div className="mb-2.5 flex items-start gap-1.5 p-2 rounded-xl bg-[#B85D52]/10 dark:bg-[#B85D52]/20 border border-[#B85D52]/30 text-[11px] text-[#8A352C] dark:text-[#E29890]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#B85D52] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-semibold">Blocker: </span>
            <span className="truncate block">{ticket.blockers![0]}</span>
          </div>
        </div>
      )}

      {/* Dates, Extension, and Overdue info */}
      {(effectiveEndDate || ticket.startDate) && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8C867E] dark:text-[#9DB095] mb-2 pt-2 border-t border-[#E8E2D9] dark:border-[#2E372D]">
          {effectiveEndDate && (
            <div className="flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-[#8C867E]" />
              <span>Target: {formatDate(effectiveEndDate)}</span>
            </div>
          )}

          {isOverdue && <OverdueBadge daysOverdue={daysRemaining} size="sm" />}

          {isExtended && (
            <ExtensionBadge
              days={ticket.extensionPeriod!}
              revisedDate={ticket.revisedEndDate}
              size="sm"
            />
          )}
        </div>
      )}

      {/* Tags chips */}
      {ticket.tags && ticket.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {ticket.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EFEAE2] dark:bg-[#2B332A] text-[#554F47] dark:text-[#C2C9BF]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Mobile-Friendly Touch Quick Action Bar (alternative to drag-and-drop) */}
      <div
        className="mt-3 pt-2 border-t border-[#E8E2D9]/70 dark:border-[#2E372D] flex items-center justify-between gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {ticket.status === 'TODO' && (
          <button
            type="button"
            onClick={() => handleStatusChange('IN_PROGRESS')}
            className="w-full min-h-[36px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#8B9D83]/15 text-[#4A5D44] dark:text-[#A1B39D] hover:bg-[#8B9D83]/25 active:scale-95 transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Start Progress →</span>
          </button>
        )}

        {ticket.status === 'IN_PROGRESS' && (
          <div className="flex items-center gap-1.5 w-full">
            <button
              type="button"
              onClick={() => handleStatusChange('TODO')}
              className="min-h-[36px] px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#8C867E] dark:text-[#9DB095] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] active:scale-95 transition-all cursor-pointer"
              title="Move back to To Do"
            >
              ← To Do
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('CLOSED')}
              className="flex-1 min-h-[36px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#4A5D44] text-[#FDFBF7] dark:bg-[#8B9D83] dark:text-[#1A1E19] hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reach Milestone</span>
            </button>
          </div>
        )}

        {ticket.status === 'CLOSED' && (
          <button
            type="button"
            onClick={() => handleStatusChange('IN_PROGRESS')}
            className="w-full min-h-[36px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#766F66] dark:text-[#9DB095] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] active:scale-95 transition-all cursor-pointer"
          >
            <span>↺ Reopen Work</span>
          </button>
        )}
      </div>
    </div>
  );
};
