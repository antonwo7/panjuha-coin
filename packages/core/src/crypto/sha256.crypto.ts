/**
 * SHA-256 primitives.
 *
 * This module provides the single SHA-256 and (optionally) building blocks used by hash256.
 * Keep the API tiny and deterministic: any change here affects txids, block hashes, and PoW.
 */

import { Hash256, hash256FromBytes } from '../primitives/256.hash'
import { sha256 as nativeSha256 } from '@noble/hashes/sha2.js'

/**
 * Computes SHA-256 digest of the given bytes.
 *
 * @param data Input bytes.
 * @returns 32-byte digest.
 */
export function sha256(data: Uint8Array): Hash256 {
	return hash256FromBytes(nativeSha256(data))
}

/**
 * Computes SHA-256 digest of the given bytes.
 *
 * @param data Input bytes.
 * @returns 32-byte digest.
 */
export function doubleSha256(data: Uint8Array): Hash256 {
	return sha256(sha256(data))
}
