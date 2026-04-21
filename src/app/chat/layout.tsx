import { SocketProvider } from '@/providers/socket-provider';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocketProvider>{children}</SocketProvider>;
}
