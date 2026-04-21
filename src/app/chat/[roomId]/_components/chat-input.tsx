'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Send, Loader2, Paperclip, X, Reply } from 'lucide-react';
import { toast } from 'sonner';

import { sendMessage } from '@/lib/actions/message-actions';
import { useSocket } from '@/providers/socket-provider';

interface ReplyTo {
  id: string;
  ciphertext: string;
  iv: string;
  senderName: string;
}

interface MessageData {
  id: string;
  ciphertext: string;
  iv: string;
  signature: string;
  prevHash: string;
  hash: string;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  replyTo: { id: string; ciphertext: string; iv: string; sender: { name: string | null } } | null;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  reactions: { id: string; emoji: string; userId: string }[];
}

interface PendingFile {
  file: File;
  preview: string | null;
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
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
}

export function ChatInput({ roomId, currentUserId, userName, encrypt, onMessageSent, replyTo, onCancelReply }: ChatInputProps) {
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [dragging, setDragging] = useState(false);
  const { socket } = useSocket();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emitTyping = useCallback(() => {
    if (!socket) return;
    socket.emit('typing-start', { roomId, userName: userName ?? 'Someone' });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', { roomId });
    }, 2000);
  }, [socket, roomId, userName]);

  const attachFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setPendingFile({ file, preview });
  }, []);

  const clearFile = useCallback(() => {
    if (pendingFile?.preview) URL.revokeObjectURL(pendingFile.preview);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [pendingFile]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) attachFile(file);
    },
    [attachFile]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !pendingFile) return;

    setPending(true);

    const capturedFile = pendingFile;
    const capturedText = trimmed;

    try {
      const plaintext = capturedText || (capturedFile ? `[file: ${capturedFile.file.name}]` : '');
      const encrypted = await encrypt(plaintext, currentUserId);

      const capturedReply = replyTo;

      const optimisticMessage: MessageData = {
        id: `temp-${Date.now()}`,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        signature: encrypted.signature,
        prevHash: encrypted.prevHash,
        hash: encrypted.hash,
        fileUrl: capturedFile?.preview ?? null,
        fileName: capturedFile?.file.name ?? null,
        fileType: capturedFile?.file.type ?? null,
        replyTo: capturedReply ? { id: capturedReply.id, ciphertext: capturedReply.ciphertext, iv: capturedReply.iv, sender: { name: capturedReply.senderName } } : null,
        createdAt: new Date(),
        sender: { id: currentUserId, name: null, image: null },
        reactions: [],
      };

      onMessageSent(optimisticMessage);
      setText('');
      clearFile();
      onCancelReply();
      setPending(false);

      let fileData: { url: string; name: string; type: string } | undefined;

      if (capturedFile) {
        const form = new FormData();
        form.append('file', capturedFile.file);
        form.append('roomId', roomId);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const json = await res.json() as { url?: string; name?: string; type?: string; error?: string };
        if (!res.ok) {
          toast.error(json.error ?? 'Upload failed');
          return;
        }
        fileData = { url: json.url!, name: json.name!, type: json.type! };
      }

      const result = await sendMessage(
        roomId,
        encrypted.ciphertext,
        encrypted.iv,
        encrypted.signature,
        encrypted.prevHash,
        encrypted.hash,
        fileData,
        capturedReply?.id
      );

      if (result.success && result.data) {
        const finalMessage: MessageData = {
          id: result.data.id,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          signature: encrypted.signature,
          prevHash: encrypted.prevHash,
          hash: encrypted.hash,
          fileUrl: fileData?.url ?? capturedFile?.preview ?? null,
          fileName: fileData?.name ?? null,
          fileType: fileData?.type ?? null,
          replyTo: capturedReply ? { id: capturedReply.id, ciphertext: capturedReply.ciphertext, iv: capturedReply.iv, sender: { name: capturedReply.senderName } } : null,
          createdAt: new Date(),
          sender: { id: currentUserId, name: null, image: null },
          reactions: [],
        };

        socket?.emit('message', { roomId, message: finalMessage });
      } else {
        toast.error(result.error ?? 'Failed to send');
      }
    } catch {
      toast.error('Failed to send');
      setPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-t border-neutral-800 ${dragging ? 'bg-emerald-500/5' : ''}`}
    >
      {replyTo && (
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2">
          <Reply className="size-3.5 text-emerald-400" />
          <div className="flex-1 min-w-0 rounded-lg border-l-2 border-emerald-500 bg-emerald-500/5 px-2.5 py-1">
            <p className="text-[11px] font-medium text-emerald-400">{replyTo.senderName}</p>
            <p className="truncate text-[11px] text-neutral-400">
              {replyTo.iv !== 'plaintext' ? '[encrypted]' : replyTo.ciphertext}
            </p>
          </div>
          <button onClick={onCancelReply} className="text-neutral-500 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}
      {pendingFile && (
        <div className="flex items-center gap-2 px-4 pt-3">
          {pendingFile.preview ? (
            <Image
              src={pendingFile.preview}
              alt="Preview"
              width={48}
              height={48}
              className="size-12 rounded-lg border border-neutral-700 object-cover"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800">
              <Paperclip className="size-4 text-neutral-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium">{pendingFile.file.name}</p>
            <p className="text-[10px] text-neutral-500">
              {(pendingFile.file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button onClick={clearFile} className="text-neutral-500 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) attachFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-700 text-neutral-400 transition-colors hover:border-emerald-500 hover:text-emerald-400"
        >
          <Paperclip className="size-4" />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) emitTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={pendingFile ? 'Add a caption...' : 'Type a message...'}
          disabled={pending}
          className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-neutral-500 focus:border-emerald-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || (!text.trim() && !pendingFile)}
          className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white transition-opacity disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </button>
      </form>
    </div>
  );
}
