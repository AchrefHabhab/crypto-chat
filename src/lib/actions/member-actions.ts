'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import type { ActionResult } from '@/types/action-result';

interface MemberInfo {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  joinedAt: Date;
}

export async function getRoomMembers(
  roomId: string
): Promise<ActionResult<MemberInfo[]>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const members = await db.roomMember.findMany({
      where: { roomId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { joinedAt: 'asc' },
    });

    const data = members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      image: m.user.image,
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    return { success: true, data };
  } catch {
    return { success: false, error: 'Failed to load members' };
  }
}

export async function leaveRoom(
  roomId: string
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const member = await db.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    if (!member) return { success: false, error: 'Not a member' };

    await db.roomMember.delete({
      where: { userId_roomId: { userId, roomId } },
    });

    revalidatePath('/chat');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to leave room' };
  }
}

export async function deleteRoom(
  roomId: string
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const member = await db.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    if (!member || member.role !== 'admin') {
      return { success: false, error: 'Only admins can delete rooms' };
    }

    await db.room.delete({ where: { id: roomId } });

    revalidatePath('/chat');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete room' };
  }
}
