const GENESIS_HASH = '0'.repeat(64);

export function getGenesisHash(): string {
  return GENESIS_HASH;
}

export async function computeMessageHash(
  prevHash: string,
  ciphertext: string,
  senderId: string,
  timestamp: number
): Promise<string> {
  const payload = `${prevHash}:${ciphertext}:${senderId}:${timestamp}`;
  const encoded = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = new Uint8Array(hashBuffer);

  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyChain(
  messages: { prevHash: string; hash: string; ciphertext: string; senderId: string; timestamp: number }[]
): Promise<{ valid: boolean; brokenAt: number | null }> {
  let expectedPrev = GENESIS_HASH;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (msg.prevHash !== expectedPrev) {
      return { valid: false, brokenAt: i };
    }

    const computed = await computeMessageHash(
      msg.prevHash,
      msg.ciphertext,
      msg.senderId,
      msg.timestamp
    );

    if (computed !== msg.hash) {
      return { valid: false, brokenAt: i };
    }

    expectedPrev = msg.hash;
  }

  return { valid: true, brokenAt: null };
}
