/**
 * Client-side E2E encryption for notes. Uses Web Crypto API (AES-GCM, 256-bit).
 * Key is stored in localStorage per user (Option B); server never sees plaintext or key.
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12
const TAG_LENGTH = 128
const STORAGE_PREFIX = 'noteflow_ek_'

export interface EncryptedPayload {
  iv: string
  ct: string
}

export interface NotePayload {
  title: string
  content: string
}

/** Generate a new random encryption key for the user. */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

/** Export key to a storable string (JWK). */
export async function exportKey(key: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey('jwk', key)
  return JSON.stringify(jwk)
}

/** Import key from a storable string (JWK). */
export async function importKey(stored: string): Promise<CryptoKey> {
  const jwk = JSON.parse(stored) as JsonWebKey
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

/** Get or create the encryption key for this user; store in localStorage. */
export async function getOrCreateUserKey(userId: string): Promise<CryptoKey> {
  if (typeof window === 'undefined') {
    throw new Error('note-crypto is client-only')
  }
  const storageKey = STORAGE_PREFIX + userId
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    return importKey(stored)
  }
  const key = await generateKey()
  const exported = await exportKey(key)
  localStorage.setItem(storageKey, exported)
  return key
}

/** Check if the current user has an encryption key in storage. */
export function hasStoredKey(userId: string): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(STORAGE_PREFIX + userId)
}

/** Encrypt a note (title + content) into one payload. */
export async function encryptNote(
  payload: NotePayload,
  key: CryptoKey
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoded = new TextEncoder().encode(JSON.stringify(payload))
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: TAG_LENGTH,
    },
    key,
    encoded
  )
  return {
    iv: b64Encode(iv),
    ct: b64Encode(new Uint8Array(ciphertext)),
  }
}

/** Decrypt an encrypted payload back to title + content. */
export async function decryptNote(
  encrypted: EncryptedPayload,
  key: CryptoKey
): Promise<NotePayload> {
  const iv = new Uint8Array(b64Decode(encrypted.iv))
  const ct = new Uint8Array(b64Decode(encrypted.ct))
  const plaintext = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: TAG_LENGTH,
    },
    key,
    ct
  )
  const json = new TextDecoder().decode(plaintext)
  return JSON.parse(json) as NotePayload
}

/** Detect if a string is our encrypted JSON format (has "iv" and "ct" keys). */
export function isEncryptedContent(content: string): boolean {
  try {
    const parsed = JSON.parse(content) as unknown
    return (
      typeof parsed === 'object' &&
      parsed !== null &&
      'iv' in parsed &&
      'ct' in parsed &&
      typeof (parsed as EncryptedPayload).iv === 'string' &&
      typeof (parsed as EncryptedPayload).ct === 'string'
    )
  } catch {
    return false
  }
}

function b64Encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

function b64Decode(str: string): Uint8Array {
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
