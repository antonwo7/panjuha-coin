import { MAX_MONEY } from '../spec/limits'
import { U64 } from './u64.number'

export const COIN: bigint = BigInt(1000000)

declare const AmountBrand: unique symbol

export type Amount = U64 & { readonly [AmountBrand]: 'Amount' }

export function Amount(value: bigint): Amount {
	validateAmount(value)
	return value as Amount
}

export function isAmount(value: bigint): boolean {
	if (value < 0n || value >= 2n ** 64n) return false
	if (value > MAX_MONEY) return false
	return true
}

export function validateAmount(value: bigint): void {
	if (value < 0n || value >= 2n ** 64n) {
		throw new RangeError('Amount: value must be in range [0, 2^64 - 1]')
	}
	if (value > MAX_MONEY) {
		throw new RangeError('Amount: value must be in range [0, MAX_MONEY]')
	}
}
