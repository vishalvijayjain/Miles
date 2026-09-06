import React from 'react';
import { TicketPriority, TicketStatus, TicketType } from '../../types';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  Clock,
  CheckCircle2,
  Bookmark,
  Bug,
  Sparkles,
  User,
  HelpCircle,
  CalendarCheck,
  ShieldAlert,
} from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true, size = 'md' }) => {
  const config = {
    CRITICAL: {
      label: 'Critical',
      icon: AlertCircle,
      classes: 'bg-[#B85D52]/15 text-[#8A352C] border-[#B85D52]/35 dark:bg-[#B85D52]/25 dark:text-[#E29890] dark:border-[#B85D52]/40',
      dotColor: 'bg-[#B85D52]',
    },
    HIGH: {
      label: 'High',
      icon: ArrowUp,
      classes: 'bg-[#D4A373]/25 text-[#825325] border-[#D4A373]/45 dark:bg-[#D4A373]/20 dark:text-[#E6BA90] dark:border-[#D4A373]/40',
      dotColor: 'bg-[#D4A373]',
    },
    MEDIUM: {
      label: 'Medium',
      icon: Clock,
      classes: 'bg-[#8B9D83]/20 text-[#3C4E37] border-[#8B9D83]/40 dark:bg-[#8B9D83]/20 dark:text-[#B1C4AC] dark:border-[#8B9D83]/35',
      dotColor: 'bg-[#8B9D83]',
    },
    LOW: {
      label: 'Low',
      icon: Clock,
      classes: 'bg-[#EFEAE2] text-[#6B645B] border-[#D9D1C5] dark:bg-[#2B332A] dark:text-[#B2BDB0] dark:border-[#384337]',
      dotColor: 'bg-[#9E978D]',
    },
  }[priority];

  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${config.classes} ${padding}`}
      title={`Priority: ${config.label}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = {
    TODO: {
      label: 'To Do',
      classes: 'bg-[#EFEAE2] text-[#5A554E] border-[#D9D1C5] dark:bg-[#2B332A] dark:text-[#C2C9BF] dark:border-[#384337]',
      dot: 'bg-[#9E978D] dark:bg-[#7D887A]',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      classes: 'bg-[#8B9D83]/20 text-[#364931] border-[#8B9D83]/40 dark:bg-[#8B9D83]/20 dark:text-[#B1C4AC] dark:border-[#8B9D83]/35',
      dot: 'bg-[#8B9D83]',
    },
    CLOSED: {
      label: 'Closed',
      classes: 'bg-[#4A5D44]/15 text-[#2F3E2B] border-[#4A5D44]/30 dark:bg-[#4A5D44]/30 dark:text-[#C4D6BE] dark:border-[#4A5D44]/40',
      dot: 'bg-[#4A5D44] dark:bg-[#8B9D83]',
    },
  }[status];

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap ${config.classes} ${padding}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

interface TypeBadgeProps {
  type: TicketType;
  size?: 'sm' | 'md';
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'md' }) => {
  const config = {
    TASK: {
      label: 'Task',
      icon: Bookmark,
      classes: 'text-[#364532] dark:text-[#B1C4AC] bg-[#4A5D44]/15 dark:bg-[#4A5D44]/30 border-[#4A5D44]/30 dark:border-[#4A5D44]/40',
    },
    BUG: {
      label: 'Bug',
      icon: Bug,
      classes: 'text-[#8A352C] dark:text-[#E29890] bg-[#B85D52]/15 dark:bg-[#B85D52]/25 border-[#B85D52]/35 dark:border-[#B85D52]/40',
    },
    IMPROVEMENT: {
      label: 'Improvement',
      icon: Sparkles,
      classes: 'text-[#7B4C20] dark:text-[#E6BA90] bg-[#D4A373]/20 dark:bg-[#D4A373]/20 border-[#D4A373]/40 dark:border-[#D4A373]/40',
    },
    PERSONAL: {
      label: 'Personal',
      icon: User,
      classes: 'text-[#504639] dark:text-[#C8C2B8] bg-[#766B5C]/15 dark:bg-[#766B5C]/25 border-[#766B5C]/30 dark:border-[#766B5C]/40',
    },
    OTHER: {
      label: 'Other',
      icon: HelpCircle,
      classes: 'text-[#6B645B] dark:text-[#B2BDB0] bg-[#EFEAE2] dark:bg-[#2B332A] border-[#D9D1C5] dark:border-[#384337]',
    },
  }[type];

  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border whitespace-nowrap ${config.classes} ${padding}`}
      title={`Type: ${config.label}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

export const BlockerBadge: React.FC<{ count?: number; text?: string; size?: 'sm' | 'md' }> = ({
  count,
  text,
  size = 'md',
}) => {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#B85D52]/40 bg-[#B85D52]/15 text-[#8A352C] dark:bg-[#B85D52]/25 dark:text-[#E29890] dark:border-[#B85D52]/50 ${padding}`}
      title={text ? `Blocker: ${text}` : 'Blocked by dependency'}
    >
      <ShieldAlert className="w-3.5 h-3.5 text-[#B85D52] shrink-0" />
      <span className="font-semibold">Blocked</span>
      {count !== undefined && count > 1 && (
        <span className="rounded-full bg-[#B85D52]/30 px-1 text-[10px] leading-tight font-bold">
          {count}
        </span>
      )}
    </span>
  );
};

export const ExtensionBadge: React.FC<{ days: number; revisedDate?: string; size?: 'sm' | 'md' }> = ({
  days,
  revisedDate,
  size = 'md',
}) => {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#D4A373]/50 bg-[#D4A373]/20 text-[#76481E] dark:bg-[#D4A373]/20 dark:text-[#E6BA90] dark:border-[#D4A373]/45 ${padding}`}
      title={revisedDate ? `Extended by +${days}d (New target: ${revisedDate})` : `Extended by +${days} days`}
    >
      <CalendarCheck className="w-3.5 h-3.5 text-[#D4A373] shrink-0" />
      <span className="font-medium">+{days}d Extended</span>
    </span>
  );
};

export const OverdueBadge: React.FC<{ daysOverdue?: number | null; size?: 'sm' | 'md' }> = ({
  daysOverdue,
  size = 'md',
}) => {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-semibold';
  const label = daysOverdue !== null && daysOverdue !== undefined && daysOverdue < 0
    ? `${Math.abs(daysOverdue)}d Overdue`
    : 'Overdue';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#C04E40]/40 bg-[#C04E40]/15 text-[#85291E] dark:bg-[#C04E40]/25 dark:text-[#E89C94] dark:border-[#C04E40]/50 ${padding}`}
      title="Past effective end date"
    >
      <AlertTriangle className="w-3.5 h-3.5 text-[#C04E40] shrink-0" />
      <span>{label}</span>
    </span>
  );
};
