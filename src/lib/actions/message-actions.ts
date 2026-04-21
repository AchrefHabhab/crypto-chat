'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import type { ActionResult } from '@/types/action-result';

interface ReactionData {
  id: string;
  emoji: string;
  userId: string;
}

interface MessageWithSender {
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
  reactions: ReactionData[];
}

export async function getMessages(
  roomId: string
): Promise<ActionResult<MessageWithSender[]>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const member = await db.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    if (!member) return { success: false, error: 'Not a member of this room' };

    const messages = await db.message.findMany({
      where: { roomId },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        reactions: { select: { id: true, emoji: true, userId: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return { success: true, data: messages };
  } catch {
    return { success: false, error: 'Failed to load messages' };
  }
}

export async function sendMessage(
  roomId: string,
  ciphertext: string,
  iv: string,
  signature: string,
  prevHash: string,
  hash: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const member = await db.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    if (!member) return { success: false, error: 'Not a member of this room' };

    const message = await db.message.create({
      data: {
        roomId,
        senderId: userId,
        ciphertext,
        iv,
        signature,
        prevHash,
        hash,
      },
    });

    await db.room.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    revalidatePath(`/chat/${roomId}`);
    return { success: true, data: { id: message.id } };
  } catch {
    return { success: false, error: 'Failed to send message' };
  }
}
