import { Ticket } from '../types';
import { calculateRevisedEndDate, getTodayString } from './dateUtils';

/**
 * Generates sample demo tickets demonstrating:
 * 1. To Do (clean upcoming work item)
 * 2. In Progress with Active Blocker (demonstrates blocker badge & reason)
 * 3. In Progress with Extension (demonstrates extension indicator & revised deadline)
 * 4. Overdue Ticket (demonstrates overdue alert & calculation)
 * 5. Closed / Completed Ticket (demonstrates subdued appearance & closed state)
 */
export function getDemoTickets(profileId: string): Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'closedAt' | 'ticketNumber'>[] {
  const today = new Date();
  
  // Format helpers
  const toDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const dayMinus5 = new Date(today);
  dayMinus5.setDate(today.getDate() - 5);

  const dayMinus3 = new Date(today);
  dayMinus3.setDate(today.getDate() - 3);

  const dayMinus1 = new Date(today);
  dayMinus1.setDate(today.getDate() - 1);

  const dayPlus2 = new Date(today);
  dayPlus2.setDate(today.getDate() + 2);

  const dayPlus5 = new Date(today);
  dayPlus5.setDate(today.getDate() + 5);

  const dayPlus10 = new Date(today);
  dayPlus10.setDate(today.getDate() + 10);

  const originalOverdue = toDateStr(dayMinus1);
  const originalExtended = toDateStr(dayPlus2);
  const extensionDays = 4;
  const revisedExtended = calculateRevisedEndDate(originalExtended, extensionDays);

  return [
    {
      profileId,
      title: 'Architect storage abstraction and repository layer',
      description: 'Implement IStorageAdapter and concrete LocalStorageAdapter to decouple UI components from persistent storage.',
      status: 'CLOSED',
      priority: 'HIGH',
      type: 'TASK',
      startDate: toDateStr(dayMinus5),
      originalEndDate: toDateStr(dayMinus3),
      extensionPeriod: 0,
      revisedEndDate: undefined,
      blockers: [],
      notes: 'Completed ahead of schedule with clean SOLID repository pattern.',
      tags: ['Architecture', 'Core', 'V1'],
    },
    {
      profileId,
      title: 'Fix authentication cookie persistence on safari browsers',
      description: 'Investigate cross-domain cookie drop on Safari when ITP is activated during session restoration.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      type: 'BUG',
      startDate: toDateStr(dayMinus3),
      originalEndDate: toDateStr(dayPlus5),
      extensionPeriod: 0,
      revisedEndDate: undefined,
      blockers: ['Awaiting access to test devices from DevOps team'],
      notes: 'Reproduced in Safari 17.2 test sandbox.',
      tags: ['Security', 'Browser-Compat', 'P0'],
    },
    {
      profileId,
      title: 'Revamp Kanban card drag-and-drop animation & drop targets',
      description: 'Card layout shifted to modern accessible drag-and-drop with fallback select menus for full keyboard usability.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      type: 'IMPROVEMENT',
      startDate: toDateStr(dayMinus1),
      originalEndDate: originalExtended,
      extensionPeriod: extensionDays,
      revisedEndDate: revisedExtended,
      blockers: [],
      notes: 'Extended deadline by 4 days to polish responsive touch interactions on tablet.',
      tags: ['UX', 'Kanban', 'Accessibility'],
    },
    {
      profileId,
      title: 'Quarterly compliance and data retention report',
      description: 'Review data privacy guidelines, audit export logs, and verify compliance documentation.',
      status: 'TODO',
      priority: 'HIGH',
      type: 'TASK',
      startDate: toDateStr(dayMinus5),
      originalEndDate: originalOverdue, // Yesterday -> Overdue!
      extensionPeriod: 0,
      revisedEndDate: undefined,
      blockers: ['Pending sign-off from legal counsel'],
      notes: 'Requires urgent attention due to passed target date.',
      tags: ['Compliance', 'Audit'],
    },
    {
      profileId,
      title: 'Prepare Vercel deployment and GitHub repository workflow',
      description: 'Configure standard build scripts, environment variable placeholders, and production bundling verification.',
      status: 'TODO',
      priority: 'MEDIUM',
      type: 'TASK',
      startDate: getTodayString(),
      originalEndDate: toDateStr(dayPlus10),
      extensionPeriod: 0,
      revisedEndDate: undefined,
      blockers: [],
      notes: 'Follow standard GitHub to Vercel continuous deployment flow.',
      tags: ['DevOps', 'Deployment'],
    },
  ];
}
