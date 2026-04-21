import type { Metadata } from 'next';

import { LoginForm } from './_components/login-form';

export const metadata: Metadata = {
  title: 'Sign In — CryptoChat',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <LoginForm />
    </main>
  );
}
