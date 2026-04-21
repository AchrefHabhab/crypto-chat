'use client';

import { useEffect, useReducer } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useSocket } from '@/providers/socket-provider';

interface TypingState {
  typers: string[];
}

type TypingAction =
  | { type: 'start'; userName: string }
  | { type: 'stop'; userName: string }
  | { type: 'clear' };

function typingReducer(state: TypingState, action: TypingAction): TypingState {
  switch (action.type) {
    case 'start':
      if (state.typers.includes(action.userName)) return state;
      return { typers: [...state.typers, action.userName] };
    case 'stop':
      return { typers: state.typers.filter((t) => t !== action.userName) };
    case 'clear':
      return { typers: [] };
  }
}

interface TypingIndicatorProps {
  roomId: string;
}

export function TypingIndicator({ roomId }: TypingIndicatorProps) {
  const { socket } = useSocket();
  const [state, dispatch] = useReducer(typingReducer, { typers: [] });

  useEffect(() => {
    if (!socket) return;

    const onStart = (data: { userName: string }) => {
      dispatch({ type: 'start', userName: data.userName });
    };

    const onStop = () => {
      dispatch({ type: 'clear' });
    };

    socket.on('typing-start', onStart);
    socket.on('typing-stop', onStop);

    return () => {
      socket.off('typing-start', onStart);
      socket.off('typing-stop', onStop);
    };
  }, [socket, roomId]);

  const text =
    state.typers.length === 1
      ? `${state.typers[0]} is typing`
      : state.typers.length === 2
        ? `${state.typers[0]} and ${state.typers[1]} are typing`
        : state.typers.length > 2
          ? `${state.typers[0]} and ${state.typers.length - 1} others are typing`
          : '';

  return (
    <AnimatePresence>
      {state.typers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 py-1"
        >
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-1 rounded-full bg-emerald-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </span>
            {text}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
