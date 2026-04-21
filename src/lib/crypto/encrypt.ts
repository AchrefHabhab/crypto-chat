interface EncryptedPayload {
  ciphertext: string;
  iv: string;
}

export async function encryptMessage(
  plaintext: string
): Promise<EncryptedPayload> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const keyBytes = await crypto.subtle.exportKey('raw', key);

  const combined = new Uint8Array(keyBytes.byteLength + encrypted.byteLength);
  combined.set(new Uint8Array(keyBytes), 0);
  combined.set(new Uint8Array(encrypted), keyBytes.byteLength);

  return {
    ciphertext: uint8ToBase64(combined),
    iv: uint8ToBase64(iv),
  };
}

export async function decryptMessage(
  ciphertextBase64: string,
  ivBase64: string
): Promise<string> {
  const combined = base64ToUint8(ciphertextBase64);
  const iv = base64ToUint8(ivBase64);

  const keyBytes = combined.slice(0, 32);
  const encrypted = combined.slice(32);

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    encrypted.buffer as ArrayBuffer
  );

  return new TextDecoder().decode(decrypted);
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
