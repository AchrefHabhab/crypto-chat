const DB_NAME = 'crypto-chat-keys';
const STORE_NAME = 'keypairs';
const KEY_ID = 'user-keypair';

interface StoredKeypair {
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function generateKeypair(): Promise<CryptoKeyPair> {
  const keypair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const publicJwk = await crypto.subtle.exportKey('jwk', keypair.publicKey);
  const privateJwk = await crypto.subtle.exportKey('jwk', keypair.privateKey);

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(
    { publicKey: publicJwk, privateKey: privateJwk } satisfies StoredKeypair,
    KEY_ID
  );

  return keypair;
}

export async function getStoredKeypair(): Promise<CryptoKeyPair | null> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');

  return new Promise((resolve, reject) => {
    const request = tx.objectStore(STORE_NAME).get(KEY_ID);

    request.onsuccess = async () => {
      const stored = request.result as StoredKeypair | undefined;
      if (!stored) {
        resolve(null);
        return;
      }

      const publicKey = await crypto.subtle.importKey(
        'jwk',
        stored.publicKey,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['encrypt']
      );

      const privateKey = await crypto.subtle.importKey(
        'jwk',
        stored.privateKey,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['decrypt']
      );

      resolve({ publicKey, privateKey });
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getOrCreateKeypair(): Promise<CryptoKeyPair> {
  const existing = await getStoredKeypair();
  if (existing) return existing;
  return generateKeypair();
}

export async function exportPublicKeyBase64(
  publicKey: CryptoKey
): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  const bytes = new Uint8Array(exported);
  return btoa(String.fromCharCode(...bytes));
}

export async function importPublicKeyBase64(
  base64: string
): Promise<CryptoKey> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return crypto.subtle.importKey(
    'spki',
    bytes.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  );
}
