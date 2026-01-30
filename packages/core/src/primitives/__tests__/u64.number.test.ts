import { describe, it, expect } from 'vitest'
import { U64, isU64, validateU64 } from '../u64.number'

describe('u64.number', () => {
	const MAX_U64 = (2n ** 64n) - 1n
	const TOO_BIG = 2n ** 64n

	describe('isU64', () => {
		const ok: Array<[string, bigint]> = [
			['0', 0n],
			['1', 1n],
			['max', MAX_U64]
		]

		it.each(ok)('returns true for %s', (_name, v) => {
			expect(isU64(v)).toBe(true)
		})

		const bad: Array<[string, bigint]> = [
			['negative', -1n],
			['too big', TOO_BIG]
		]

		it.each(bad)('returns false for %s', (_name, v) => {
			expect(isU64(v)).toBe(false)
		})
	})

	describe('validateU64', () => {
		it('does not throw for valid values', () => {
			expect(() => validateU64(0n)).not.toThrow()
			expect(() => validateU64(MAX_U64)).not.toThrow()
		})

		it.each([
			['negative', -1n],
			['too big', TOO_BIG]
		])('throws for %s', (_name, v) => {
			expect(() => validateU64(v)).toThrowError(
				new RangeError('U64: value must be in range [0, 2^64 - 1]')
			)
		})
	})

	describe('U64()', () => {
		it('returns the value as branded type for valid input', () => {
			const v = U64(10n)
			expect(v).toBe(10n)
		})

		it('throws for invalid input (delegates to validateU64)', () => {
			expect(() => U64(-1n)).toThrowError(
				new RangeError('U64: value must be in range [0, 2^64 - 1]')
			)
		})
	})
})
