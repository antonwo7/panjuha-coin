import { describe, it, expect } from 'vitest'
import { U32, isU32, validateU32 } from '../u32.number'

describe('u32.number', () => {
	describe('isU32', () => {
		const ok: Array<[string, number]> = [
			['0', 0],
			['1', 1],
			['max', 2 ** 32 - 1]
		]

		it.each(ok)('returns true for %s', (_name, v) => {
			expect(isU32(v)).toBe(true)
		})

		const bad: Array<[string, any]> = [
			['NaN', Number.NaN],
			['Infinity', Number.POSITIVE_INFINITY],
			['-Infinity', Number.NEGATIVE_INFINITY],
			['float', 1.5],
			['negative', -1],
			['too big', 2 ** 32]
		]

		it.each(bad)('returns false for %s', (_name, v) => {
			expect(isU32(v)).toBe(false)
		})
	})

	describe('validateU32', () => {
		const cases: Array<[string, number, string]> = [
			['NaN', Number.NaN, 'U32: value must not be NaN'],
			['Infinity', Number.POSITIVE_INFINITY, 'U32: value must be a finite number'],
			['-Infinity', Number.NEGATIVE_INFINITY, 'U32: value must be a finite number'],
			['float', 1.5, 'U32: value must be an integer'],
			['negative', -1, 'U32: value must be in range [0, 2^32 - 1]'],
			['too big', 2 ** 32, 'U32: value must be in range [0, 2^32 - 1]']
		]

		it.each(cases)('throws for %s', (_name, v, msg) => {
			expect(() => validateU32(v)).toThrowError(new RangeError(msg))
		})

		it('does not throw for valid values', () => {
			expect(() => validateU32(0)).not.toThrow()
			expect(() => validateU32(2 ** 32 - 1)).not.toThrow()
		})
	})

	describe('U32()', () => {
		it('returns the value as branded type for valid input', () => {
			const v = U32(123)
			expect(v).toBe(123)
		})

		it('throws for invalid input (delegates to validateU32)', () => {
			expect(() => U32(1.5)).toThrowError(new RangeError('U32: value must be an integer'))
		})
	})
})
