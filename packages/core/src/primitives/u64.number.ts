declare const U64Brand: unique symbol

export type U64 = bigint & { readonly [U64Brand]: 'U64' }

export function U64(value: bigint) {
	validateU64(value)
	return value as U64
}

export function isU64(value: bigint): boolean {
	if (value < 0 || value >= 2 ** 64) {
		return false
	}
	return true
}

export function validateU64(value: bigint): void {
	if (value < 0 || value >= 2 ** 64) {
		throw new RangeError('U64: value must be in range [0, 2^64 - 1]')
	}
}
