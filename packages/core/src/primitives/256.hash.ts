/**
 * Hash256 type helpers.
 *
 * A hash256 is a 32-byte digest used for txids, block ids, merkle nodes, etc.
 * This file typically provides a branded type plus small helpers to convert/compare.
 */

import { bytesToHex, hexToBytes } from './bytes'

declare const Hash256Brand: unique symbol
export const HASH256_SIZE: number = 32 as const
/**
 * Hash256 is an opaque 32-byte digest.
 * Treat it as raw bytes; string/hex formatting is a separate concern.
 */

export type Hash256 = Uint8Array & { readonly [Hash256Brand]: 'Hash256' }

/**
 * Hash helper.
 */
export function isHash256(bytes: Uint8Array): boolean {
	return bytes.length === HASH256_SIZE
}

export function hash256FromBytes<T extends Hash256 = Hash256>(
	bytes: Uint8Array
): T {
	if (bytes.length !== HASH256_SIZE)
		throw new Error(
			`Invalid length for Hash256: expected ${HASH256_SIZE}, got ${bytes.length}`
		)
	return new Uint8Array(bytes) as T
}

export function hash256FromHex<T extends Hash256 = Hash256>(hex: string): T {
	return hash256FromBytes(hexToBytes(hex)) as T
}

export function hash256ToHex<T extends Hash256 = Hash256>(hash: T): string {
	return bytesToHex(hash)
}

export function zeroHash256<T extends Hash256 = Hash256>(): T {
	return new Uint8Array(HASH256_SIZE) as T
}

export function hash256Clone<T extends Hash256 = Hash256>(hash: T): T {
	return new Uint8Array(hash) as T
}
