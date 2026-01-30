declare const U32Brand: unique symbol

export type U32 = number & { readonly [U32Brand]: 'U32' }

export function U32(value: number) {
	validateU32(value)
	return value as U32
}

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
