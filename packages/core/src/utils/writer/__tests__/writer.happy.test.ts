import { describe, it, expect } from 'vitest'
import { ByteWriter } from '../writer'

function hex(u8: Uint8Array): string {
	return Array.from(u8)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
}

describe('bytewriter - happy', () => {
	it('starts empty and toUint8Array returns a copy', () => {
		const w = new ByteWriter()

		const out1 = w.toUint8Array()
		expect(out1).toEqual(new Uint8Array([]))

		// write one byte and get snapshot
		w.writeU8(0xaa)
		const out2 = w.toUint8Array()
		expect(out2).toEqual(new Uint8Array([0xaa]))

		// mutate returned array must not affect internal buffer
		out2[0] = 0xbb
		const out3 = w.toUint8Array()
		expect(out3).toEqual(new Uint8Array([0xaa]))
	})

	it('writes u8/u16le/u32le/u64le in little-endian', () => {
		const w = new ByteWriter()
		w.writeU8(0xaa)
		w.writeU16LE(0x1234)
		w.writeU32LE(0x12345678)
		w.writeU64LE(0x0807060504030201n)

		expect(hex(w.toUint8Array())).toBe(
			// aa | 34 12 | 78 56 34 12 | 01 02 03 04 05 06 07 08
			'aa' + '3412' + '78563412' + '0102030405060708'
		)
	})

	it('writeBytes appends bytes (including empty)', () => {
		const w = new ByteWriter()

		w.writeBytes(new Uint8Array([1, 2, 3]))
		w.writeBytes(new Uint8Array([]))
		w.writeBytes(new Uint8Array([4]))

		expect(w.toUint8Array()).toEqual(new Uint8Array([1, 2, 3, 4]))
	})

	it('writeVarInt writes canonical varint encodings (table-driven)', () => {
		const cases: Array<{ value: bigint; expectedHex: string }> = [
			{ value: 0n, expectedHex: '00' },
			{ value: 1n, expectedHex: '01' },
			{ value: 252n, expectedHex: 'fc' },
			// 253 => 0xfd + u16le(0x00fd)
			{ value: 253n, expectedHex: 'fdfd00' },
			// 65535 => 0xfd + ffff
			{ value: 65535n, expectedHex: 'fdffff' },
			// 65536 => 0xfe + u32le(0x00010000)
			{ value: 65536n, expectedHex: 'fe00000100' },
			// 2^32 => 0xff + u64le(0x0000000100000000)
			{ value: 4294967296n, expectedHex: 'ff0000000001000000' }
		]

		for (const tc of cases) {
			const w = new ByteWriter()
			w.writeVarInt(tc.value)
			expect(hex(w.toUint8Array())).toBe(tc.expectedHex)
		}
	})

	it('can chain mixed writes and end with correct buffer', () => {
		const w = new ByteWriter()

		w.writeU8(0x00)
		w.writeVarInt(252n)
		w.writeVarInt(253n)
		w.writeU16LE(0xabcd)
		w.writeBytes(new Uint8Array([9, 9]))

		expect(hex(w.toUint8Array())).toBe(
			'00' + 'fc' + 'fdfd00' + 'cdab' + '0909'
		)
	})
})
