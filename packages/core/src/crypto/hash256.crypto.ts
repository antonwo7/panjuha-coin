/**
 * hash256 helpers (double SHA-256).
 *
 * `hash256(x)` is defined as SHA256(SHA256(x)).
 * It's used for txid-like ids and for block header hashing (depending on your design).
 */

import { doubleSha256 } from './sha256.crypto'

/**
 * Computes hash256(data) = SHA256(SHA256(data)).
 *
 * @param data Input bytes.
 * @returns 32-byte digest.
 */
export function hash256(bytes: Uint8Array) {
	return doubleSha256(bytes)
}
