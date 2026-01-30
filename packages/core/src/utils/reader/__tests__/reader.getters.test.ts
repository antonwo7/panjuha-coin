import { describe, it, expect } from 'vitest'
import { ByteReader } from '..'

describe('byte reader - getters', () => {
	it('updates position/length/remaining correctly after valid operations', () => {
		const r = new ByteReader(new Uint8Array([1, 2, 3, 4]))

		const snapshots: Array<{ label: string; position: number; length: number; remaining: number }> = []

		const snap = (label: string) => {
			snapshots.push({
				label,
				position: r.position,
				length: r.length,
				remaining: r.remaining
			})
		}

		snap('init')

		r.seek(2)
		snap('after seek(2)')

		r.skip(1)
		snap('after skip(1)')

		r.seek(0)
		r.readU8()
		snap('after readU8')

		r.seek(0)
		r.readU16LE()
		snap('after readU16LE')

		r.seek(0)
		r.readU32LE()
		snap('after readU32LE')

		const expected = [
			{ label: 'init', position: 0, length: 4, remaining: 4 },
			{ label: 'after seek(2)', position: 2, length: 4, remaining: 2 },
			{ label: 'after skip(1)', position: 3, length: 4, remaining: 1 },
			{ label: 'after readU8', position: 1, length: 4, remaining: 3 },
			{ label: 'after readU16LE', position: 2, length: 4, remaining: 2 },
			{ label: 'after readU32LE', position: 4, length: 4, remaining: 0 }
		]

		expect(snapshots).toEqual(expected)
	})

	it('peekBytes does not change getters (table)', () => {
		const r = new ByteReader(new Uint8Array([1, 2, 3, 4]))

		const cases = [
			{ seek: 0, n: 2, expected: new Uint8Array([1, 2]) },
			{ seek: 1, n: 2, expected: new Uint8Array([2, 3]) },
			{ seek: 2, n: 2, expected: new Uint8Array([3, 4]) }
		] as const

		for (const c of cases) {
			r.seek(c.seek)
			const before = { pos: r.position, len: r.length, rem: r.remaining }
			expect(r.peekBytes(c.n)).toEqual(c.expected)
			expect(r.position).toBe(before.pos)
			expect(r.length).toBe(before.len)
			expect(r.remaining).toBe(before.rem)
		}
	})
})
