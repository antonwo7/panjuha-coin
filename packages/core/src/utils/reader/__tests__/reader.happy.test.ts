import { describe, it, expect } from 'vitest'
import { ByteReader } from '..'

describe('byte reader - happy path (table driven)', () => {
	it('seek: sets position correctly (table)', () => {
		const r = new ByteReader(new Uint8Array([1, 2, 3, 4]))

		const cases = [
			{ pos: 0, expectedRem: 4 },
			{ pos: 3, expectedRem: 1 },
			{ pos: 4, expectedRem: 0 },
			{ pos: 1, expectedRem: 3 }
		] as const

		for (const c of cases) {
			r.seek(c.pos)
			expect(r.position).toBe(c.pos)
			expect(r.remaining).toBe(c.expectedRem)
		}
	})

	it('skip: advances position correctly (table)', () => {
		const r = new ByteReader(new Uint8Array([1, 2, 3, 4]))

		const cases = [
			{ start: 0, n: 0, end: 0 },
			{ start: 0, n: 2, end: 2 },
			{ start: 2, n: 2, end: 4 }
		] as const

		for (const c of cases) {
			r.seek(c.start)
			r.skip(c.n)
			expect(r.position).toBe(c.end)
		}
	})

	it('readBytes: returns correct bytes and advances (table)', () => {
		const r = new ByteReader(new Uint8Array([1, 2, 3, 4]))

		const cases = [
			{ start: 0, n: 0, out: new Uint8Array([]), end: 0 },
			{ start: 0, n: 2, out: new Uint8Array([1, 2]), end: 2 },
			{ start: 2, n: 2, out: new Uint8Array([3, 4]), end: 4 }
		] as const

		for (const c of cases) {
			r.seek(c.start)
			expect(r.readBytes(c.n)).toEqual(c.out)
			expect(r.position).toBe(c.end)
		}
	})

	it('peekBytes: returns correct bytes without advancing (table)', () => {
		const r = new ByteReader(new Uint8Array([1, 2, 3, 4]))

		const cases = [
			{ start: 0, n: 0, out: new Uint8Array([]) },
			{ start: 0, n: 2, out: new Uint8Array([1, 2]) },
			{ start: 1, n: 2, out: new Uint8Array([2, 3]) }
		] as const

		for (const c of cases) {
			r.seek(c.start)
			const before = r.position
			expect(r.peekBytes(c.n)).toEqual(c.out)
			expect(r.position).toBe(before)
		}
	})

	it('readU8/readU16LE/readU32LE/readU64LE: decode little-endian correctly (table)', () => {
		const cases = [
			{
				name: 'readU8: 0x00, 0xff',
				bytes: new Uint8Array([0x00, 0xff]),
				run: (r: ByteReader) => [r.readU8(), r.readU8()],
				expected: [0, 255],
				finalPos: 2
			},
			{
				name: 'readU16LE: 0x1234 then 255',
				bytes: new Uint8Array([0x34, 0x12, 0xff, 0x00]),
				run: (r: ByteReader) => [r.readU16LE(), r.readU16LE()],
				expected: [0x1234, 255],
				finalPos: 4
			},
			{
				name: 'readU32LE: 0x12345678 then 0xffffffff',
				bytes: new Uint8Array([0x78, 0x56, 0x34, 0x12, 0xff, 0xff, 0xff, 0xff]),
				run: (r: ByteReader) => [r.readU32LE(), r.readU32LE()],
				expected: [0x12345678, 0xffffffff],
				finalPos: 8
			},
			{
				name: 'readU64LE: 0x0807060504030201n',
				bytes: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
				run: (r: ByteReader) => [r.readU64LE()],
				expected: [0x0807060504030201n],
				finalPos: 8
			},
			{
				name: 'readU64LE: max u64',
				bytes: new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]),
				run: (r: ByteReader) => [r.readU64LE()],
				expected: [18446744073709551615n],
				finalPos: 8
			}
		] as const

		for (const c of cases) {
			const r = new ByteReader(c.bytes)
			expect(c.run(r)).toEqual(c.expected)
			expect(r.position).toBe(c.finalPos)
			expect(r.remaining).toBe(r.length - c.finalPos)
		}
	})

	it('readVarInt: decodes standard cases (table)', () => {
		const cases = [
			{
				name: '1-byte varints',
				bytes: new Uint8Array([0x00, 0x01, 0xfc]),
				expected: [0n, 1n, 252n],
				finalPos: 3
			},
			{
				name: '0xfd prefix (u16)',
				bytes: new Uint8Array([0xfd, 0xfd, 0x00, 0xfd, 0xff, 0xff]),
				expected: [253n, 65535n],
				finalPos: 6
			},
			{
				name: '0xfe prefix (u32)',
				bytes: new Uint8Array([0xfe, 0x00, 0x00, 0x01, 0x00]),
				expected: [65536n],
				finalPos: 5
			},
			{
				name: '0xff prefix (u64)',
				bytes: new Uint8Array([0xff, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]),
				expected: [4294967296n],
				finalPos: 9
			}
		] as const

		for (const c of cases) {
			const r = new ByteReader(c.bytes)
			const out: bigint[] = []
			for (let i = 0; i < c.expected.length; i++) out.push(r.readVarInt())
			expect(out).toEqual(c.expected)
			expect(r.position).toBe(c.finalPos)
			expect(r.remaining).toBe(0)
		}
	})

	it('readBytes/peekBytes return a copy (slice)', () => {
		const src = new Uint8Array([1, 2, 3, 4])
		const r = new ByteReader(src)

		const a = r.peekBytes(2)
		a[0] = 99
		expect(src).toEqual(new Uint8Array([1, 2, 3, 4]))

		const b = r.readBytes(2)
		b[0] = 88
		expect(src).toEqual(new Uint8Array([1, 2, 3, 4]))
	})
})
