import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';

import { auth } from '@/lib/auth';
import { getRooms } from '@/lib/actions/room-actions';
import { getUnreadCounts } from '@/lib/actions/read-receipt-actions';

import { RoomList } from './_components/room-list';
import { UserMenu } from './_components/user-menu';

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const [roomsResult, unreadResult] = await Promise.all([
    getRooms(),
    getUnreadCounts(),
  ]);
  const rooms = roomsResult.success ? (roomsResult.data ?? []) : [];
  const unreadCounts = unreadResult.success ? (unreadResult.data ?? []) : [];

  const unreadMap: Record<string, number> = {};
  for (const u of unreadCounts) {
    if (u.count > 0) unreadMap[u.roomId] = u.count;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
          <Shield className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">CryptoChat</h1>
          <p className="text-xs text-neutral-500">
            Welcome, {session.user.name ?? 'User'}
          </p>
        </div>
        <UserMenu
          name={session.user.name ?? 'User'}
          image={session.user.image ?? null}
        />
      </div>

      <RoomList rooms={rooms} unreadMap={unreadMap} />
    </main>
  );
}
