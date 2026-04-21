'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { joinByCode } from '@/lib/actions/room-actions';

interface JoinRoomDialogProps {
  open: boolean;
  onClose: () => void;
}

export function JoinRoomDialog({ open, onClose }: JoinRoomDialogProps) {
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setPending(true);

    const result = await joinByCode(code);

    if (result.success && result.data) {
      toast.success(`Joined "${result.data.roomName}"`);
      onClose();
      setCode('');
      router.push(`/chat/${result.data.roomId}`);
    } else {
      toast.error(result.error ?? 'Failed to join');
    }

    setPending(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold">Join Room</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character invite code"
                maxLength={6}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-center text-lg font-mono tracking-widest outline-none transition-colors placeholder:text-neutral-500 placeholder:text-sm placeholder:tracking-normal placeholder:font-sans focus:border-emerald-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm transition-colors hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || code.trim().length < 6}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                  Join
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
