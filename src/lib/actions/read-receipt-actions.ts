'use server';

import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import type { ActionResult } from '@/types/action-result';

export async function markRoomAsRead(
  roomId: string
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    await db.roomMember.update({
      where: { userId_roomId: { userId, roomId } },
      data: { lastReadAt: new Date() },
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to mark as read' };
  }
}

interface UnreadCount {
  roomId: string;
  count: number;
}

export async function getUnreadCounts(): Promise<ActionResult<UnreadCount[]>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const memberships = await db.roomMember.findMany({
      where: { userId },
      select: {
        roomId: true,
        lastReadAt: true,
        room: {
          select: {
            messages: {
              where: { senderId: { not: userId } },
              select: { createdAt: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    const counts = memberships.map((m) => ({
      roomId: m.roomId,
      count: m.room.messages.filter((msg) => msg.createdAt > m.lastReadAt).length,
    }));

    return { success: true, data: counts };
  } catch {
    return { success: false, error: 'Failed to get unread counts' };
  }
}
