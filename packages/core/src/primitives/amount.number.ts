/**
 * Amount helpers (smallest denomination).
 *
 * Amounts are represented in the chain's smallest unit (satoshi-like).
 * Prefer bigint under the hood to avoid rounding and overflow issues.
 */

import { MAX_MONEY } from '../spec/limits'
import { U64 } from './u64.number'

export const COIN: bigint = BigInt(1000000)

declare const AmountBrand: unique symbol
/**
 * Amount represents a value in the smallest currency unit.
 * Keep it integer-only; never use floating point math for amounts.
 */

export type Amount = U64 & { readonly [AmountBrand]: 'Amount' }

/**
 * Amount helper.
 */
export function Amount(value: bigint): Amount {
	validateAmount(value)
	return value as Amount
}

/**
 * Amount helper.
 */
export function isAmount(value: bigint): boolean {
	if (value < 0n || value >= 2n ** 64n) return false
	if (value > MAX_MONEY) return false
	return true
}

/**
 * Amount helper.
 */
export function validateAmount(value: bigint): void {
	if (value < 0n || value >= 2n ** 64n) {
		throw new RangeError('Amount: value must be in range [0, 2^64 - 1]')
	}
	if (value > MAX_MONEY) {
		throw new RangeError('Amount: value must be in range [0, MAX_MONEY]')
	}
}
