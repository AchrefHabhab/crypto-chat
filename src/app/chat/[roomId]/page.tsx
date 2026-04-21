import { redirect, notFound } from 'next/navigation';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getMessages } from '@/lib/actions/message-actions';

import { ChatRoom } from './_components/chat-room';

interface ChatRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { roomId } = await params;

  const room = await db.room.findUnique({
    where: { id: roomId },
    include: { _count: { select: { members: true } } },
  });

  if (!room) notFound();

  const result = await getMessages(roomId);
  const messages = result.success ? (result.data ?? []) : [];

  return (
    <ChatRoom
      roomId={room.id}
      roomName={room.name}
      memberCount={room._count.members}
      initialMessages={messages}
      currentUserId={session.user.id!}
      currentUserName={session.user.name ?? 'User'}
    />
  );
}
