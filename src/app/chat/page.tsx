import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';

import { auth } from '@/lib/auth';
import { getRooms } from '@/lib/actions/room-actions';

import { RoomList } from './_components/room-list';
import { UserMenu } from './_components/user-menu';

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const result = await getRooms();
  const rooms = result.success ? (result.data ?? []) : [];

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

      <RoomList rooms={rooms} />
    </main>
  );
}
