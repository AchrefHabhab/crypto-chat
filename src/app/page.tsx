import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

import { LandingHero } from './_components/landing-hero';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect('/chat');
  }

  return <LandingHero />;
}
