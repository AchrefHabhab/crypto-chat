'use client';

import { useSocket } from '@/providers/socket-provider';

export function OnlineBadge() {
  const { isConnected } = useSocket();

  return (
    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
      <span
        className={
          isConnected
            ? 'size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
            : 'size-2 rounded-full bg-neutral-600'
        }
      />
      {isConnected ? 'Online' : 'Offline'}
    </span>
  );
}
