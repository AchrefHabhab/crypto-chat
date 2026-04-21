'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Users, LogIn, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { CreateRoomDialog } from './create-room-dialog';
import { JoinRoomDialog } from './join-room-dialog';

interface Room {
  id: string;
  name: string;
  type: string;
  inviteCode: string;
  memberCount: number;
}

interface RoomListProps {
  rooms: Room[];
  unreadMap: Record<string, number>;
}

export function RoomList({ rooms, unreadMap }: RoomListProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const copyInviteCode = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-400">Your Rooms</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setJoinOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-800"
            >
              <LogIn className="size-3.5" />
              Join
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-700"
            >
              <Plus className="size-3.5" />
              New
            </button>
          </div>
        </div>

        {rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-800 py-12 text-center"
          >
            <MessageSquare className="size-8 text-neutral-600" />
            <p className="text-sm text-neutral-500">No rooms yet.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setJoinOpen(true)}
                className="rounded-lg border border-neutral-700 px-4 py-2 text-xs font-medium"
              >
                Join a room
              </button>
              <button
                onClick={() => setCreateOpen(true)}
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-medium text-white"
              >
                Create a room
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {rooms.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/chat/${room.id}`}
                  className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3 transition-all hover:border-neutral-700 hover:bg-neutral-800/50"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                    <MessageSquare className="size-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{room.name}</p>
                    <p className="flex items-center gap-1 text-xs text-neutral-500">
                      <Users className="size-3" />
                      {room.memberCount} {room.memberCount === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                  {unreadMap[room.id] && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                      {unreadMap[room.id]}
                    </span>
                  )}
                  {room.inviteCode && (
                    <button
                      onClick={(e) => copyInviteCode(room.inviteCode, e)}
                      className="flex items-center gap-1 rounded-lg border border-neutral-700 px-2 py-1 text-[10px] font-mono text-neutral-400 transition-colors hover:border-emerald-500 hover:text-emerald-400"
                    >
                      <Copy className="size-3" />
                      {room.inviteCode}
                    </button>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateRoomDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <JoinRoomDialog
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
      />
    </>
  );
}
