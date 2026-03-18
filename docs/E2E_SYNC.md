# E2E encryption and the sync script

Notes in Noteflow are encrypted end-to-end: the server and database only store ciphertext. The encryption key lives in the browser (per-user, in `localStorage`) and is never sent to the server.

## Sync script (CLI) and E2E

The sync upload API (`POST /api/sync/upload`) supports two payload shapes:

1. **Legacy (plaintext)**  
   `{ notes: [{ title: string, content: string }] }`  
   The server stores notes as given. Use only if you do not need E2E (e.g. dev or trusted environment).

2. **E2E (encrypted)**  
   `{ notes: [{ encryptedPayload: { iv: string, ct: string } }] }`  
   Each note is encrypted with the same scheme as the web app (AES-GCM, 256-bit). The server stores only ciphertext.

To sync notes in an E2E way, the **sync script must encrypt each note with the user’s key** before calling the upload API. The server cannot do this because it never has the key.

### Getting the key into the sync script

The web app derives and stores the key in the browser (see `src/lib/note-crypto.ts`). To use that key from a CLI/script you have two options:

- **Export from the browser**  
  In the app, add a one-time “Export encryption key” action that uses `exportKey()` and writes the key (e.g. as a base64 or JWK string) to a file or prints it. The sync script reads that file and uses it to encrypt before upload. Keep the file secure and never commit it.

- **Derive from a password**  
  Use the same KDF as the app (e.g. PBKDF2 with a user-chosen password). The script prompts for the password, derives the key, encrypts each note, then uploads. This matches “Option A” in the E2E plan (encryption password).

The sync script should use the same crypto format as the web app: one encrypted payload per note containing `{ title, content }`, with a random IV per note (see `encryptNote` in `src/lib/note-crypto.ts`). The script sends `{ encryptedPayload: { iv, ct } }` in the `notes` array.

### Summary

- **Server** never sees plaintext or the encryption key.
- **Sync script** must encrypt notes locally with the user’s key before calling `POST /api/sync/upload` with `encryptedPayload` entries.
- **Key handling** is up to you: export from browser or derive from a password in the script.
