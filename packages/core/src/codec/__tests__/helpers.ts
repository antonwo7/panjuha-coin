import { ByteWriter } from '../../utils/writer/writer'

export function bytesFilled(len: number, seed: number = 1): Uint8Array {
	const out = new Uint8Array(len)
	for (let i = 0; i < len; i++) out[i] = (seed + i) & 0xff
	return out
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
	const total = parts.reduce((n, p) => n + p.length, 0)
	const out = new Uint8Array(total)
	let off = 0
	for (const p of parts) {
		out.set(p, off)
		off += p.length
	}
	return out
}

export function encodeU32LE(n: number): Uint8Array {
	const w = new ByteWriter()
	w.writeU32LE(n)
	return w.toUint8Array()
}

export function encodeU64LE(n: bigint): Uint8Array {
	const w = new ByteWriter()
	w.writeU64LE(n)
	return w.toUint8Array()
}