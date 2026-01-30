import { decodeVarInt } from '../../codec/varint'

export class ByteReader {
	private bytes: Uint8Array
	private offset: number

	constructor(bytes: Uint8Array, offset: number = 0) {
		if (!Number.isInteger(offset)) {
			throw new RangeError('ByteReader: offset must be an integer')
		}
		if (offset < 0 || offset > bytes.length) {
			throw new RangeError(
				`ByteReader: offset out of range (offset=${offset}, length=${bytes.length})`
			)
		}
		this.bytes = bytes
		this.offset = offset
	}

	get position(): number {
		return this.offset
	}

	get length(): number {
		return this.bytes.length
	}

	get remaining(): number {
		return this.bytes.length - this.offset
	}

	seek(pos: number): void {
		if (!Number.isInteger(pos)) {
			throw new RangeError('ByteReader: position must be an integer')
		}
		if (pos < 0 || pos > this.bytes.length) {
			throw new RangeError(
				`ByteReader: seek out of bounds (pos=${pos}, length=${this.bytes.length})`
			)
		}
		this.offset = pos
	}

	skip(n: number): void {
		if (!Number.isInteger(n) || n < 0) {
			throw new RangeError(
				`ByteReader: skip length must be a non-negative integer (n=${n})`
			)
		}

		const next = this.offset + n
		if (next > this.bytes.length) {
			throw new RangeError(
				`ByteReader: skip out of bounds (pos=${this.offset}, n=${n}, length=${this.bytes.length})`
			)
		}
		this.offset = next
	}

	readBytes(n: number): Uint8Array {
		if (!Number.isInteger(n) || n < 0) {
			throw new RangeError(
				`ByteReader: readBytes length must be a non-negative integer (n=${n})`
			)
		}
		if (this.offset + n > this.bytes.length) {
			throw new RangeError(
				`ByteReader: readBytes out of bounds (pos=${this.offset}, n=${n}, length=${this.bytes.length})`
			)
		}
		const bytes = this.bytes.slice(this.offset, this.offset + n)
		this.offset += n
		return bytes
	}

	peekBytes(n: number): Uint8Array {
		if (!Number.isInteger(n) || n < 0) {
			throw new RangeError(
				`ByteReader: peekBytes length must be a non-negative integer (n=${n})`
			)
		}
		if (this.offset + n > this.bytes.length) {
			throw new RangeError(
				`ByteReader: peekBytes out of bounds (pos=${this.offset}, n=${n}, length=${this.bytes.length})`
			)
		}
		return this.bytes.slice(this.offset, this.offset + n)
	}

	readU8(): number {
		if (this.offset + 1 > this.bytes.length) {
			throw new RangeError(
				`ByteReader: readU8 out of bounds (pos=${this.offset}, need=1, length=${this.bytes.length})`
			)
		}
		const value = Number(this.bytes[this.offset])
		this.offset += 1
		return value
	}

	readU16LE(): number {
		if (this.offset + 2 > this.bytes.length) {
			throw new RangeError(
				`ByteReader: readU16LE out of bounds (pos=${this.offset}, need=2, length=${this.bytes.length})`
			)
		}
		const value = this.bytes[this.offset] + this.bytes[this.offset + 1] * 256
		this.offset += 2
		return value
	}

	readU32LE(): number {
		if (this.offset + 4 > this.bytes.length) {
			throw new RangeError(
				`ByteReader: readU32LE out of bounds (pos=${this.offset}, need=4, length=${this.bytes.length})`
			)
		}
		const value =
			this.bytes[this.offset] +
			this.bytes[this.offset + 1] * 256 +
			this.bytes[this.offset + 2] * 256 ** 2 +
			this.bytes[this.offset + 3] * 256 ** 3
		this.offset += 4
		return value
	}

	readU64LE(): bigint {
		if (this.offset + 8 > this.bytes.length) {
			throw new RangeError(
				`ByteReader: readU64LE out of bounds (pos=${this.offset}, need=8, length=${this.bytes.length})`
			)
		}
		const value =
			BigInt(this.bytes[this.offset]) +
			BigInt(this.bytes[this.offset + 1]) * 256n +
			BigInt(this.bytes[this.offset + 2]) * 256n ** 2n +
			BigInt(this.bytes[this.offset + 3]) * 256n ** 3n +
			BigInt(this.bytes[this.offset + 4]) * 256n ** 4n +
			BigInt(this.bytes[this.offset + 5]) * 256n ** 5n +
			BigInt(this.bytes[this.offset + 6]) * 256n ** 6n +
			BigInt(this.bytes[this.offset + 7]) * 256n ** 7n
		this.offset += 8
		return value
	}

	readVarInt(): bigint {
		const decoded = decodeVarInt(this.bytes, this.offset)
		this.offset += decoded.size
		return decoded.value
	}
}
