'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
}

type SocketAction =
  | { type: 'connected'; socket: Socket }
  | { type: 'disconnected' };

function socketReducer(state: SocketState, action: SocketAction): SocketState {
  switch (action.type) {
    case 'connected':
      return { socket: action.socket, isConnected: true };
    case 'disconnected':
      return { ...state, isConnected: false };
  }
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [state, dispatch] = useReducer(socketReducer, {
    socket: null,
    isConnected: false,
  });

  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3002',
      { transports: ['websocket', 'polling'] }
    );

    socketInstance.on('connect', () => {
      dispatch({ type: 'connected', socket: socketInstance });
    });

    socketInstance.on('disconnect', () => {
      dispatch({ type: 'disconnected' });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinRoom = useCallback(
    (roomId: string) => {
      state.socket?.emit('join-room', roomId);
    },
    [state.socket]
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      state.socket?.emit('leave-room', roomId);
    },
    [state.socket]
  );

  return (
    <SocketContext value={{ ...state, joinRoom, leaveRoom }}>
      {children}
    </SocketContext>
  );
}
