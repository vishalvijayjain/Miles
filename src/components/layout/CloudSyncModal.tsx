import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Tablet,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    syncStatus,
    lastSyncedAt,
    activeVaultId,
    setActiveVaultId,
    forceCloudSync,
    showToast,
  } = useApp();

  const [inputVaultId, setInputVaultId] = useState(activeVaultId);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isCopiedKey, setIsCopiedKey] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const pairUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?sync=${activeVaultId}`
    : `https://miles.app?sync=${activeVaultId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pairUrl);
    setIsCopiedLink(true);
    showToast('success', 'Pair Link Copied', 'Open this link on your phone or tablet to sync data.');
    setTimeout(() => setIsCopiedLink(false), 2500);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(activeVaultId);
    setIsCopiedKey(true);
    showToast('success', 'Vault Key Copied');
    setTimeout(() => setIsCopiedKey(false), 2500);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await forceCloudSync();
      showToast('success', 'Synced with Cloud', 'Latest workspace updates retrieved.');
    } catch (e: any) {
      showToast('error', 'Sync Failed', e.message || 'Could not connect to cloud database.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveVaultId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVaultId.trim()) return;
    try {
      await setActiveVaultId(inputVaultId.trim());
      showToast('success', 'Connected to Vault', `Active vault switched to ${inputVaultId.trim().substring(0, 10)}...`);
      onClose();
    } catch (e: any) {
      showToast('error', 'Vault Switch Error', e.message);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cloud-sync-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FDFBF7] dark:bg-[#222821] border border-[#E8E2D9] dark:border-[#353E33] shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8E2D9] dark:border-[#2E372D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B9D83]/20 text-[#4A5D44] dark:text-[#8B9D83] flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cloud-sync-title" className="text-lg font-bold font-serif text-[#4A5D44] dark:text-[#E7EAE5]">
                Cross-Device Cloud Database
              </h2>
              <p className="text-xs text-[#8C867E] dark:text-[#9DB095]">
                Consistent data persistence across Desktop, iPhone & Tablet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8C867E] hover:text-[#3D3D3D] dark:text-[#9DB095] dark:hover:text-[#F1EFEA] hover:bg-[#F4EFEA] dark:hover:bg-[#2B332A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Status Card */}
        <div className="my-5 p-4 rounded-2xl bg-[#F4EFEA]/80 dark:bg-[#1A1E19]/80 border border-[#E8E2D9] dark:border-[#2E372D] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-500 ring-4 ring-amber-500/20 animate-pulse'
                  : syncStatus === 'offline'
                  ? 'bg-zinc-400 ring-4 ring-zinc-400/20'
                  : 'bg-rose-500 ring-4 ring-rose-500/20'
              }`}
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#3D3D3D] dark:text-[#F1EFEA] flex items-center gap-1.5">
                <span>
                  {syncStatus === 'synced'
                    ? 'Cloud Database Connected'
                    : syncStatus === 'syncing'
                    ? 'Syncing with Cloud...'
                    : syncStatus === 'offline'
                    ? 'Offline (Changes Queued)'
                    : 'Sync Error (Retrying)'}
                </span>
              </div>
              <p className="text-[11px] text-[#8C867E] dark:text-[#9DB095] truncate">
                {lastSyncedAt
                  ? `Last updated: ${lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                  : 'Continuous real-time polling active'}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            disabled={isSyncing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
            className="shrink-0 text-xs"
          >
            Sync Now
          </Button>
        </div>

        {/* Device Pairing Section */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#4A5D44] dark:text-[#9DB095] uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <Tablet className="w-3.5 h-3.5" />
                <Laptop className="w-3.5 h-3.5" />
                <span>Pair With Phone or Tablet</span>
              </label>
            </div>
            <p className="text-xs text-[#766F66] dark:text-[#C2C9BF] mb-2 leading-relaxed">
              Open this link on your phone or tablet. Any tickets, workspaces, labels, or milestones you change on any device will appear everywhere.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pairUrl}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-[#1A1E19] border border-[#E8E2D9] dark:border-[#2E372D] text-[#3D3D3D] dark:text-[#F1EFEA] select-all truncate focus:outline-hidden"
              />
              <Button
                size="sm"
                onClick={handleCopyLink}
                leftIcon={isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                className="shrink-0 text-xs"
              >
                {isCopiedLink ? 'Copied' : 'Copy Link'}
              </Button>
            </div>
          </div>

          {/* Active Vault ID */}
          <div className="pt-2 border-t border-[#E8E2D9]/80 dark:border-[#2E372D]">
            <div className="flex items-center justify-between text-xs text-[#8C867E] dark:text-[#9DB095] mb-1">
              <span>Cloud Vault ID:</span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="hover:text-[#4A5D44] dark:hover:text-[#8B9D83] flex items-center gap-1 cursor-pointer font-medium"
              >
                {isCopiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{isCopiedKey ? 'Copied' : 'Copy Key'}</span>
              </button>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-[#EFEAE2] dark:bg-[#1A1E19] font-mono text-[11px] text-[#5A554E] dark:text-[#9DB095] truncate select-all">
              {activeVaultId}
            </div>
          </div>

          {/* Switch Vault Form */}
          <form onSubmit={handleSaveVaultId} className="pt-2">
            <label className="block text-xs font-semibold text-[#5A554E] dark:text-[#9DB095] mb-1.5">
              Connect to a Different Cloud Vault:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputVaultId}
                onChange={(e) => setInputVaultId(e.target.value)}
                placeholder="Enter Vault Key..."
                className="flex-1 px-3 py-1.5 rounded-xl text-xs font-mono bg-white dark:bg-[#1A1E19] border border-[#E8E2D9] dark:border-[#2E372D] text-[#3D3D3D] dark:text-[#F1EFEA] focus:ring-2 focus:ring-[#8B9D83] focus:outline-hidden"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!inputVaultId.trim() || inputVaultId === activeVaultId}
                className="shrink-0 text-xs"
              >
                Switch Vault
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 pt-4 border-t border-[#E8E2D9] dark:border-[#2E372D] flex items-center justify-between text-[11px] text-[#8C867E] dark:text-[#9DB095]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#4A5D44] dark:text-[#8B9D83]" />
            <span>Canonical Cloud Architecture (Vercel & AI Studio Compatible)</span>
          </div>
          <button
            onClick={onClose}
            className="font-semibold text-[#4A5D44] dark:text-[#8B9D83] hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
