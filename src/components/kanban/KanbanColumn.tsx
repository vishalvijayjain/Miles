import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../../types';
import { KanbanCard } from './KanbanCard';
import { useApp } from '../../context/AppContext';
import { Plus, CircleDot, Clock, CheckCircle2 } from 'lucide-react';

interface KanbanColumnProps {
  status: TicketStatus;
  tickets: Ticket[];
  onDragStart: (e: React.DragEvent, ticketId: string) => void;
  onDropTicket: (ticketId: string, targetStatus: TicketStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tickets,
  onDragStart,
  onDropTicket,
}) => {
  const { setIsCreateTicketModalOpen } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);

  const columnConfig = {
    TODO: {
      title: 'To Do',
      icon: CircleDot,
      iconColor: 'text-[#8C867E] dark:text-[#9DB095]',
      badgeBg: 'bg-[#E8E2D9] text-[#5A554E] dark:bg-[#2E372D] dark:text-[#C2C9BF]',
      borderAccent: 'border-t-[#D9D1C5] dark:border-t-[#4A5547]',
      emptyText: 'No tickets in To Do',
    },
    IN_PROGRESS: {
      title: 'In Progress',
      icon: Clock,
      iconColor: 'text-[#8B9D83]',
      badgeBg: 'bg-[#8B9D83]/20 text-[#364931] dark:bg-[#8B9D83]/30 dark:text-[#C4D6BE]',
      borderAccent: 'border-t-[#8B9D83]',
      emptyText: 'No tickets in progress',
    },
    CLOSED: {
      title: 'Closed',
      icon: CheckCircle2,
      iconColor: 'text-[#4A5D44] dark:text-[#8B9D83]',
      badgeBg: 'bg-[#4A5D44]/20 text-[#2B3828] dark:bg-[#4A5D44]/35 dark:text-[#C4D6BE]',
      borderAccent: 'border-t-[#4A5D44] dark:border-t-[#8B9D83]',
      emptyText: 'No completed tickets yet',
    },
  }[status];

  const Icon = columnConfig.icon;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const ticketId = e.dataTransfer.getData('text/plain');
    if (ticketId) {
      onDropTicket(ticketId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 min-w-[280px] sm:min-w-[320px] max-w-full bg-[#F5F1EB]/80 dark:bg-[#20261F]/80 rounded-[24px] border ${
        isDragOver
          ? 'border-[#8B9D83] ring-2 ring-[#8B9D83]/25 bg-[#8B9D83]/10 dark:bg-[#8B9D83]/10'
          : 'border-[#E8E2D9] dark:border-[#2E372D]'
      } border-t-4 ${columnConfig.borderAccent} transition-all duration-150 p-3.5 sm:p-4`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${columnConfig.iconColor}`} />
          <h2 className="text-sm font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
            {columnConfig.title}
          </h2>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${columnConfig.badgeBg}`}
          >
            {tickets.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateTicketModalOpen(true)}
          className="p-1.5 rounded-lg text-[#8C867E] hover:text-[#4A5D44] dark:hover:text-[#F1EFEA] hover:bg-[#E8E2D9] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
          title={`Add ticket to ${columnConfig.title}`}
          aria-label={`Add ticket to ${columnConfig.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards List / Drop Area */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-[300px] max-h-[calc(100vh-16rem)] pr-0.5">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <KanbanCard
              key={ticket.id}
              ticket={ticket}
              onDragStart={onDragStart}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#D9D1C5] dark:border-[#353E33] rounded-2xl p-6 text-center text-xs text-[#8C867E] dark:text-[#9DB095]">
            <p className="font-medium mb-1">{columnConfig.emptyText}</p>
            <p className="text-[11px]">Drag tickets here or click + to create one</p>
          </div>
        )}
      </div>
    </div>
  );
};
