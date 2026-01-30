import { describe, it, expect } from 'vitest'
import {
	isValidHex,
	bytesToHex,
	hexToBytes,
	bytesEqual,
	concatBytes,
	assertLength,
	hexToBigInt,
	u32FromBytesLE
} from '../bytes'

describe('bytes', () => {
	describe('isValidHex', () => {
		it.each([
			['', true],
			['00', true],
			['0x00', true],
			['0Xff', true],
			['abcd', true],
			['ABCDEF', true],
			['0x', true],
			['0x0', false], // odd length after stripping prefix
			['0', false],
			['zz', false],
			['0xzz', false],
			['01g0', false]
		])('validates %s', (hex, expected) => {
			expect(isValidHex(hex)).toBe(expected)
		})
	})

	describe('bytesToHex / hexToBytes', () => {
		it('round-trips bytes -> hex -> bytes', () => {
			const b = new Uint8Array([0, 1, 2, 15, 16, 255])
			const hex = bytesToHex(b)
			expect(hex).toBe('0001020f10ff')
			expect(hexToBytes(hex)).toEqual(b)
		})

		it('hexToBytes supports 0x prefix', () => {
			expect(hexToBytes('0x0a0b')).toEqual(new Uint8Array([0x0a, 0x0b]))
		})

		it('hexToBytes throws on invalid hex', () => {
			expect(() => hexToBytes('0x0')).toThrowError(new Error('Invalid hex string'))
			expect(() => hexToBytes('zz')).toThrowError(new Error('Invalid hex string'))
		})

		it('bytesToHex throws on invalid byte values (non-Uint8Array input)', () => {
			// Uint8Array guarantees 0..255, so we force invalid via cast
			const weird: any = { reduce: (fn: any, init: any) => fn(init, 999) }
			expect(() => bytesToHex(weird as Uint8Array)).toThrowError(new Error('Invalid byte'))
		})
	})

	describe('bytesEqual', () => {
		it('returns true for same reference', () => {
			const a = new Uint8Array([1, 2, 3])
			expect(bytesEqual(a, a)).toBe(true)
		})

		it('returns false for different lengths', () => {
			expect(bytesEqual(new Uint8Array([1]), new Uint8Array([1, 2]))).toBe(false)
		})

		it('returns false for different content', () => {
			expect(bytesEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4]))).toBe(false)
		})

		it('returns true for equal content', () => {
			expect(bytesEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true)
		})
	})

	describe('concatBytes', () => {
		it('concats multiple parts', () => {
			const out = concatBytes(new Uint8Array([1, 2]), new Uint8Array([]), new Uint8Array([3]))
			expect(out).toEqual(new Uint8Array([1, 2, 3]))
		})

		it('returns empty for no parts', () => {
			expect(concatBytes()).toEqual(new Uint8Array([]))
		})
	})

	describe('assertLength', () => {
		it('does not throw when length matches', () => {
			expect(() => assertLength(new Uint8Array([1, 2]), 2)).not.toThrow()
		})

		it('throws with default message when length mismatches', () => {
			expect(() => assertLength(new Uint8Array([1, 2]), 3)).toThrowError(
				new Error('Invalid length: expected 3, got 2')
			)
		})

		it('throws with named message when length mismatches', () => {
			expect(() => assertLength(new Uint8Array([1, 2]), 3, 'TxId')).toThrowError(
				new Error('Invalid length for TxId: expected 3, got 2')
			)
		})
	})

	describe('hexToBigInt', () => {
		it('parses with and without 0x prefix', () => {
			expect(hexToBigInt('0xff')).toBe(255n)
			expect(hexToBigInt('ff')).toBe(255n)
		})
	})

	describe('u32FromBytesLE', () => {
		it('throws if bytes length < 4', () => {
			expect(() => u32FromBytesLE(new Uint8Array([1, 2, 3]))).toThrowError(
				new Error('Bytes length must be at least 4')
			)
		})

		it('reads little-endian u32 (offset argument does not affect current implementation)', () => {
			const bytes = new Uint8Array([0x78, 0x56, 0x34, 0x12, 0xaa, 0xbb])
			expect(u32FromBytesLE(bytes)).toBe(0x12345678)
			expect(u32FromBytesLE(bytes, 1)).toBe(0x12345678)
		})
	})
})
