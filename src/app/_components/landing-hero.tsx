'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Link2,
  Fingerprint,
  MessageSquare,
  Blocks,
  ArrowRight,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const features = [
  {
    icon: Lock,
    title: 'AES-256-GCM Encryption',
    description: 'Military-grade encryption. Messages are encrypted in your browser before they ever leave your device.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Link2,
    title: 'SHA-256 Hash Chain',
    description: 'Every message links to the previous one. Tamper with one, and the entire chain breaks — just like a blockchain.',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: Fingerprint,
    title: 'RSA-PSS Signatures',
    description: 'Cryptographic proof of sender identity. Every message is signed with a private key only you hold.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    icon: Blocks,
    title: 'Blockchain Inspector',
    description: 'Visual chain verification. See every block, hash, and link — verify message integrity in real time.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Messaging',
    description: 'WebSocket-powered instant delivery. No polling, no delays. Messages arrive the moment they are sent.',
    color: 'from-rose-500 to-rose-600',
  },
  {
    icon: Shield,
    title: 'Zero-Knowledge Design',
    description: 'Private keys never leave your device. The server sees only ciphertext — it cannot read your messages.',
    color: 'from-teal-500 to-teal-600',
  },
];

function FloatingParticle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute size-1 rounded-full bg-emerald-400/30"
      style={{ left: x, top: y }}
      animate={{
        opacity: [0, 0.6, 0],
        scale: [0.5, 1.5, 0.5],
        y: [0, -30, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

export function LandingHero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 size-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-cyan-500/5 blur-[100px]" />
        {[
          { delay: 0, x: '10%', y: '20%' },
          { delay: 1.2, x: '85%', y: '15%' },
          { delay: 0.6, x: '70%', y: '60%' },
          { delay: 2, x: '20%', y: '70%' },
          { delay: 1.5, x: '50%', y: '40%' },
          { delay: 0.8, x: '30%', y: '85%' },
          { delay: 2.5, x: '90%', y: '80%' },
          { delay: 1, x: '60%', y: '25%' },
        ].map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-16">
        <motion.div
          className="text-center"
          initial="hidden"
          animate="visible"
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-[0_0_60px_rgba(52,211,153,0.2)]"
          >
            <Shield className="size-10 text-white" />
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="mb-4 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl"
          >
            CryptoChat
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="mx-auto mb-4 max-w-xl text-lg text-neutral-400 sm:text-xl"
          >
            Blockchain-inspired secure messaging.
            <br />
            End-to-end encrypted. Hash-chained. Digitally signed.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            className="mb-4 flex items-center justify-center gap-3"
          >
            {['AES-256-GCM', 'SHA-256', 'RSA-PSS', 'WebSocket'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-xs font-mono text-neutral-500"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.div custom={4} variants={fadeUp}>
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(52,211,153,0.3)] transition-shadow hover:shadow-[0_0_50px_rgba(52,211,153,0.4)]"
            >
              Get Started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i + 5}
              variants={fadeUp}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 backdrop-blur-sm transition-all hover:border-neutral-700 hover:bg-neutral-900/60"
            >
              <div
                className={`mb-4 flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} opacity-80`}
              >
                <feature.icon className="size-5 text-white" />
              </div>
              <h3 className="mb-2 text-sm font-semibold">{feature.title}</h3>
              <p className="text-xs leading-relaxed text-neutral-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          custom={12}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-24 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-8 text-center backdrop-blur-sm"
        >
          <h2 className="mb-3 text-xl font-bold">How the Chain Works</h2>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            {[
              { label: 'Plaintext', bg: 'bg-neutral-800' },
              { label: '→', bg: '' },
              { label: 'AES-GCM Encrypt', bg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
              { label: '→', bg: '' },
              { label: 'SHA-256 Hash', bg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' },
              { label: '→', bg: '' },
              { label: 'RSA-PSS Sign', bg: 'bg-violet-500/20 text-violet-400 border border-violet-500/30' },
              { label: '→', bg: '' },
              { label: 'Broadcast', bg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30' },
            ].map((step, i) =>
              step.label === '→' ? (
                <span key={i} className="text-neutral-600">
                  →
                </span>
              ) : (
                <span
                  key={i}
                  className={`rounded-lg px-3 py-1.5 font-mono ${step.bg}`}
                >
                  {step.label}
                </span>
              )
            )}
          </div>
          <p className="mt-4 text-xs text-neutral-600">
            Each message links to the previous hash — forming an unbreakable chain.
          </p>
        </motion.div>

        <motion.footer
          custom={13}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-16 text-center text-xs text-neutral-700"
        >
          Built by Achraf Hebheb — Next.js &middot; Prisma &middot; Socket.io &middot; Web Crypto API
        </motion.footer>
      </div>
    </div>
  );
}
