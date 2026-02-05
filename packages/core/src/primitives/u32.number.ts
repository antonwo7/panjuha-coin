/**
 * U32 helpers.
 *
 * A tiny wrapper/conversion layer to keep 32-bit arithmetic explicit in TypeScript.
 * Useful for wire encoding and consensus rules that are defined over uint32.
 */

declare const U32Brand: unique symbol
/**
 * U32 represents an unsigned 32-bit integer (uint32).
 * Use this where the protocol explicitly specifies uint32 semantics.
 */

export type U32 = number & { readonly [U32Brand]: 'U32' }

/**
 * U32 helper.
 */
export function U32(value: number) {
	validateU32(value)
	return value as U32
}

/**
 * U32 helper.
 */
export function isU32(value: number): boolean {
	if (Number.isNaN(value)) {
		return false
	}
	if (!Number.isFinite(value)) {
		return false
	}
	if (!Number.isInteger(value)) {
		return false
	}
	if (value < 0 || value >= 2 ** 32) {
		return false
	}
	return true
}

/**
 * U32 helper.
 */
export function validateU32(value: number): void {
	if (Number.isNaN(value)) {
		throw new RangeError('U32: value must not be NaN')
	}
	if (!Number.isFinite(value)) {
		throw new RangeError('U32: value must be a finite number')
	}
	if (!Number.isInteger(value)) {
		throw new RangeError('U32: value must be an integer')
	}
	if (value < 0 || value >= 2 ** 32) {
		throw new RangeError('U32: value must be in range [0, 2^32 - 1]')
	}
}
