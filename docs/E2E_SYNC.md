# End-to-end encryption and the sync script

Notes in NoteFlow are encrypted end-to-end: the server and database only store ciphertext. The encryption key is stored in the browser (per user, in `localStorage`) and is never sent to the server.

## Sync script (CLI) and E2E

The sync upload API (`POST /api/sync/upload`) supports two payload formats:

1. **Legacy (plaintext)**  
   `{ notes: [{ title: string, content: string }] }`  
   The server stores notes as provided. Use this only if you don't need E2E encryption (e.g., development or trusted environments).

2. **E2E (encrypted)**  
   `{ notes: [{ encryptedPayload: { iv: string, ct: string } }] }`  
   Each note is encrypted with the same scheme as the web app (AES-GCM, 256-bit). The server stores only ciphertext.

To sync notes with E2E encryption, the **sync script must encrypt each note with the user's key** before calling the upload API. The server cannot perform this encryption because it never has access to the key.

### Getting the key into the sync script

The web app derives and stores the encryption key in the browser (see `src/lib/note-crypto.ts`). To use that key from a CLI or script, you have two options:

- **Export from the browser**  
  Add a one-time "Export encryption key" action in the app that uses `exportKey()` to write the key (e.g., as a base64 or JWK string) to a file or print it. The sync script reads that file and uses it to encrypt notes before upload. Keep the file secure and never commit it to version control.

- **Derive from a password**  
  Use the same key derivation function (KDF) as the app (e.g., PBKDF2 with a user-chosen password). The script prompts for the password, derives the key, encrypts each note, then uploads. This matches "Option A" in the E2E plan (encryption password).

The sync script should use the same cryptographic format as the web app: one encrypted payload per note containing `{ title, content }`, with a unique random initialization vector (IV) per note (see `encryptNote` in `src/lib/note-crypto.ts`). The script sends `{ encryptedPayload: { iv, ct } }` in the `notes` array.

### Summary

- The **server** never sees plaintext content or the encryption key.
- The **sync script** must encrypt notes locally with the user's key before calling `POST /api/sync/upload` with `encryptedPayload` entries.
- **Key handling** is your choice: export the key from the browser or derive it from a password in the script.
