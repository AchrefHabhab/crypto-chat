@AGENTS.md

# CLAUDE.md

## Education Mode

This project is being used for learning. When the user asks for help:

- **Explain concepts clearly** before writing code — assume the user is learning
- **Show the reasoning** behind architectural decisions
- **After writing code, explain what each part does** and why it was done that way
- **Suggest next learning steps** after completing a task

## Verification

```bash
pnpm type-check    # TypeScript compilation
pnpm lint          # ESLint (also cleans ._* files)
```

## Project Overview

**CryptoChat** — Blockchain-secured real-time chat with end-to-end encryption, hash chains, and digital signatures.

- **Language**: English
- **Package manager**: pnpm exclusively
- **Port**: 3000

### Tech Stack

Next.js 16 (App Router) | PostgreSQL + Prisma | NextAuth | Socket.io | Web Crypto API | Tailwind CSS v4 | Framer Motion | Lucide React | Sonner toasts

### Project Structure

```
src/app/(auth)/         # Login, register
src/app/(private)/chat/ # Chat rooms, messages
src/lib/crypto/         # E2EE, hash chain, signatures
src/lib/actions/        # Server actions
src/providers/          # Socket, theme providers
```

## Domain-Specific Rules

### Crypto Standards

- All message content stored as ciphertext (never plaintext in DB)
- RSA-OAEP 2048-bit keypairs for key exchange
- AES-256-GCM for message encryption
- SHA-256 hash chain linking messages
- RSA-PSS digital signatures on message hashes

### Formatting Standards

```tsx
// Dates
date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// Timestamps
date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
```

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `src/lib/auth.ts` | NextAuth config |
| `src/lib/crypto/` | Encryption, hash chain, signatures |
| `src/providers/socket-provider.tsx` | Socket.io client provider |

## Gotchas

- **macOS `._*` files**: Break builds. Run `pnpm lint` (auto-cleans)
- **Web Crypto API**: Only available in secure contexts (HTTPS or localhost)
- **Private keys**: Never sent to server — stored in IndexedDB on client only
