'use client';

import { useState, useRef, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { sendMessage } from '@/lib/actions/message-actions';
import { useSocket } from '@/providers/socket-provider';

interface MessageData {
  id: string;
  ciphertext: string;
  iv: string;
  signature: string;
  prevHash: string;
  hash: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ChatInputProps {
  roomId: string;
  currentUserId: string;
  userName?: string;
  encrypt: (plaintext: string, senderId: string) => Promise<{
    ciphertext: string;
    iv: string;
    signature: string;
    prevHash: string;
    hash: string;
  }>;
  onMessageSent: (message: MessageData) => void;
}

export function ChatInput({ roomId, currentUserId, userName, encrypt, onMessageSent }: ChatInputProps) {
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const { socket } = useSocket();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitTyping = useCallback(() => {
    if (!socket) return;
    socket.emit('typing-start', { roomId, userName: userName ?? 'Someone' });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', { roomId });
    }, 2000);
  }, [socket, roomId, userName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setPending(true);

    try {
      const encrypted = await encrypt(trimmed, currentUserId);

      const result = await sendMessage(
        roomId,
        encrypted.ciphertext,
        encrypted.iv,
        encrypted.signature,
        encrypted.prevHash,
        encrypted.hash
      );

      if (result.success && result.data) {
        const message: MessageData = {
          id: result.data.id,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          signature: encrypted.signature,
          prevHash: encrypted.prevHash,
          hash: encrypted.hash,
          createdAt: new Date(),
          sender: { id: currentUserId, name: null, image: null },
        };

        onMessageSent(message);
        socket?.emit('message', { roomId, message });
        setText('');
      } else {
        toast.error(result.error ?? 'Failed to send');
      }
    } catch {
      toast.error('Encryption failed');
    }

    setPending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-neutral-800 px-4 py-3"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (e.target.value.trim()) emitTyping();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={pending}
        className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-emerald-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={pending || !text.trim()}
        className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white transition-opacity disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </button>
    </form>
  );
}
