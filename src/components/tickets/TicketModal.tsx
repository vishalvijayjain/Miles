import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { RichTextEditor } from '../common/RichTextEditor';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketType,
} from '../../types';
import {
  calculateRevisedEndDate,
  formatDate,
  formatDateTime,
  isTicketOverdue,
  getDaysRemaining,
} from '../../utils/dateUtils';
import {
  PriorityBadge,
  StatusBadge,
  TypeBadge,
  BlockerBadge,
  ExtensionBadge,
  OverdueBadge,
} from '../common/Badge';
import {
  Plus,
  Trash2,
  Calendar,
  Tag,
  ShieldAlert,
  FileText,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  Layers,
  GitBranch,
  CornerDownRight,
  ExternalLink,
} from 'lucide-react';

export const TicketModal: React.FC = () => {
  const {
    isCreateTicketModalOpen,
    setIsCreateTicketModalOpen,
    selectedTicket,
    setSelectedTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    activeProfile,
    tickets,
    getChildrenOfTicket,
    getParentOfTicket,
    openCreateChildTicket,
    presetParentTicketId,
    setPresetParentTicketId,
  } = useApp();

  const isEditing = Boolean(selectedTicket);
  const isOpen = isCreateTicketModalOpen || isEditing;

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TicketStatus>('TODO');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [type, setType] = useState<TicketType>('TASK');
  const [parentTicketId, setParentTicketId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [originalEndDate, setOriginalEndDate] = useState('');
  const [extensionPeriod, setExtensionPeriod] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [blockers, setBlockers] = useState<string[]>([]);
  const [newBlockerInput, setNewBlockerInput] = useState('');

  // UI state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync state when modal opens or ticket changes
  useEffect(() => {
    if (selectedTicket) {
      setTitle(selectedTicket.title || '');
      setDescription(selectedTicket.description || '');
      setStatus(selectedTicket.status || 'TODO');
      setPriority(selectedTicket.priority || 'MEDIUM');
      setType(selectedTicket.type || 'TASK');
      setParentTicketId(selectedTicket.parentTicketId || null);
      setStartDate(selectedTicket.startDate || '');
      setOriginalEndDate(selectedTicket.originalEndDate || '');
      setExtensionPeriod(selectedTicket.extensionPeriod || 0);
      setNotes(selectedTicket.notes || '');
      setTags(selectedTicket.tags || []);
      setBlockers(selectedTicket.blockers || []);
    } else {
      // Reset for Create mode
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setType('TASK');
      setParentTicketId(presetParentTicketId || null);
      setStartDate('');
      setOriginalEndDate('');
      setExtensionPeriod(0);
      setNotes('');
      setTags([]);
      setBlockers([]);
    }
    setTagInput('');
    setNewBlockerInput('');
    setValidationError(null);
  }, [selectedTicket, isCreateTicketModalOpen, presetParentTicketId]);

  // Derived revised end date calculation
  const calculatedRevisedEndDate =
    originalEndDate && extensionPeriod > 0
      ? calculateRevisedEndDate(originalEndDate, extensionPeriod)
      : undefined;

  const isOverdue = isTicketOverdue(
    status,
    originalEndDate,
    calculatedRevisedEndDate,
    extensionPeriod
  );

  const daysRemaining = getDaysRemaining(calculatedRevisedEndDate || originalEndDate);

  // Eligible parent tickets (cannot be self, and cannot be a ticket whose parent is this ticket)
  const eligibleParents = tickets.filter((t) => {
    if (isEditing && selectedTicket) {
      if (t.id === selectedTicket.id) return false;
      if (t.parentTicketId === selectedTicket.id) return false;
    }
    return true;
  });

  // Current child subtasks (if editing)
  const childSubtasks = isEditing && selectedTicket ? getChildrenOfTicket(selectedTicket.id) : [];

  // Current parent ticket details
  const activeParent = parentTicketId ? tickets.find((t) => t.id === parentTicketId) : null;

  const handleClose = () => {
    setIsCreateTicketModalOpen(false);
    setSelectedTicket(null);
    setPresetParentTicketId(null);
    setValidationError(null);
  };

  // Tag helpers
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Blocker helpers
  const handleAddBlocker = () => {
    const trimmed = newBlockerInput.trim();
    if (trimmed && !blockers.includes(trimmed)) {
      setBlockers([...blockers, trimmed]);
      setNewBlockerInput('');
    }
  };

  const handleRemoveBlocker = (index: number) => {
    setBlockers(blockers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Form Validations
    if (!title.trim()) {
      setValidationError('Ticket title is required.');
      return;
    }

    if (startDate && originalEndDate && originalEndDate < startDate) {
      setValidationError('Original Target End Date cannot be earlier than Start Date.');
      return;
    }

    try {
      setIsSubmitting(true);

      const ticketPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        type,
        parentTicketId: parentTicketId || null,
        startDate: startDate || undefined,
        originalEndDate: originalEndDate || undefined,
        extensionPeriod: extensionPeriod > 0 ? extensionPeriod : 0,
        revisedEndDate: calculatedRevisedEndDate,
        blockers: blockers.filter((b) => b.trim().length > 0),
        notes: notes.trim() || undefined,
        tags: tags.filter((t) => t.trim().length > 0),
      };

      if (isEditing && selectedTicket) {
        await updateTicket(selectedTicket.id, ticketPayload);
      } else {
        await createTicket(ticketPayload);
      }

      handleClose();
    } catch (err: any) {
      setValidationError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTicket) return;
    try {
      setIsSubmitting(true);
      await deleteTicket(selectedTicket.id);
      setShowDeleteConfirm(false);
      handleClose();
    } catch {
      // Error handled in AppContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        maxWidth="2xl"
        title={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
              {isEditing ? `Edit ${selectedTicket?.ticketNumber}` : 'Create Ticket'}
            </span>
            {isEditing && selectedTicket && (
              <>
                <StatusBadge status={status} size="sm" />
                <PriorityBadge priority={priority} size="sm" />
                {isOverdue && <OverdueBadge daysOverdue={daysRemaining} size="sm" />}
                {extensionPeriod > 0 && calculatedRevisedEndDate && (
                  <ExtensionBadge days={extensionPeriod} revisedDate={calculatedRevisedEndDate} size="sm" />
                )}
                {blockers.length > 0 && <BlockerBadge count={blockers.length} size="sm" />}
              </>
            )}
          </div>
        }
        description={
          isEditing
            ? `Assigned to workspace: ${activeProfile?.name || 'Current Profile'}`
            : `Will be assigned to active workspace: ${activeProfile?.name || 'Current Profile'}`
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-[#B85D52]/10 dark:bg-[#B85D52]/20 border border-[#B85D52]/30 flex items-center gap-2 text-xs text-[#8A352C] dark:text-[#E29890]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B85D52]" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <Input
              label="Ticket Title"
              placeholder="e.g. Implement user authentication middleware..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={150}
              autoFocus={!isEditing}
            />
          </div>

          {/* Status, Priority, Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-1.5">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="w-full rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-sm px-3 py-2 cursor-pointer focus:ring-2 focus:ring-[#8B9D83] focus:border-[#8B9D83]"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-1.5">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-sm px-3 py-2 cursor-pointer focus:ring-2 focus:ring-[#8B9D83] focus:border-[#8B9D83]"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-1.5">
                Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TicketType)}
                className="w-full rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-sm px-3 py-2 cursor-pointer focus:ring-2 focus:ring-[#8B9D83] focus:border-[#8B9D83]"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="IMPROVEMENT">Improvement</option>
                <option value="PERSONAL">Personal</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Parent Ticket Hierarchy Selector */}
          <div className="p-3 rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-[#F5F1EB]/50 dark:bg-[#20261F]/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#504639] dark:text-[#C2C9BF] flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#8B9D83]" />
                Parent Ticket (Hierarchy)
              </label>
              {activeParent && (
                <span className="text-[11px] font-mono text-[#4A5D44] dark:text-[#A1B39D] font-bold">
                  {activeParent.ticketNumber}
                </span>
              )}
            </div>
            <select
              value={parentTicketId || ''}
              onChange={(e) => setParentTicketId(e.target.value ? e.target.value : null)}
              className="w-full rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-xs px-3 py-2 cursor-pointer focus:ring-2 focus:ring-[#8B9D83]"
            >
              <option value="">None (Top-Level Independent Ticket)</option>
              {eligibleParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.ticketNumber}: {parent.title.length > 55 ? parent.title.substring(0, 55) + '...' : parent.title} ({parent.status})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#8C867E] dark:text-[#9DB095]">
              Nest this ticket under an existing parent task to organize complex projects and sub-deliverables.
            </p>
          </div>

          {/* If Editing and has Child Subtasks, show Subtask Overview */}
          {isEditing && selectedTicket && (
            <div className="p-3.5 rounded-2xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FAF8F5] dark:bg-[#1E241D] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#4A5D44] dark:text-[#A1B39D]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#504639] dark:text-[#C2C9BF]">
                    Subtasks ({childSubtasks.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    openCreateChildTicket(selectedTicket);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#4A5D44] dark:text-[#A1B39D] hover:underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Subtask</span>
                </button>
              </div>

              {childSubtasks.length === 0 ? (
                <p className="text-xs text-[#8C867E] dark:text-[#9DB095] italic py-1">
                  No subtasks linked yet. Break down this ticket by adding subtasks.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {childSubtasks.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => {
                        setSelectedTicket(child);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#FDFBF7] dark:bg-[#242A22] border border-[#E8E2D9] dark:border-[#2E372D] text-xs hover:border-[#8B9D83] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CornerDownRight className="w-3.5 h-3.5 text-[#8B9D83] shrink-0" />
                        <span className="font-mono font-bold text-[#504639] dark:text-[#C2C9BF]">
                          {child.ticketNumber}
                        </span>
                        <span className="truncate text-[#3D3D3D] dark:text-[#F1EFEA]">
                          {child.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={child.status} size="sm" />
                        <ExternalLink className="w-3 h-3 text-[#8C867E]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dates & Extension Tracking Section */}
          <div className="p-3.5 rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-[#F5F1EB]/70 dark:bg-[#20261F]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#504639] dark:text-[#C2C9BF] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8B9D83]" />
                Schedule & Extension Tracking
              </span>
              {isOverdue && <OverdueBadge daysOverdue={daysRemaining} size="sm" />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-xs px-2.5 py-1.5 focus:ring-2 focus:ring-[#8B9D83]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-1">
                  Original Target Date
                </label>
                <input
                  type="date"
                  value={originalEndDate}
                  onChange={(e) => setOriginalEndDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-xs px-2.5 py-1.5 focus:ring-2 focus:ring-[#8B9D83]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-1">
                  Extension Period (Days)
                </label>
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={extensionPeriod}
                  onChange={(e) => setExtensionPeriod(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-xs px-2.5 py-1.5 focus:ring-2 focus:ring-[#8B9D83]"
                />
              </div>
            </div>

            {/* Calculated Revised End Date Display */}
            {originalEndDate && (
              <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-[#E8E2D9] dark:border-[#2E372D]">
                <div className="text-[#8C867E] dark:text-[#9DB095]">
                  <span>Original Target: </span>
                  <strong className="text-[#3D3D3D] dark:text-[#F1EFEA]">
                    {formatDate(originalEndDate)}
                  </strong>
                </div>

                {extensionPeriod > 0 && calculatedRevisedEndDate ? (
                  <div className="flex items-center gap-1.5 text-[#76481E] dark:text-[#E6BA90] font-medium">
                    <span>Revised Deadline: </span>
                    <strong className="underline font-bold">
                      {formatDate(calculatedRevisedEndDate)}
                    </strong>
                    <span className="text-[11px] bg-[#D4A373]/20 dark:bg-[#D4A373]/30 text-[#76481E] dark:text-[#E6BA90] px-1.5 py-0.5 rounded-full font-bold">
                      +{extensionPeriod}d
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#8C867E] dark:text-[#9DB095]">No extension requested</span>
                )}
              </div>
            )}
          </div>

          {/* Blockers Management */}
          <div className="p-3.5 rounded-2xl border border-[#E8E2D9] dark:border-[#353E33] bg-[#F5F1EB]/70 dark:bg-[#20261F]/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#504639] dark:text-[#C2C9BF] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#B85D52]" />
                Active Blockers ({blockers.length})
              </label>
              {blockers.length > 0 && <BlockerBadge count={blockers.length} size="sm" />}
            </div>

            {/* List existing blockers */}
            {blockers.length > 0 && (
              <div className="space-y-1.5">
                {blockers.map((blocker, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#B85D52]/10 dark:bg-[#B85D52]/15 border border-[#B85D52]/30 text-xs text-[#8A352C] dark:text-[#E29890]"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-[#B85D52] shrink-0" />
                      <span>{blocker}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlocker(idx)}
                      className="text-[#B85D52] hover:text-[#8A352C] dark:hover:text-[#F1EFEA] p-0.5 rounded cursor-pointer"
                      title="Remove blocker"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add blocker input */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="e.g. Waiting for DB migration script, Dependency on UI design..."
                value={newBlockerInput}
                onChange={(e) => setNewBlockerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBlocker();
                  }
                }}
                className="text-xs py-1.5"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBlocker}
                disabled={!newBlockerInput.trim()}
              >
                Add Blocker
              </Button>
            </div>
          </div>

          {/* Description (Rich Text Editor) */}
          <div>
            <label className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-1.5 flex items-center justify-between">
              <span>Description / Scope (Rich-Text Editor)</span>
              <span className="text-[11px] font-normal text-[#8C867E]">Formatted text, bullets, links & code</span>
            </label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Detailed description of the task, acceptance criteria, formatted lists, or technical considerations..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-1.5">
              Work Notes / Updates
            </label>
            <textarea
              rows={2}
              placeholder="Meeting notes, temporary links, or testing updates..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-[#D9D1C5] dark:border-[#353E33] bg-[#FDFBF7] dark:bg-[#222821] text-[#3D3D3D] dark:text-[#F1EFEA] text-xs p-3 focus:outline-none focus:ring-2 focus:ring-[#8B9D83] resize-y placeholder-[#8C867E]/60"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-1.5">
              Tags / Labels
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-[#EFEAE2] dark:bg-[#2B332A] text-[#504639] dark:text-[#C2C9BF] border border-[#D9D1C5] dark:border-[#353E33]"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-[#B85D52] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type tag and press Add or Enter (e.g. Backend, Urgent, V2)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                leftIcon={<Tag className="w-3.5 h-3.5" />}
                className="text-xs py-1.5"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add Tag
              </Button>
            </div>
          </div>

          {/* Audit Timestamps (if editing) */}
          {isEditing && selectedTicket && (
            <div className="pt-2 border-t border-[#E8E2D9] dark:border-[#2E372D] text-[11px] text-[#8C867E] dark:text-[#9DB095] flex flex-wrap gap-4">
              <span>Created: {formatDate(selectedTicket.createdAt)}</span>
              <span>Updated: {formatDate(selectedTicket.updatedAt)}</span>
              {selectedTicket.closedAt && (
                <span>Closed: {formatDate(selectedTicket.closedAt)}</span>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D9] dark:border-[#2E372D]">
            {isEditing ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                disabled={isSubmitting}
              >
                Move to Trash
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
              >
                {isEditing ? 'Save Changes' : 'Create Ticket'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      {selectedTicket && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title={`Move ${selectedTicket.ticketNumber} to Trash?`}
          message={`Are you sure you want to delete "${selectedTicket.title}"? This ticket will be moved to Recently Deleted (Trash) and can be recovered for up to 60 days.`}
          confirmText="Move to Trash"
          isDangerous={true}
          isLoading={isSubmitting}
        />
      )}
    </>
  );
};
