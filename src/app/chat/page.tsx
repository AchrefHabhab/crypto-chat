import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-neutral-500">
        Welcome, {session.user.name ?? 'User'}. Chat coming soon...
      </p>
    </main>
  );
}
