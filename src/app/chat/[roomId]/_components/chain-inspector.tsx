'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Blocks, ChevronDown, ChevronUp, Link2, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ChainBlock {
  id: string;
  hash: string;
  prevHash: string;
  ciphertext: string;
  senderName: string;
  createdAt: Date;
}

interface ChainInspectorProps {
  messages: ChainBlock[];
}

export function ChainInspector({ messages }: ChainInspectorProps) {
  const [open, setOpen] = useState(false);

  const blocks = messages.filter((m) => m.hash !== 'unhashed');

  const chainValid = blocks.every((block, i) => {
    if (i === 0) return true;
    return block.prevHash === blocks[i - 1].hash;
  });

  return (
    <div className="border-t border-neutral-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-200"
      >
        <Blocks className="size-3.5" />
        Blockchain Inspector
        <span
          className={cn(
            'ml-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]',
            chainValid
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          )}
        >
          {chainValid ? (
            <>
              <ShieldCheck className="size-2.5" />
              Valid
            </>
          ) : (
            <>
              <ShieldAlert className="size-2.5" />
              Broken
            </>
          )}
        </span>
        <span className="ml-auto text-neutral-600">
          {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
        </span>
        {open ? (
          <ChevronUp className="size-3.5" />
        ) : (
          <ChevronDown className="size-3.5" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto px-4 pb-3">
              {blocks.length === 0 ? (
                <p className="py-4 text-center text-xs text-neutral-600">
                  No encrypted blocks yet
                </p>
              ) : (
                <div className="space-y-0">
                  {blocks.map((block, i) => {
                    const prevValid =
                      i === 0 || block.prevHash === blocks[i - 1].hash;

                    return (
                      <div key={block.id}>
                        {i > 0 && (
                          <div className="flex justify-center py-1">
                            <Link2
                              className={cn(
                                'size-3',
                                prevValid ? 'text-emerald-500' : 'text-red-500'
                              )}
                            />
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={cn(
                            'rounded-lg border p-2.5',
                            prevValid
                              ? 'border-neutral-800 bg-neutral-900/50'
                              : 'border-red-500/30 bg-red-500/5'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-neutral-300">
                              Block #{i}
                            </span>
                            <div className="flex items-center gap-1">
                              <Lock className="size-2.5 text-emerald-400" />
                              {prevValid ? (
                                <ShieldCheck className="size-2.5 text-emerald-400" />
                              ) : (
                                <ShieldAlert className="size-2.5 text-red-400" />
                              )}
                            </div>
                          </div>
                          <p className="mt-1 text-[10px] text-neutral-500">
                            {block.senderName}
                          </p>
                          <div className="mt-1.5 space-y-0.5">
                            <p className="font-mono text-[9px] text-neutral-600">
                              <span className="text-neutral-500">hash:</span>{' '}
                              {block.hash.slice(0, 16)}...
                            </p>
                            <p className="font-mono text-[9px] text-neutral-600">
                              <span className="text-neutral-500">prev:</span>{' '}
                              {block.prevHash.slice(0, 16)}...
                            </p>
                            <p className="font-mono text-[9px] text-neutral-600">
                              <span className="text-neutral-500">data:</span>{' '}
                              {block.ciphertext.slice(0, 20)}...
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
