/**
 * U64 helpers.
 *
 * TypeScript numbers cannot represent all uint64 values safely, so this module usually
 * relies on bigint for correctness. Treat conversions carefully.
 */

declare const U64Brand: unique symbol
/**
 * U64 represents an unsigned 64-bit integer (uint64).
 * Prefer bigint-backed operations to avoid precision loss.
 */

export type U64 = bigint & { readonly [U64Brand]: 'U64' }

/**
 * U64 helper.
 */
export function U64(value: bigint) {
	validateU64(value)
	return value as U64
}

/**
 * U64 helper.
 */
export function isU64(value: bigint): boolean {
	if (value < 0 || value >= 2 ** 64) {
		return false
	}
	return true
}

/**
 * U64 helper.
 */
export function validateU64(value: bigint): void {
	if (value < 0 || value >= 2 ** 64) {
		throw new RangeError('U64: value must be in range [0, 2^64 - 1]')
	}
}
