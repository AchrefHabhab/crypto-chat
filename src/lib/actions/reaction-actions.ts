'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import type { ActionResult } from '@/types/action-result';

export async function toggleReaction(
  messageId: string,
  emoji: string,
  roomId: string
): Promise<ActionResult<{ added: boolean }>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const existing = await db.reaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
    });

    if (existing) {
      await db.reaction.delete({ where: { id: existing.id } });
      revalidatePath(`/chat/${roomId}`);
      return { success: true, data: { added: false } };
    }

    await db.reaction.create({
      data: { messageId, userId, emoji },
    });

    revalidatePath(`/chat/${roomId}`);
    return { success: true, data: { added: true } };
  } catch {
    return { success: false, error: 'Failed to toggle reaction' };
  }
}
