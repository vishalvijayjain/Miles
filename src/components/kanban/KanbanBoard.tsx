import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { KanbanColumn } from './KanbanColumn';
import { FilterBar } from '../tickets/FilterBar';
import { TicketStatus } from '../../types';
import { Button } from '../common/Button';
import { Plus, Sparkles, FolderPlus } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const {
    filteredTickets,
    tickets,
    moveTicketStatus,
    setIsCreateTicketModalOpen,
    loadDemoData,
    activeProfile,
  } = useApp();

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData('text/plain', ticketId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropTicket = (ticketId: string, targetStatus: TicketStatus) => {
    moveTicketStatus(ticketId, targetStatus);
  };

  // Group tickets by column
  const todoTickets = useMemo(
    () => filteredTickets.filter((t) => t.status === 'TODO'),
    [filteredTickets]
  );
  const inProgressTickets = useMemo(
    () => filteredTickets.filter((t) => t.status === 'IN_PROGRESS'),
    [filteredTickets]
  );
  const closedTickets = useMemo(
    () => filteredTickets.filter((t) => t.status === 'CLOSED'),
    [filteredTickets]
  );

  return (
    <div className="w-full">
      {/* Search & Filter Bar */}
      <FilterBar />

      {/* If workspace has zero tickets overall */}
      {tickets.length === 0 ? (
        <div className="bg-white dark:bg-[#222821] rounded-[28px] border border-[#E8E2D9] dark:border-[#353E33] p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#8B9D83]/20 text-[#4A5D44] dark:text-[#8B9D83] flex items-center justify-center mx-auto mb-4">
            <FolderPlus className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5] mb-1.5">
            No tickets in {activeProfile?.name || 'this workspace'}
          </h3>
          <p className="text-xs text-[#8C867E] dark:text-[#9DB095] mb-6 leading-relaxed">
            Get started by creating your first ticket, or load sample demo data to see how extensions, blockers, and Kanban stages work.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => setIsCreateTicketModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create First Ticket
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
        /* 3 Kanban Columns with horizontal scrolling on small screens */
        <div className="flex flex-col md:flex-row items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4">
          <KanbanColumn
            status="TODO"
            tickets={todoTickets}
            onDragStart={handleDragStart}
            onDropTicket={handleDropTicket}
          />
          <KanbanColumn
            status="IN_PROGRESS"
            tickets={inProgressTickets}
            onDragStart={handleDragStart}
            onDropTicket={handleDropTicket}
          />
          <KanbanColumn
            status="CLOSED"
            tickets={closedTickets}
            onDragStart={handleDragStart}
            onDropTicket={handleDropTicket}
          />
        </div>
      )}
    </div>
  );
};
