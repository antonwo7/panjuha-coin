import { encodeVarInt } from '../../codec/varint'

export class ByteWriter {
	private buf: Uint8Array
	private offset: number

	constructor() {
		this.buf = new Uint8Array(1024)
		this.offset = 0
	}

	ensureCapacity(needBytes: number): void {
		if (!Number.isInteger(needBytes) || needBytes < 0) {
			throw new RangeError(
				`ByteWriter: ensureCapacity needBytes must be a non-negative integer (needBytes=${needBytes})`
			)
		}

		if (this.offset + needBytes <= this.buf.length) return

		const buffer = new Uint8Array(
			Math.max(this.buf.length * 2, this.offset + needBytes)
		)

		buffer.set(this.buf, 0)
		this.buf = buffer
	}

	writeU8(value: number): void {
		if (!Number.isFinite(value) || !Number.isInteger(value)) {
			throw new RangeError(
				`ByteWriter: writeU8 value must be a finite integer (value=${value})`
			)
		}
		if (value < 0 || value > 0xff) {
			throw new RangeError(
				`ByteWriter: writeU8 value out of range [0, 255] (value=${value})`
			)
		}

		this.ensureCapacity(1)
		this.buf.set([value], this.offset)
		this.offset += 1
	}

	writeBytes(bytes: Uint8Array): void {
		// Uint8Array.length is always a non-negative integer, but keep the method strict about input.
		if (!(bytes instanceof Uint8Array)) {
			throw new TypeError('ByteWriter: writeBytes expects a Uint8Array')
		}

		this.ensureCapacity(bytes.length)
		this.buf.set(bytes, this.offset)
		this.offset += bytes.length
	}

	writeU16LE(value: number): void {
		if (!Number.isFinite(value) || !Number.isInteger(value)) {
			throw new RangeError(
				`ByteWriter: writeU16LE value must be a finite integer (value=${value})`
			)
		}
		if (value < 0 || value > 0xffff) {
			throw new RangeError(
				`ByteWriter: writeU16LE value out of range [0, 65535] (value=${value})`
			)
		}

		this.ensureCapacity(2)
		this.buf.set([value & 0xff, (value >> 8) & 0xff], this.offset)
		this.offset += 2
	}

	writeU32LE(value: number): void {
		if (!Number.isFinite(value) || !Number.isInteger(value)) {
			throw new RangeError(
				`ByteWriter: writeU32LE value must be a finite integer (value=${value})`
			)
		}
		if (value < 0 || value > 2 ** 32 - 1) {
			throw new RangeError(
				`ByteWriter: writeU32LE value out of range [0, 2^32 - 1] (value=${value})`
			)
		}

		this.ensureCapacity(4)
		this.buf.set(
			[
				value & 0xff,
				(value >> 8) & 0xff,
				(value >> 16) & 0xff,
				(value >> 24) & 0xff
			],
			this.offset
		)
		this.offset += 4
	}

	writeU64LE(value: bigint): void {
		if (typeof value !== 'bigint') {
			throw new TypeError('ByteWriter: writeU64LE expects a bigint')
		}
		if (value < 0n || value > 2n ** 64n - 1n) {
			throw new RangeError(
				`ByteWriter: writeU64LE value out of range [0, 2^64 - 1] (value=${value})`
			)
		}

		this.ensureCapacity(8)
		this.buf.set(
			[
				Number(value & 0xffn),
				Number((value >> 8n) & 0xffn),
				Number((value >> 16n) & 0xffn),
				Number((value >> 24n) & 0xffn),
				Number((value >> 32n) & 0xffn),
				Number((value >> 40n) & 0xffn),
				Number((value >> 48n) & 0xffn),
				Number((value >> 56n) & 0xffn)
			],
			this.offset
		)
		this.offset += 8
	}

	writeVarInt(value: bigint): void {
		if (typeof value !== 'bigint') {
			throw new TypeError('ByteWriter: writeVarInt expects a bigint')
		}
		if (value < 0n || value > 2n ** 64n - 1n) {
			throw new RangeError(
				`ByteWriter: writeVarInt value out of range [0, 2^64 - 1] (value=${value})`
			)
		}

		const encodedValue: Uint8Array = encodeVarInt(value)
		this.writeBytes(encodedValue)
	}

	toUint8Array(): Uint8Array {
		return this.buf.slice(0, this.offset)
	}
}
