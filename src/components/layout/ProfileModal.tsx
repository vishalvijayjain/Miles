import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { MAX_PROFILES } from '../../services/ProfileService';
import { Users, Plus, Check, Edit2, Trash2, ShieldCheck, FolderKanban } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    profiles,
    activeProfile,
    isProfileModalOpen,
    setIsProfileModalOpen,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
  } = useApp();

  const [newProfileName, setNewProfileName] = useState('');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    try {
      setIsSubmitting(true);
      await createProfile(newProfileName.trim());
      setNewProfileName('');
    } catch {
      // Error handled by showToast in AppContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingProfileId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      setIsSubmitting(true);
      await updateProfile(id, editingName.trim());
      setEditingProfileId(null);
      setEditingName('');
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsSubmitting(true);
      await deleteProfile(deleteTargetId);
      setDeleteTargetId(null);
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetProfileForDelete = profiles.find((p) => p.id === deleteTargetId);

  return (
    <>
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setEditingProfileId(null);
        }}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8B9D83]" />
            <span className="text-base font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
              Manage Profiles / Workspaces
            </span>
          </div>
        }
        description={`Each profile maintains completely isolated tickets, Kanban boards, and settings. (${profiles.length}/${MAX_PROFILES} profiles used)`}
      >
        <div className="space-y-5">
          {/* List of Profiles */}
          <div className="space-y-2">
            {profiles.map((profile) => {
              const isActive = activeProfile?.id === profile.id;
              const isEditing = editingProfileId === profile.id;

              return (
                <div
                  key={profile.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                    isActive
                      ? 'border-[#8B9D83] bg-[#8B9D83]/10 dark:bg-[#8B9D83]/20'
                      : 'border-[#E8E2D9] dark:border-[#353E33] hover:bg-[#FDFBF7] dark:hover:bg-[#252B24]'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: profile.color || '#8B9D83' }}
                    />

                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(profile.id);
                            if (e.key === 'Escape') setEditingProfileId(null);
                          }}
                          autoFocus
                          maxLength={30}
                          className="py-1 text-xs"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(profile.id)}
                          disabled={isSubmitting || !editingName.trim()}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-[#3D3D3D] dark:text-[#F1EFEA] truncate">
                          {profile.name}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#8B9D83]/20 text-[#4A5D44] dark:text-[#E7EAE5] shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            switchProfile(profile.id);
                            setIsProfileModalOpen(false);
                          }}
                          className="text-xs"
                        >
                          Switch to
                        </Button>
                      )}
                      <button
                        onClick={() => handleStartEdit(profile.id, profile.name)}
                        className="p-1.5 text-[#8C867E] hover:text-[#3D3D3D] dark:hover:text-[#F1EFEA] rounded-lg hover:bg-[#EFEAE2] dark:hover:bg-[#2B332A] cursor-pointer"
                        title="Rename Profile"
                        aria-label={`Rename ${profile.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(profile.id)}
                        disabled={profiles.length <= 1}
                        className="p-1.5 text-[#8C867E] hover:text-[#B85D52] dark:hover:text-[#E29890] rounded-lg hover:bg-[#B85D52]/10 dark:hover:bg-[#B85D52]/20 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title={
                          profiles.length <= 1
                            ? 'Cannot delete the only profile'
                            : 'Delete Profile'
                        }
                        aria-label={`Delete ${profile.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Profile Section */}
          {profiles.length < MAX_PROFILES ? (
            <form onSubmit={handleCreate} className="pt-3 border-t border-[#E8E2D9] dark:border-[#2E372D]">
              <label className="block text-xs font-semibold text-[#504639] dark:text-[#C2C9BF] mb-2">
                Create New Profile ({MAX_PROFILES - profiles.length} remaining)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="e.g. Work, Client Projects, Personal Study..."
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  maxLength={30}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!newProfileName.trim() || isSubmitting}
                  isLoading={isSubmitting}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-3 rounded-xl bg-[#D4A373]/15 dark:bg-[#D4A373]/20 border border-[#D4A373]/40 text-xs text-[#76481E] dark:text-[#E6BA90]">
              Profile capacity reached ({MAX_PROFILES} profiles). To create another profile, delete or rename an existing one.
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${targetProfileForDelete?.name}"?`}
        message="All tickets and data in this profile will be permanently deleted. This action cannot be undone."
        confirmText="Delete Workspace"
        isDangerous={true}
        isLoading={isSubmitting}
      />
    </>
  );
};
