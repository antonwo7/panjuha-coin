import { describe, it, expect } from 'vitest'
import { ByteReader } from '..'

describe('byte reader - constructor', () => {
	it('initializes correctly for valid offsets (table)', () => {
		const bytes = new Uint8Array([1, 2, 3, 4])

		const cases = [
			{ offset: 0, pos: 0, remaining: 4 },
			{ offset: 2, pos: 2, remaining: 2 },
			{ offset: 4, pos: 4, remaining: 0 }
		] as const

		for (const c of cases) {
			const r = new ByteReader(bytes, c.offset)
			expect(r.position).toBe(c.pos)
			expect(r.length).toBe(4)
			expect(r.remaining).toBe(c.remaining)
		}
	})

	it('throws if offset is not an integer (table)', () => {
		const bytes = new Uint8Array([1, 2, 3])

		const cases: Array<{ offset: number }> = [
			{ offset: 0.5 },
			{ offset: Number.NaN },
			{ offset: Number.POSITIVE_INFINITY },
			{ offset: Number.NEGATIVE_INFINITY }
		]

		for (const c of cases) {
			expect(() => new ByteReader(bytes, c.offset)).toThrowError(
				new RangeError('ByteReader: offset must be an integer')
			)
		}
	})

	it('throws if offset is out of range (table)', () => {
		const bytes = new Uint8Array([1, 2, 3])

		const cases = [
			{ offset: -1, msg: 'ByteReader: offset out of range (offset=-1, length=3)' },
			{ offset: 4, msg: 'ByteReader: offset out of range (offset=4, length=3)' }
		] as const

		for (const c of cases) {
			expect(() => new ByteReader(bytes, c.offset)).toThrowError(new RangeError(c.msg))
		}
	})
})
