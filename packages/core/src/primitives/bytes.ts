/**
 * Byte-level helpers used across codecs and hashing.
 *
 * Keep these utilities small and predictable: subtle changes in encoding or comparisons
 * can silently break txids, block hashes, or signature checks.
 */

import { U32 } from './u32.number'

/**
 * Byte utility helper.
 */
export function isValidHex(hex: string) {
	if (hex.startsWith('0x') || hex.startsWith('0X')) {
		hex = hex.slice(2)
	}
	if (hex.length % 2 !== 0) return false
	return /^[0-9a-fA-F]*$/.test(hex)
}

/**
 * Converts between bytes and hex string.
 *
 * @param input Bytes or hex string (depending on direction).
 * @returns Converted representation.
 * @throws If the hex input is malformed.
 */
export function bytesToHex(bytes: Uint8Array): string {
	return bytes
		.reduce((acc: string[], byte: number) => {
			if (byte < 0 || byte > 255) throw new Error('Invalid byte')
			acc.push(byte.toString(16).padStart(2, '0'))
			return acc
		}, [])
		.join('')
}

/**
 * Converts between bytes and hex string.
 *
 * @param input Bytes or hex string (depending on direction).
 * @returns Converted representation.
 * @throws If the hex input is malformed.
 */
export function hexToBytes(hex: string): Uint8Array {
	if (hex.startsWith('0x') || hex.startsWith('0X')) {
		hex = hex.slice(2)
	}

	if (!isValidHex(hex)) throw new Error('Invalid hex string')

	const bytes = new Uint8Array(hex.length / 2)

	for (let i = 0; i < hex.length; i = i + 2) {
		bytes[i / 2] = parseInt(hex[i] + hex[i + 1], 16)
	}

	return bytes
}

/**
 * Constant-time-ish byte array equality check.
 *
 * @param a First buffer.
 * @param b Second buffer.
 * @returns True if buffers have the same length and contents.
 */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a === b) return true
	if (a.length !== b.length) return false
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false
	}
	return true
}

/**
 * Concatenates multiple byte arrays into a single buffer.
 *
 * @param parts Byte array chunks.
 * @returns Concatenated bytes.
 */
export function concatBytes(...parts: Uint8Array[]): Uint8Array {
	const bytes = new Uint8Array(parts.reduce((acc, cur) => acc + cur.length, 0))

	let offset = 0
	for (let i = 0; i < parts.length; i++) {
		bytes.set(parts[i], offset)
		offset += parts[i].length
	}

	return bytes
}

/**
 * Byte utility helper.
 */
export function assertLength(bytes: Uint8Array, length: number, name?: string): void {
	const bytesLength = bytes.length
	if (bytesLength !== length) {
		const message = name
			? `Invalid length for ${name}: expected ${length}, got ${bytesLength}`
			: `Invalid length: expected ${length}, got ${bytesLength}`
		throw new Error(message)
	}
}

/**
 * Converts between bytes and hex string.
 *
 * @param input Bytes or hex string (depending on direction).
 * @returns Converted representation.
 * @throws If the hex input is malformed.
 */
export function hexToBigInt(hex: string): bigint {
	const h = hex.startsWith('0x') ? hex : '0x' + hex
	return BigInt(h)
}

/**
 * Byte utility helper.
 */
export function u32FromBytesLE(bytes: Uint8Array, offset = 0): U32 {
	if (bytes.length < 4) throw new Error('Bytes length must be at least 4')
	let value = bytes[0] + (bytes[1] << 8) + (bytes[2] << 16) + (bytes[3] << 24)
	return U32(value >>> 0)
}

/**
 * Byte utility helper.
 */
export function bytesToBase64(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString('base64')
}

/**
 * Byte utility helper.
 */
export function base64ToKey(base64: string): Uint8Array {
	return Uint8Array.from(Buffer.from(base64, 'base64'))
}
