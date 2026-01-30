import { describe, it, expect } from 'vitest'
import { decodeVarInt, encodeVarInt } from '../varint'

function u8(...xs: number[]): Uint8Array {
	return new Uint8Array(xs)
}

// Table-driven vectors for Bitcoin-style VarInt
describe('varint', () => {
	describe('encodeVarInt', () => {
		it.each([
			{ name: '0', value: 0n, hex: '00', bytes: u8(0x00) },
			{ name: '252 (0xfc)', value: 252n, hex: 'fc', bytes: u8(0xfc) },
			{ name: '253 (0xfd)', value: 253n, hex: 'fdfd00', bytes: u8(0xfd, 0xfd, 0x00) },
			{ name: '65535 (0xffff)', value: 65535n, hex: 'fdffff', bytes: u8(0xfd, 0xff, 0xff) },
			{ name: '65536 (0x10000)', value: 65536n, hex: 'fe00000100', bytes: u8(0xfe, 0x00, 0x00, 0x01, 0x00) },
			{ name: '0xffffffff', value: 0xffffffffn, hex: 'feffffffff', bytes: u8(0xfe, 0xff, 0xff, 0xff, 0xff) },
			{
				name: '0x100000000',
				value: 0x100000000n,
				hex: 'ff0000000001000000',
				bytes: u8(0xff, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00)
			},
			{
				name: 'max u64',
				value: 0xffffffffffffffffn,
				hex: 'ffffffffffffffffff',
				bytes: u8(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff)
			}
		])('encodes $name', ({ value, bytes }) => {
			expect(encodeVarInt(value)).toEqual(bytes)
		})

		it('throws for negative', () => {
			expect(() => encodeVarInt(-1n)).toThrowError(
				new RangeError('VarInt value out of range for u64: -1')
			)
		})

		it('throws for > max u64', () => {
			const v = 0x1_0000_0000_0000_0000n // 2^64
			expect(() => encodeVarInt(v)).toThrowError(
				new RangeError(`VarInt value out of range for u64: ${v}`)
			)
		})
	})

	describe('decodeVarInt', () => {
		it.each([
			{ name: '0', bytes: u8(0x00), offset: 0, value: 0n, size: 1 },
			{ name: '252', bytes: u8(0xfc), offset: 0, value: 252n, size: 1 },

			{ name: '253', bytes: u8(0xfd, 0xfd, 0x00), offset: 0, value: 253n, size: 3 },
			{ name: '65535', bytes: u8(0xfd, 0xff, 0xff), offset: 0, value: 65535n, size: 3 },

			{ name: '65536', bytes: u8(0xfe, 0x00, 0x00, 0x01, 0x00), offset: 0, value: 65536n, size: 5 },
			{
				name: '0xffffffff',
				bytes: u8(0xfe, 0xff, 0xff, 0xff, 0xff),
				offset: 0,
				value: 0xffffffffn,
				size: 5
			},

			{
				name: '0x100000000',
				bytes: u8(0xff, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00),
				offset: 0,
				value: 0x100000000n,
				size: 9
			},
			{
				name: 'max u64',
				bytes: u8(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff),
				offset: 0,
				value: 0xffffffffffffffffn,
				size: 9
			},

			// Offset support
			{
				name: 'offset=2 reads correct prefix',
				bytes: u8(0xaa, 0xbb, 0xfd, 0xfd, 0x00),
				offset: 2,
				value: 253n,
				size: 3
			}
		])('decodes $name', ({ bytes, offset, value, size }) => {
			const out = decodeVarInt(bytes, offset)
			expect(out).toEqual({ value, size })
		})

		it.each([
			{ name: 'offset < 0', bytes: u8(0x00), offset: -1, msg: 'Offset less than zero' },
			{ name: 'empty bytes', bytes: u8(), offset: 0, msg: 'Unexpected EOF while decoding varint' },
			{ name: 'offset >= length', bytes: u8(0x00), offset: 1, msg: 'Unexpected EOF while decoding varint' }
		])('throws for $name', ({ bytes, offset, msg }) => {
			expect(() => decodeVarInt(bytes, offset)).toThrowError(new RangeError(msg))
		})

		it.each([
			// Non-canonical: 0xfd but value < 0xfd
			{ name: '0xfd non-canonical (value=1)', bytes: u8(0xfd, 0x01, 0x00) },
			// Non-canonical: 0xfe but value < 0x10000
			{ name: '0xfe non-canonical (value=1)', bytes: u8(0xfe, 0x01, 0x00, 0x00, 0x00) },
			// Non-canonical: 0xff but value < 0x100000000
			{ name: '0xff non-canonical (value=1)', bytes: u8(0xff, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00) }
		])('throws Non-canonical varint for $name', ({ bytes }) => {
			expect(() => decodeVarInt(bytes, 0)).toThrowError(new RangeError('Non-canonical varint'))
		})

		it.each([
			{ name: '0xfd truncated', bytes: u8(0xfd, 0x00), msg: 'Unexpected EOF while decoding varint' },
			{ name: '0xfe truncated', bytes: u8(0xfe, 0x00, 0x00, 0x00), msg: 'Unexpected EOF while decoding varint' },
			{ name: '0xff truncated', bytes: u8(0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), msg: 'Unexpected EOF while decoding varint' }
		])('throws EOF for $name', ({ bytes, msg }) => {
			expect(() => decodeVarInt(bytes, 0)).toThrowError(new RangeError(msg))
		})
	})
})