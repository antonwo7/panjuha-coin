import { describe, it, expect } from 'vitest'
import {
	HASH256_SIZE,
	isHash256,
	hash256FromBytes,
	hash256FromHex,
	hash256ToHex,
	zeroHash256,
	hash256Clone
} from '../256.hash'

describe('256.hash (hash256)', () => {
	it('HASH256_SIZE is 32', () => {
		expect(HASH256_SIZE).toBe(32)
	})

	describe('isHash256', () => {
		it.each([
			['len 0', new Uint8Array(0), false],
			['len 31', new Uint8Array(31), false],
			['len 32', new Uint8Array(32), true],
			['len 33', new Uint8Array(33), false]
		])('%s', (_name, v, expected) => {
			expect(isHash256(v)).toBe(expected)
		})
	})

	describe('hash256FromBytes', () => {
		it('throws with detailed message on wrong length', () => {
			expect(() => hash256FromBytes(new Uint8Array(31))).toThrowError(
				new Error('Invalid length for Hash256: expected 32, got 31')
			)
		})

		it('clones input (defensive copy)', () => {
			const src = new Uint8Array(32)
			src[0] = 1
			const h = hash256FromBytes(src)
			src[0] = 9
			expect(h[0]).toBe(1)
		})
	})

	describe('hash256FromHex / hash256ToHex', () => {
		it('round-trips hex <-> hash', () => {
			const hex = '00'.repeat(31) + 'ff'
			const h = hash256FromHex(hex)
			expect(hash256ToHex(h)).toBe(hex)
		})
	})

	describe('zeroHash256', () => {
		it('returns 32 zero bytes', () => {
			const z = zeroHash256()
			expect(z.length).toBe(32)
			expect(hash256ToHex(z as any)).toBe('00'.repeat(32))
		})
	})

	describe('hash256Clone', () => {
		it('returns a new Uint8Array with same bytes', () => {
			const src = hash256FromBytes(new Uint8Array(32))
			src[0] = 7
			const c = hash256Clone(src)
			expect(c).not.toBe(src)
			expect(c).toEqual(src)
		})
	})
})
