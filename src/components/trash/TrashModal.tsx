import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { formatDate } from '../../utils/dateUtils';
import { DeletedTicketArchive } from '../../types';
import {
  Trash2,
  RotateCcw,
  Clock,
  AlertTriangle,
  Inbox,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const TrashModal: React.FC = () => {
  const {
    isTrashModalOpen,
    setIsTrashModalOpen,
    trashTickets,
    restoreTicket,
    permanentlyDeleteTicket,
    emptyTrash,
    activeProfile,
  } = useApp();

  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [ticketToPurge, setTicketToPurge] = useState<DeletedTicketArchive | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const calculateDaysRemaining = (expiresAt: string): number => {
    const exp = new Date(expiresAt).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleRestore = async (id: string) => {
    try {
      setProcessingId(id);
      await restoreTicket(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!ticketToPurge) return;
    try {
      setProcessingId(ticketToPurge.ticket.id);
      await permanentlyDeleteTicket(ticketToPurge.ticket.id);
      setTicketToPurge(null);
    } finally {
      setProcessingId(null);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await emptyTrash();
      setConfirmEmpty(false);
    } catch {
      // Error handled in AppContext
    }
  };

  return (
    <>
      <Modal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        maxWidth="2xl"
        title={
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-[#B85D52]" />
            <span className="text-base font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
              Recently Deleted (Trash)
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#B85D52]/15 text-[#8A352C] dark:text-[#E29890] font-bold">
              {trashTickets.length}
            </span>
          </div>
        }
        description={`Recoverable deleted tickets for "${activeProfile?.name || 'Current Profile'}". Items are retained for 60 days before auto-purging.`}
      >
        <div className="space-y-4">
          {/* Information banner */}
          <div className="p-3 rounded-xl bg-[#8B9D83]/10 dark:bg-[#8B9D83]/20 border border-[#8B9D83]/30 flex items-start gap-2.5 text-xs text-[#354332] dark:text-[#C2C9BF]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#4A5D44] dark:text-[#A1B39D] mt-0.5" />
            <div>
              <p className="font-semibold">60-Day Safe Recovery Window</p>
              <p className="text-[11px] text-[#504639] dark:text-[#A1B39D]/90">
                Deleted tickets and their subtask links are archived here. You can restore any ticket back to your active boards, or permanently purge it at any time.
              </p>
            </div>
          </div>

          {/* List or Empty State */}
          {trashTickets.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EFEAE2] dark:bg-[#20261F] flex items-center justify-center text-[#8C867E]">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold text-[#504639] dark:text-[#C2C9BF]">
                  Trash is empty
                </h4>
                <p className="text-xs text-[#8C867E] dark:text-[#9DB095]">
                  Any tickets you delete will be safely kept here for 60 days before being permanently removed.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {trashTickets.map((archive) => {
                const daysLeft = calculateDaysRemaining(archive.expiresAt);
                const t = archive.ticket;

                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E241D] border border-[#E8E2D9] dark:border-[#2E372D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#D9D1C5] transition-colors"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#4A5D44] dark:text-[#A1B39D]">
                          {t.ticketNumber}
                        </span>
                        <StatusBadge status={t.status} size="sm" />
                        <PriorityBadge priority={t.priority} size="sm" />
                        <span className="text-[11px] text-[#8C867E] dark:text-[#9DB095] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#B85D52]" />
                          <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-[#3D3D3D] dark:text-[#F1EFEA] truncate">
                        {t.title}
                      </h4>

                      <div className="text-[11px] text-[#8C867E] dark:text-[#9DB095] flex items-center gap-3">
                        <span>Deleted: {formatDate(archive.deletedAt)}</span>
                        <span>Auto-purges: {formatDate(archive.expiresAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(t.id)}
                        disabled={processingId === t.id}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Restore
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => setTicketToPurge(archive)}
                        disabled={processingId === t.id}
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Purge
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D9] dark:border-[#2E372D]">
            {trashTickets.length > 0 ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setConfirmEmpty(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Empty Trash
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTrashModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Purge Single Ticket Confirmation */}
      {ticketToPurge && (
        <ConfirmDialog
          isOpen={Boolean(ticketToPurge)}
          onClose={() => setTicketToPurge(null)}
          onConfirm={handlePermanentDelete}
          title={`Permanently delete ${ticketToPurge.ticket.ticketNumber}?`}
          message={`This will immediately and permanently erase "${ticketToPurge.ticket.title}". You will not be able to recover this ticket.`}
          confirmText="Permanently Delete"
          isDangerous={true}
        />
      )}

      {/* Empty Trash Confirmation */}
      <ConfirmDialog
        isOpen={confirmEmpty}
        onClose={() => setConfirmEmpty(false)}
        onConfirm={handleEmptyTrash}
        title="Empty Entire Recycle Bin?"
        message={`Are you sure you want to permanently delete all ${trashTickets.length} tickets in the trash? This action is irreversible.`}
        confirmText="Empty All Trash"
        isDangerous={true}
      />
    </>
  );
};
