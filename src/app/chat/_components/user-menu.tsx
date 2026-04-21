'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

interface UserMenuProps {
  name: string;
  image: string | null;
}

export function UserMenu({ name, image }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative ml-auto">
      <button
        onClick={() => setOpen(!open)}
        className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-neutral-700 transition-colors hover:border-neutral-500"
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            width={36}
            height={36}
            className="size-full object-cover"
          />
        ) : (
          <span className="text-xs font-medium">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-neutral-800 bg-neutral-900 p-1 shadow-xl"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{name}</p>
              </div>
              <div className="h-px bg-neutral-800" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-neutral-800"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
