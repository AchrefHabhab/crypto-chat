'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SmilePlus } from 'lucide-react';

import { toggleReaction } from '@/lib/actions/reaction-actions';
import { cn } from '@/lib/utils';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '🔥', '👀', '🎉'];

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
}

interface MessageReactionsProps {
  messageId: string;
  roomId: string;
  reactions: Reaction[];
  currentUserId: string;
}

export function MessageReactions({
  messageId,
  roomId,
  reactions,
  currentUserId,
}: MessageReactionsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const grouped = reactions.reduce<Record<string, string[]>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r.userId);
    return acc;
  }, {});

  const handleReact = async (emoji: string) => {
    setPickerOpen(false);
    await toggleReaction(messageId, emoji, roomId);
  };

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {Object.entries(grouped).map(([emoji, userIds]) => {
        const hasReacted = userIds.includes(currentUserId);
        return (
          <motion.button
            key={emoji}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => handleReact(emoji)}
            className={cn(
              'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
              hasReacted
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
            )}
          >
            <span>{emoji}</span>
            <span className={cn('text-[10px]', hasReacted ? 'text-emerald-400' : 'text-neutral-500')}>
              {userIds.length}
            </span>
          </motion.button>
        );
      })}

      <div className="relative">
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className="flex size-6 items-center justify-center rounded-full border border-neutral-800 text-neutral-600 transition-colors hover:border-neutral-600 hover:text-neutral-400"
        >
          <SmilePlus className="size-3" />
        </button>

        <AnimatePresence>
          {pickerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setPickerOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-full left-0 z-50 mb-1 flex gap-1 rounded-xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-xl"
              >
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    className="rounded-lg p-1.5 text-sm transition-colors hover:bg-neutral-800"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
