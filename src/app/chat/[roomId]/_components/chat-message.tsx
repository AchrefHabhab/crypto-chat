'use client';

import { useEffect, useReducer } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, ShieldAlert, FileDown, Reply } from 'lucide-react';

import { cn, formatTimestamp } from '@/lib/utils';
import { decryptMessage } from '@/lib/crypto/encrypt';

import { MessageReactions } from './message-reactions';

interface ReactionData {
  id: string;
  emoji: string;
  userId: string;
}

interface MessageProps {
  message: {
    id: string;
    ciphertext: string;
    iv: string;
    hash: string;
    prevHash: string;
    fileUrl: string | null;
    fileName: string | null;
    fileType: string | null;
    replyTo: {
      id: string;
      ciphertext: string;
      iv: string;
      sender: { name: string | null };
    } | null;
    createdAt: Date;
    sender: {
      id: string;
      name: string | null;
      image: string | null;
    };
    reactions: ReactionData[];
  };
  roomId: string;
  currentUserId: string;
  isOwn: boolean;
  index: number;
  onReply: () => void;
}

interface DecryptState {
  text: string;
  encrypted: boolean;
}

type DecryptAction =
  | { type: 'decrypted'; text: string }
  | { type: 'failed' };

function decryptReducer(_state: DecryptState, action: DecryptAction): DecryptState {
  switch (action.type) {
    case 'decrypted':
      return { text: action.text, encrypted: true };
    case 'failed':
      return { text: '[encrypted message]', encrypted: true };
  }
}

export function ChatMessage({ message, roomId, currentUserId, isOwn, index, onReply }: MessageProps) {
  const isEncrypted = message.iv !== 'plaintext';

  const [state, dispatch] = useReducer(decryptReducer, {
    text: isEncrypted ? '...' : message.ciphertext,
    encrypted: isEncrypted,
  });

  useEffect(() => {
    if (!isEncrypted) return;

    decryptMessage(message.ciphertext, message.iv)
      .then((text) => dispatch({ type: 'decrypted', text }))
      .catch(() => dispatch({ type: 'failed' }));
  }, [message.ciphertext, message.iv, isEncrypted]);

  const hasHash = message.hash !== 'unhashed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
      className={cn('group flex gap-2', isOwn ? 'justify-end' : 'justify-start')}
    >
      {!isOwn && (
        <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-700 bg-neutral-800">
          {message.sender.image ? (
            <Image
              src={message.sender.image}
              alt={message.sender.name ?? ''}
              width={28}
              height={28}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-medium text-neutral-400">
              {(message.sender.name ?? '?').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5',
          isOwn
            ? 'rounded-br-md bg-gradient-to-br from-emerald-600 to-cyan-600 text-white'
            : 'rounded-bl-md border border-neutral-800 bg-neutral-900'
        )}
      >
        {!isOwn && (
          <p className="mb-0.5 text-xs font-medium text-emerald-400">
            {message.sender.name ?? 'Anonymous'}
          </p>
        )}
        {message.replyTo && (
          <div
            className={cn(
              'mb-2 rounded-lg border-l-2 px-2.5 py-1.5 text-[11px]',
              isOwn
                ? 'border-white/30 bg-white/10'
                : 'border-emerald-500/50 bg-emerald-500/5'
            )}
          >
            <p className="font-medium text-emerald-400">
              {message.replyTo.sender.name ?? 'Anonymous'}
            </p>
            <p className={cn('truncate', isOwn ? 'text-white/70' : 'text-neutral-400')}>
              {message.replyTo.iv !== 'plaintext' ? '[encrypted]' : message.replyTo.ciphertext}
            </p>
          </div>
        )}
        {message.fileUrl && message.fileType?.startsWith('image/') && (
          <div className="mb-2 overflow-hidden rounded-lg">
            <Image
              src={message.fileUrl}
              alt={message.fileName ?? 'Image'}
              width={280}
              height={180}
              className="max-h-48 max-w-[280px] rounded-lg object-cover"
              unoptimized
            />
          </div>
        )}
        {message.fileUrl && !message.fileType?.startsWith('image/') && (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'mb-2 flex items-center gap-2 rounded-lg border p-2 text-xs transition-colors',
              isOwn
                ? 'border-white/20 hover:bg-white/10'
                : 'border-neutral-700 hover:bg-neutral-800'
            )}
          >
            <FileDown className="size-4 shrink-0" />
            <span className="truncate">{message.fileName ?? 'Download file'}</span>
          </a>
        )}
        <p className="text-sm leading-relaxed">{state.text}</p>
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1.5 text-[10px]',
            isOwn ? 'text-white/60' : 'text-neutral-600'
          )}
        >
          {isEncrypted && (
            <Lock className="size-2.5" />
          )}
          {hasHash ? (
            <ShieldCheck className="size-2.5 text-emerald-400" />
          ) : (
            <ShieldAlert className="size-2.5 text-neutral-600" />
          )}
          {formatTimestamp(new Date(message.createdAt))}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1 self-center opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onReply}
          className="flex size-6 items-center justify-center rounded-full border border-neutral-800 text-neutral-500 transition-colors hover:border-emerald-500 hover:text-emerald-400"
        >
          <Reply className="size-3" />
        </button>
      </div>
      <MessageReactions
        messageId={message.id}
        roomId={roomId}
        reactions={message.reactions}
        currentUserId={currentUserId}
      />
    </motion.div>
  );
}
