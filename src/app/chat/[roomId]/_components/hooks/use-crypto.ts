'use client';

import { useEffect, useReducer, useCallback } from 'react';

import { getOrCreateKeypair } from '@/lib/crypto/key-manager';
import { generateSigningKeypair } from '@/lib/crypto/signatures';
import { encryptMessage, decryptMessage } from '@/lib/crypto/encrypt';
import { computeMessageHash, getGenesisHash } from '@/lib/crypto/hash-chain';
import { signHash } from '@/lib/crypto/signatures';

interface CryptoState {
  ready: boolean;
  encryptionKeys: CryptoKeyPair | null;
  signingKeys: CryptoKeyPair | null;
  lastHash: string;
}

type CryptoAction =
  | { type: 'initialized'; encryptionKeys: CryptoKeyPair; signingKeys: CryptoKeyPair }
  | { type: 'hash-updated'; hash: string };

function cryptoReducer(state: CryptoState, action: CryptoAction): CryptoState {
  switch (action.type) {
    case 'initialized':
      return {
        ...state,
        ready: true,
        encryptionKeys: action.encryptionKeys,
        signingKeys: action.signingKeys,
      };
    case 'hash-updated':
      return { ...state, lastHash: action.hash };
  }
}

export function useCrypto() {
  const [state, dispatch] = useReducer(cryptoReducer, {
    ready: false,
    encryptionKeys: null,
    signingKeys: null,
    lastHash: getGenesisHash(),
  });

  useEffect(() => {
    async function init() {
      const encryptionKeys = await getOrCreateKeypair();
      const signingKeys = await generateSigningKeypair();
      dispatch({ type: 'initialized', encryptionKeys, signingKeys });
    }

    init();
  }, []);

  const encrypt = useCallback(
    async (plaintext: string, senderId: string) => {
      if (!state.signingKeys) {
        throw new Error('Crypto not initialized');
      }

      const { ciphertext, iv } = await encryptMessage(plaintext);

      const timestamp = Date.now();
      const hash = await computeMessageHash(
        state.lastHash,
        ciphertext,
        senderId,
        timestamp
      );

      const signature = await signHash(state.signingKeys.privateKey, hash);

      dispatch({ type: 'hash-updated', hash });

      return {
        ciphertext,
        iv,
        signature,
        prevHash: state.lastHash,
        hash,
      };
    },
    [state.signingKeys, state.lastHash]
  );

  const decrypt = useCallback(
    async (ciphertext: string, iv: string) => {
      try {
        return await decryptMessage(ciphertext, iv);
      } catch {
        return '[decryption failed]';
      }
    },
    []
  );

  return {
    ready: state.ready,
    encrypt,
    decrypt,
  };
}
