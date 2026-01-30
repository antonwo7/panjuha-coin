import { describe, it, expect } from 'vitest'
import { Amount, COIN, isAmount, validateAmount } from '../amount.number'
import { MAX_MONEY } from '../../spec/limits'

describe('amount.number', () => {
	it('exports COIN constant', () => {
		expect(COIN).toBe(1000000n)
	})

	describe('isAmount', () => {
		it.each([
			{ name: '0n', value: 0n, ok: true },
			{ name: '1n', value: 1n, ok: true },
			{ name: 'MAX_MONEY', value: MAX_MONEY, ok: true },

			{ name: '-1n', value: -1n, ok: false },
			{ name: 'MAX_MONEY + 1', value: MAX_MONEY + 1n, ok: false },
			{ name: '2^64 (out of range)', value: 1n << 64n, ok: false }
		])('returns $ok for $name', ({ value, ok }) => {
			expect(isAmount(value)).toBe(ok)
		})
	})

	describe('validateAmount', () => {
		it.each([
			{ name: '0n', value: 0n },
			{ name: '1n', value: 1n },
			{ name: 'MAX_MONEY', value: MAX_MONEY }
		])('does not throw for valid amount: $name', ({ value }) => {
			expect(() => validateAmount(value)).not.toThrow()
		})

		it('throws for negative', () => {
			expect(() => validateAmount(-1n)).toThrowError(RangeError)
		})

		it('throws for >= 2^64', () => {
			expect(() => validateAmount(1n << 64n)).toThrowError(RangeError)
		})

		it('throws for > MAX_MONEY', () => {
			expect(() => validateAmount(MAX_MONEY + 1n)).toThrowError(RangeError)
		})
	})

	describe('Amount()', () => {
		it('returns the same bigint value (brands it)', () => {
			const v = Amount(1n)
			expect(v).toBe(1n)
		})

		it('throws for invalid values', () => {
			expect(() => Amount(-1n)).toThrowError(RangeError)
			expect(() => Amount(MAX_MONEY + 1n)).toThrowError(RangeError)
			expect(() => Amount(1n << 64n)).toThrowError(RangeError)
		})
	})
})
