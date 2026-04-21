# CryptoChat

**Blockchain-inspired secure messaging platform** with end-to-end encryption, hash-chained message integrity, and digital signatures.

## Features

- **End-to-End Encryption** — AES-256-GCM encryption. Messages are encrypted in the browser before leaving the device.
- **Hash Chain Integrity** — SHA-256 hash chain links every message to the previous one. Tamper with one and the entire chain breaks.
- **Digital Signatures** — RSA-PSS signatures prove sender identity. Each message is cryptographically signed.
- **Blockchain Inspector** — Visual panel showing the hash chain as connected blocks with real-time validation.
- **Real-Time Messaging** — WebSocket-powered via Socket.io. No polling, instant delivery.
- **Zero-Knowledge Design** — Private keys never leave the device (stored in IndexedDB). The server only sees ciphertext.
- **Room System** — Create rooms, share 6-character invite codes, join by code.
- **Typing Indicators** — Animated "user is typing..." with debounce.
- **OAuth Authentication** — GitHub and Google sign-in via NextAuth v5.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│                                                     │
│  Plaintext → AES-256-GCM → SHA-256 Hash Chain      │
│           → RSA-PSS Sign → Send                     │
│                                                     │
│  Private keys stored in IndexedDB (never sent)      │
└──────────┬──────────────────────┬───────────────────┘
           │ HTTP (Server Actions) │ WebSocket
           ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│  Next.js (3001)  │   │ Socket.io (3002) │
│  - Auth           │   │  - Real-time      │
│  - DB operations  │   │  - Typing events  │
│  - Server Actions │   │  - Room channels  │
└────────┬─────────┘   └──────────────────┘
         │
         ▼
┌──────────────────┐
│ PostgreSQL       │
│ (Supabase)       │
│ schema:          │
│ crypto_chat      │
└──────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma v7 |
| Auth | NextAuth v5 (GitHub, Google) |
| Real-Time | Socket.io |
| Encryption | Web Crypto API (AES-GCM, RSA-OAEP, RSA-PSS, SHA-256) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Package Manager | pnpm |

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Fill in: DATABASE_URL, AUTH_SECRET, AUTH_GITHUB_ID/SECRET, AUTH_GOOGLE_ID/SECRET

# Push database schema
pnpm prisma db push

# Start Next.js dev server
pnpm dev

# Start Socket.io server (separate terminal)
pnpm socket
```

Open [http://localhost:3001](http://localhost:3001).

## Message Security Pipeline

Every message goes through this pipeline before being sent:

1. **Encrypt** — AES-256-GCM with random key + IV
2. **Hash** — SHA-256 of `prevHash + ciphertext + senderId + timestamp`
3. **Sign** — RSA-PSS signature of the hash
4. **Store** — Ciphertext, IV, signature, prevHash, hash saved to DB
5. **Broadcast** — Encrypted payload sent to room via WebSocket

Recipients decrypt locally. The server never sees plaintext.

## Author

**Achraf Hebheb** — [GitHub](https://github.com/AchrefHabhab)
