'use client';

import { useEffect, useReducer } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, ShieldAlert } from 'lucide-react';

import { cn, formatTimestamp } from '@/lib/utils';
import { decryptMessage } from '@/lib/crypto/encrypt';

interface MessageProps {
  message: {
    id: string;
    ciphertext: string;
    iv: string;
    hash: string;
    prevHash: string;
    createdAt: Date;
    sender: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
  isOwn: boolean;
  index: number;
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

export function ChatMessage({ message, isOwn, index }: MessageProps) {
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
      className={cn('flex gap-2', isOwn ? 'justify-end' : 'justify-start')}
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
    </motion.div>
  );
}
