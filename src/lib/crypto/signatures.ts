export async function generateSigningKeypair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );
}

export async function signHash(
  privateKey: CryptoKey,
  hash: string
): Promise<string> {
  const encoded = new TextEncoder().encode(hash);

  const signature = await crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 },
    privateKey,
    encoded
  );

  return uint8ToBase64(new Uint8Array(signature));
}

export async function verifySignature(
  publicKey: CryptoKey,
  hash: string,
  signatureBase64: string
): Promise<boolean> {
  const encoded = new TextEncoder().encode(hash);
  const signature = base64ToUint8(signatureBase64);

  return crypto.subtle.verify(
    { name: 'RSA-PSS', saltLength: 32 },
    publicKey,
    signature.buffer as ArrayBuffer,
    encoded
  );
}

export async function exportSigningPublicKey(
  publicKey: CryptoKey
): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  return uint8ToBase64(new Uint8Array(exported));
}

export async function importSigningPublicKey(
  base64: string
): Promise<CryptoKey> {
  const bytes = base64ToUint8(base64);

  return crypto.subtle.importKey(
    'spki',
    bytes.buffer as ArrayBuffer,
    { name: 'RSA-PSS', hash: 'SHA-256' },
    true,
    ['verify']
  );
}

function uint8ToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
