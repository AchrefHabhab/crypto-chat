'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { createRoom } from '@/lib/actions/room-actions';

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateRoomDialog({ open, onClose }: CreateRoomDialogProps) {
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    const result = await createRoom(name);

    if (result.success) {
      toast.success('Room created!');
      setName('');
      onClose();
    } else {
      toast.error(result.error ?? 'Something went wrong');
    }

    setPending(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-neutral-500 transition-colors hover:text-neutral-300"
            >
              <X className="size-5" />
            </button>

            <h2 className="text-lg font-semibold">Create a Room</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Start a new encrypted conversation.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Room name..."
                autoFocus
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={pending || name.trim().length < 2}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                {pending ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
