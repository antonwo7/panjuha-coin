export function encodeVarInt(value: bigint): Uint8Array {
	if (value < 0n) {
		throw new RangeError(`VarInt value out of range for u64: ${value}`)
	}

	if (value < 0xfdn) {
		return new Uint8Array([Number(value)])
	}

	if (value <= 0xffffn) {
		return new Uint8Array([
			0xfd,
			Number(value & 0xffn), // low byte
			Number((value >> 8n) & 0xffn) // high byte
		])
	}

	if (value <= 0xffffffffn) {
		return new Uint8Array([
			0xfe,
			Number(value & 0xffn),
			Number((value >> 8n) & 0xffn),
			Number((value >> 16n) & 0xffn),
			Number((value >> 24n) & 0xffn)
		])
	}

	if (value <= 0xffffffffffffffffn) {
		return new Uint8Array([
			0xff,
			Number(value & 0xffn),
			Number((value >> 8n) & 0xffn),
			Number((value >> 16n) & 0xffn),
			Number((value >> 24n) & 0xffn),
			Number((value >> 32n) & 0xffn),
			Number((value >> 40n) & 0xffn),
			Number((value >> 48n) & 0xffn),
			Number((value >> 56n) & 0xffn)
		])
	}

	throw new RangeError(`VarInt value out of range for u64: ${value}`)
}

export function decodeVarInt(bytes: Uint8Array, offset = 0): { value: bigint; size: number } {
	if (offset < 0) {
		throw new RangeError(`Offset less than zero`)
	}
	if (!bytes.length) {
		throw new RangeError(`Unexpected EOF while decoding varint`)
	}
	if (offset >= bytes.length) {
		throw new RangeError(`Unexpected EOF while decoding varint`)
	}

	const prefix = bytes[0 + offset]

	if (prefix < 0xfd) {
		return { value: BigInt(prefix), size: 1 }
	}

	if (prefix === 0xfd) {
		if (offset + 3 > bytes.length) {
			throw new RangeError(`Unexpected EOF while decoding varint`)
		}

		const value = BigInt(bytes[1 + offset]) + BigInt(bytes[2 + offset]) * 256n
		if (value < 0xfdn) {
			throw new RangeError(`Non-canonical varint`)
		}

		return {
			value,
			size: 3
		}
	}

	if (prefix === 0xfe) {
		if (offset + 5 > bytes.length) {
			throw new RangeError(`Unexpected EOF while decoding varint`)
		}

		const value =
			BigInt(bytes[1 + offset]) +
			BigInt(bytes[2 + offset]) * 256n +
			BigInt(bytes[3 + offset]) * 256n ** 2n +
			BigInt(bytes[4 + offset]) * 256n ** 3n
		if (value < 0x10000n) {
			throw new RangeError(`Non-canonical varint`)
		}

		return {
			value,
			size: 5
		}
	}

	if (prefix === 0xff) {
		if (offset + 9 > bytes.length) {
			throw new RangeError(`Unexpected EOF while decoding varint`)
		}

		const value =
			BigInt(bytes[1 + offset]) +
			BigInt(bytes[2 + offset]) * 256n +
			BigInt(bytes[3 + offset]) * 256n ** 2n +
			BigInt(bytes[4 + offset]) * 256n ** 3n +
			BigInt(bytes[5 + offset]) * 256n ** 4n +
			BigInt(bytes[6 + offset]) * 256n ** 5n +
			BigInt(bytes[7 + offset]) * 256n ** 6n +
			BigInt(bytes[8 + offset]) * 256n ** 7n
		if (value < 0x100000000n || value > 0xffffffffffffffffn) {
			throw new RangeError(`Non-canonical varint`)
		}

		return {
			value,
			size: 9
		}
	}

	throw new RangeError(`Invalid varint prefix`)
}
