'use client';

import { useRef, useEffect, useReducer, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Users } from 'lucide-react';

import { useSocket } from '@/providers/socket-provider';

import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';
import { ChainInspector } from './chain-inspector';
import { OnlineBadge } from './online-badge';
import { RoomSettings } from './room-settings';
import { useCrypto } from './hooks/use-crypto';
import { markRoomAsRead } from '@/lib/actions/read-receipt-actions';

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
}

interface Message {
  id: string;
  ciphertext: string;
  iv: string;
  signature: string;
  prevHash: string;
  hash: string;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  reactions: Reaction[];
}

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  inviteCode: string;
  memberCount: number;
  initialMessages: Message[];
  currentUserId: string;
  currentUserName: string;
}

type MessageAction =
  | { type: 'add'; message: Message }
  | { type: 'init'; messages: Message[] };

function messagesReducer(state: Message[], action: MessageAction): Message[] {
  switch (action.type) {
    case 'init':
      return action.messages;
    case 'add':
      return [...state, action.message];
  }
}

export function ChatRoom({
  roomId,
  roomName,
  inviteCode,
  memberCount,
  initialMessages,
  currentUserId,
  currentUserName,
}: ChatRoomProps) {
  const [messages, dispatch] = useReducer(messagesReducer, initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { socket, joinRoom, leaveRoom } = useSocket();
  const { ready: cryptoReady, encrypt, decrypt } = useCrypto();

  useEffect(() => {
    joinRoom(roomId);
    markRoomAsRead(roomId);
    return () => leaveRoom(roomId);
  }, [roomId, joinRoom, leaveRoom]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (raw: Partial<Message> & { id: string }) => {
      const message: Message = {
        id: raw.id,
        ciphertext: raw.ciphertext ?? '',
        iv: raw.iv ?? 'plaintext',
        signature: raw.signature ?? '',
        prevHash: raw.prevHash ?? '',
        hash: raw.hash ?? 'unhashed',
        fileUrl: raw.fileUrl ?? null,
        fileName: raw.fileName ?? null,
        fileType: raw.fileType ?? null,
        createdAt: raw.createdAt ?? new Date(),
        sender: raw.sender ?? { id: '', name: null, image: null },
        reactions: raw.reactions ?? [],
      };
      dispatch({ type: 'add', message });
    };

    socket.on('message', handleMessage);
    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleMessageSent = useCallback((message: Message) => {
    dispatch({ type: 'add', message });
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
        <Link
          href="/chat"
          className="rounded-lg p-1.5 transition-colors hover:bg-neutral-800"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
          <Shield className="size-4 text-emerald-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="truncate text-sm font-semibold">{roomName}</h1>
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <Users className="size-3" />
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>

        <OnlineBadge />
        <RoomSettings
          roomId={roomId}
          roomName={roomName}
          inviteCode={inviteCode}
          currentUserId={currentUserId}
        />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full items-center justify-center"
          >
            <p className="text-sm text-neutral-600">
              No messages yet. Start the conversation!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                roomId={roomId}
                currentUserId={currentUserId}
                isOwn={msg.sender.id === currentUserId}
                index={i}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChainInspector
        messages={messages.map((m) => ({
          id: m.id,
          hash: m.hash,
          prevHash: m.prevHash,
          ciphertext: m.ciphertext,
          senderName: m.sender.name ?? 'Anonymous',
          createdAt: m.createdAt,
        }))}
      />

      <TypingIndicator roomId={roomId} />

      <ChatInput
        roomId={roomId}
        currentUserId={currentUserId}
        userName={currentUserName}
        encrypt={encrypt}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}
