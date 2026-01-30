import { describe, it, expect } from 'vitest'
import { ByteReader } from '..'

describe('byte reader - errors (table driven)', () => {
	it('seek throws on invalid pos and does not change offset (table)', () => {
		const r = new ByteReader(new Uint8Array([1, 2, 3, 4]))
		r.seek(2)

		const cases: Array<{ pos: number; msg: string }> = [
			{ pos: 0.5, msg: 'ByteReader: position must be an integer' },
			{ pos: Number.NaN, msg: 'ByteReader: position must be an integer' }
		]

		for (const c of cases) {
			expect(() => r.seek(c.pos)).toThrowError(new RangeError(c.msg))
			expect(r.position).toBe(2)
		}

		const oobCases = [
			{ pos: -1, msg: 'ByteReader: seek out of bounds (pos=-1, length=4)' },
			{ pos: 5, msg: 'ByteReader: seek out of bounds (pos=5, length=4)' }
		] as const

		for (const c of oobCases) {
			expect(() => r.seek(c.pos)).toThrowError(new RangeError(c.msg))
			expect(r.position).toBe(2)
		}
	})

	it('skip throws on invalid n and does not change offset (table)', () => {
		const r = new ByteReader(new Uint8Array([1, 2, 3, 4]))
		r.seek(2)

		const cases: Array<{ n: number; msg: string }> = [
			{
				n: -1,
				msg: 'ByteReader: skip length must be a non-negative integer (n=-1)'
			},
			{
				n: 0.5,
				msg: 'ByteReader: skip length must be a non-negative integer (n=0.5)'
			},
			{
				n: Number.NaN,
				msg: 'ByteReader: skip length must be a non-negative integer (n=NaN)'
			}
		]

		for (const c of cases) {
			expect(() => r.skip(c.n)).toThrowError(new RangeError(c.msg))
			expect(r.position).toBe(2)
		}
	})

	it('skip throws out of bounds and does not change offset', () => {
		const r = new ByteReader(new Uint8Array([1, 2, 3, 4]))
		r.seek(3)

		expect(() => r.skip(2)).toThrowError(
			new RangeError('ByteReader: skip out of bounds (pos=3, n=2, length=4)')
		)
		expect(r.position).toBe(3)
		expect(r.remaining).toBe(1)
	})

	it('readBytes throws on invalid n and out of bounds (table)', () => {
		const r = new ByteReader(new Uint8Array([1, 2, 3, 4]))
		r.seek(1)

		const invalid = [
			{
				n: -1,
				msg: 'ByteReader: readBytes length must be a non-negative integer (n=-1)'
			},
			{
				n: 0.5,
				msg: 'ByteReader: readBytes length must be a non-negative integer (n=0.5)'
			},
			{
				n: Number.NaN,
				msg: 'ByteReader: readBytes length must be a non-negative integer (n=NaN)'
			}
		] as const

		for (const c of invalid) {
			const before = r.position
			expect(() => r.readBytes(c.n)).toThrowError(new RangeError(c.msg))
			expect(r.position).toBe(before)
		}

		r.seek(3)
		expect(() => r.readBytes(2)).toThrowError(
			new RangeError('ByteReader: readBytes out of bounds (pos=3, n=2, length=4)')
		)
		expect(r.position).toBe(3)
	})

	it('peekBytes throws on invalid n and out of bounds (table)', () => {
		const r = new ByteReader(new Uint8Array([1, 2, 3, 4]))
		r.seek(1)

		const invalid = [
			{
				n: -1,
				msg: 'ByteReader: peekBytes length must be a non-negative integer (n=-1)'
			},
			{
				n: 0.5,
				msg: 'ByteReader: peekBytes length must be a non-negative integer (n=0.5)'
			},
			{
				n: Number.NaN,
				msg: 'ByteReader: peekBytes length must be a non-negative integer (n=NaN)'
			}
		] as const

		for (const c of invalid) {
			const before = r.position
			expect(() => r.peekBytes(c.n)).toThrowError(new RangeError(c.msg))
			expect(r.position).toBe(before)
		}

		r.seek(3)
		expect(() => r.peekBytes(2)).toThrowError(
			new RangeError('ByteReader: peekBytes out of bounds (pos=3, n=2, length=4)')
		)
		expect(r.position).toBe(3)
	})

	it('readU8/readU16LE/readU32LE/readU64LE throw on out of bounds and do not change offset (table)', () => {
		const cases = [
			{
				name: 'readU8',
				bytes: new Uint8Array([1]),
				seek: 1,
				call: (r: ByteReader) => r.readU8(),
				msg: 'ByteReader: readU8 out of bounds (pos=1, need=1, length=1)',
				posAfter: 1
			},
			{
				name: 'readU16LE',
				bytes: new Uint8Array([0x34]),
				seek: 0,
				call: (r: ByteReader) => r.readU16LE(),
				msg: 'ByteReader: readU16LE out of bounds (pos=0, need=2, length=1)',
				posAfter: 0
			},
			{
				name: 'readU32LE',
				bytes: new Uint8Array([1, 2, 3]),
				seek: 0,
				call: (r: ByteReader) => r.readU32LE(),
				msg: 'ByteReader: readU32LE out of bounds (pos=0, need=4, length=3)',
				posAfter: 0
			},
			{
				name: 'readU64LE',
				bytes: new Uint8Array([1, 2, 3, 4, 5, 6, 7]),
				seek: 0,
				call: (r: ByteReader) => r.readU64LE(),
				msg: 'ByteReader: readU64LE out of bounds (pos=0, need=8, length=7)',
				posAfter: 0
			}
		] as const

		for (const c of cases) {
			const r = new ByteReader(c.bytes)
			r.seek(c.seek)
			expect(() => c.call(r)).toThrowError(new RangeError(c.msg))
			expect(r.position).toBe(c.posAfter)
		}
	})

	it('readVarInt throws on truncated input and does not change offset', () => {
		// 0xfd prefix requires 2 more bytes but only 1 provided
		const r = new ByteReader(new Uint8Array([0xfd, 0x01]))
		const before = r.position

		expect(() => r.readVarInt()).toThrow()
		expect(r.position).toBe(before)
	})
})
