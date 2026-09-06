import { TicketStatus } from '../types';

/**
 * Formats an ISO string into a human-readable date and time.
 */
export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString || '';
  }
}

/**
 * Formats a YYYY-MM-DD or ISO string into a human-readable date.
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString || '';
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD.
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Automatically calculates revisedEndDate = originalEndDate + extensionDays.
 */
export function calculateRevisedEndDate(originalEndDate?: string, extensionDays?: number): string {
  if (!originalEndDate) return '';
  const days = Number(extensionDays) || 0;
  if (days <= 0) return '';

  try {
    const parts = originalEndDate.split('-');
    if (parts.length !== 3) return '';
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const d = new Date(year, month, day);
    d.setDate(d.getDate() + days);

    const resYear = d.getFullYear();
    const resMonth = String(d.getMonth() + 1).padStart(2, '0');
    const resDay = String(d.getDate()).padStart(2, '0');

    return `${resYear}-${resMonth}-${resDay}`;
  } catch {
    return '';
  }
}

/**
 * Determines effective end date:
 * Returns revisedEndDate if an extension is active, otherwise originalEndDate.
 */
export function getEffectiveEndDate(
  originalEndDate?: string,
  revisedEndDate?: string,
  extensionPeriod?: number
): string | undefined {
  if (extensionPeriod && extensionPeriod > 0 && revisedEndDate) {
    return revisedEndDate;
  }
  return originalEndDate || undefined;
}

/**
 * Check if a ticket is overdue:
 * Overdue when Status != CLOSED AND Effective End Date < Today
 * Closed tickets are never overdue!
 */
export function isTicketOverdue(
  status: TicketStatus,
  originalEndDate?: string,
  revisedEndDate?: string,
  extensionPeriod?: number
): boolean {
  if (status === 'CLOSED') return false;

  const effectiveEnd = getEffectiveEndDate(originalEndDate, revisedEndDate, extensionPeriod);
  if (!effectiveEnd) return false;

  const todayStr = getTodayString();
  return effectiveEnd < todayStr;
}

/**
 * Calculate difference in days from today to the effective end date.
 * Negative number means days past deadline (overdue).
 */
export function getDaysRemaining(effectiveEndDate?: string): number | null {
  if (!effectiveEndDate) return null;
  try {
    const parts = effectiveEndDate.split('-');
    if (parts.length !== 3) return null;
    const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}
