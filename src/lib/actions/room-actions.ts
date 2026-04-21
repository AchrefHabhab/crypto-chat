'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import type { ActionResult } from '@/types/action-result';

export async function getRooms(): Promise<ActionResult<RoomWithMemberCount[]>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const rooms = await db.room.findMany({
      where: { members: { some: { userId } } },
      include: { _count: { select: { members: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    const data = rooms.map((room) => ({
      id: room.id,
      name: room.name,
      type: room.type,
      inviteCode: room.inviteCode ?? '',
      memberCount: room._count.members,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    }));

    return { success: true, data };
  } catch {
    return { success: false, error: 'Failed to load rooms' };
  }
}

export async function createRoom(
  name: string
): Promise<ActionResult<{ id: string; inviteCode: string }>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      return { success: false, error: 'Room name must be at least 2 characters' };
    }

    const inviteCode = generateInviteCode();

    const room = await db.room.create({
      data: {
        name: trimmed,
        type: 'group',
        inviteCode,
        members: {
          create: { userId, role: 'admin' },
        },
      },
    });

    revalidatePath('/chat');
    return { success: true, data: { id: room.id, inviteCode } };
  } catch {
    return { success: false, error: 'Failed to create room' };
  }
}

export async function joinRoom(
  roomId: string
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const room = await db.room.findUnique({ where: { id: roomId } });
    if (!room) return { success: false, error: 'Room not found' };

    await db.roomMember.upsert({
      where: { userId_roomId: { userId, roomId } },
      create: { userId, roomId },
      update: {},
    });

    revalidatePath('/chat');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to join room' };
  }
}

export async function joinByCode(
  code: string
): Promise<ActionResult<{ roomId: string; roomName: string }>> {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return { success: false, error: 'Invite code is required' };

    const room = await db.room.findUnique({
      where: { inviteCode: trimmed },
    });
    if (!room) return { success: false, error: 'Invalid invite code' };

    await db.roomMember.upsert({
      where: { userId_roomId: { userId, roomId: room.id } },
      create: { userId, roomId: room.id },
      update: {},
    });

    revalidatePath('/chat');
    return { success: true, data: { roomId: room.id, roomName: room.name } };
  } catch {
    return { success: false, error: 'Failed to join room' };
  }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const randomBytes = crypto.getRandomValues(new Uint8Array(6));
  for (let i = 0; i < 6; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return code;
}

interface RoomWithMemberCount {
  id: string;
  name: string;
  type: string;
  inviteCode: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}
