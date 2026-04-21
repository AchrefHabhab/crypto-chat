'use client';

import { useState, useEffect, useReducer } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, Copy, LogOut, Trash2, Crown, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { getRoomMembers, leaveRoom, deleteRoom } from '@/lib/actions/member-actions';

interface MemberInfo {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  joinedAt: Date;
}

interface PanelState {
  open: boolean;
  members: MemberInfo[];
  loading: boolean;
}

type PanelAction =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'loaded'; members: MemberInfo[] }
  | { type: 'loading' };

function panelReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action.type) {
    case 'open':
      return { ...state, open: true };
    case 'close':
      return { ...state, open: false };
    case 'loading':
      return { ...state, loading: true };
    case 'loaded':
      return { ...state, loading: false, members: action.members };
  }
}

interface RoomSettingsProps {
  roomId: string;
  roomName: string;
  inviteCode: string;
  currentUserId: string;
}

export function RoomSettings({
  roomId,
  roomName,
  inviteCode,
  currentUserId,
}: RoomSettingsProps) {
  const [state, dispatch] = useReducer(panelReducer, {
    open: false,
    members: [],
    loading: false,
  });
  const [actionPending, setActionPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!state.open) return;
    dispatch({ type: 'loading' });

    getRoomMembers(roomId).then((result) => {
      if (result.success && result.data) {
        dispatch({ type: 'loaded', members: result.data });
      }
    });
  }, [state.open, roomId]);

  const isAdmin = state.members.some(
    (m) => m.id === currentUserId && m.role === 'admin'
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success(`Copied: ${inviteCode}`);
  };

  const handleLeave = async () => {
    setActionPending(true);
    const result = await leaveRoom(roomId);
    if (result.success) {
      toast.success('Left room');
      router.push('/chat');
    } else {
      toast.error(result.error ?? 'Failed to leave');
    }
    setActionPending(false);
  };

  const handleDelete = async () => {
    setActionPending(true);
    const result = await deleteRoom(roomId);
    if (result.success) {
      toast.success('Room deleted');
      router.push('/chat');
    } else {
      toast.error(result.error ?? 'Failed to delete');
    }
    setActionPending(false);
  };

  return (
    <>
      <button
        onClick={() => dispatch({ type: 'open' })}
        className="flex size-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
      >
        <Settings className="size-4" />
      </button>

      <AnimatePresence>
        {state.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => dispatch({ type: 'close' })}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-neutral-800 bg-neutral-950"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                <h2 className="text-sm font-semibold">Room Settings</h2>
                <button
                  onClick={() => dispatch({ type: 'close' })}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <p className="mb-1 text-xs font-medium text-neutral-500">Room Name</p>
                  <p className="text-sm">{roomName}</p>
                </div>

                {inviteCode && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-neutral-500">Invite Code</p>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 font-mono text-sm tracking-widest transition-colors hover:border-emerald-500"
                    >
                      <Copy className="size-3.5 text-neutral-500" />
                      {inviteCode}
                    </button>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-500">
                    Members ({state.members.length})
                  </p>
                  {state.loading ? (
                    <Loader2 className="size-4 animate-spin text-neutral-600" />
                  ) : (
                    <div className="space-y-2">
                      {state.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2.5 rounded-lg border border-neutral-800 px-3 py-2"
                        >
                          <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-700 bg-neutral-800">
                            {member.image ? (
                              <Image
                                src={member.image}
                                alt={member.name ?? ''}
                                width={28}
                                height={28}
                                className="size-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] font-medium text-neutral-400">
                                {(member.name ?? '?').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium">
                              {member.name ?? 'Anonymous'}
                              {member.id === currentUserId && (
                                <span className="ml-1 text-neutral-500">(you)</span>
                              )}
                            </p>
                          </div>
                          {member.role === 'admin' && (
                            <Crown className="size-3.5 text-amber-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-neutral-800 p-4 space-y-2">
                <button
                  onClick={handleLeave}
                  disabled={actionPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-sm text-neutral-400 transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                >
                  {actionPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  Leave Room
                </button>
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    disabled={actionPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {actionPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Delete Room
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
