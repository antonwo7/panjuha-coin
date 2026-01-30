import { U32 } from './u32.number'

export function isValidHex(hex: string) {
	if (hex.startsWith('0x') || hex.startsWith('0X')) {
		hex = hex.slice(2)
	}
	if (hex.length % 2 !== 0) return false
	return /^[0-9a-fA-F]*$/.test(hex)
}

export function bytesToHex(bytes: Uint8Array): string {
	return bytes
		.reduce((acc: string[], byte: number) => {
			if (byte < 0 || byte > 255) throw new Error('Invalid byte')
			acc.push(byte.toString(16).padStart(2, '0'))
			return acc
		}, [])
		.join('')
}

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

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a === b) return true
	if (a.length !== b.length) return false
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false
	}
	return true
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
	const bytes = new Uint8Array(parts.reduce((acc, cur) => acc + cur.length, 0))

	let offset = 0
	for (let i = 0; i < parts.length; i++) {
		bytes.set(parts[i], offset)
		offset += parts[i].length
	}

	return bytes
}

export function assertLength(
	bytes: Uint8Array,
	length: number,
	name?: string
): void {
	const bytesLength = bytes.length
	if (bytesLength !== length) {
		const message = name
			? `Invalid length for ${name}: expected ${length}, got ${bytesLength}`
			: `Invalid length: expected ${length}, got ${bytesLength}`
		throw new Error(message)
	}
}

export function hexToBigInt(hex: string): bigint {
	const h = hex.startsWith('0x') ? hex : '0x' + hex
	return BigInt(h)
}

export function u32FromBytesLE(bytes: Uint8Array, offset = 0): U32 {
	if (bytes.length < 4) throw new Error('Bytes length must be at least 4')
	let value = bytes[0] + (bytes[1] << 8) + (bytes[2] << 16) + (bytes[3] << 24)
	return U32(value >>> 0)
}
