import { describe, it, expect } from 'vitest'
import { sha256 } from '../sha256.crypto'

/**
 * Helper: hex string -> Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
	if (hex.length % 2 !== 0) throw new Error('hex string must have even length')
	const out = new Uint8Array(hex.length / 2)
	for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
	return out
}

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
}

describe('sha256.crypto', () => {
	it('computes sha256 known vectors (table)', () => {
		const cases: Array<{ name: string; input: Uint8Array; expectedHex: string }> = [
			{
				name: 'empty',
				input: new Uint8Array([]),
				expectedHex: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
			},
			{
				name: 'abc',
				input: new TextEncoder().encode('abc'),
				expectedHex: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
			},
			{
				name: 'hello',
				input: new TextEncoder().encode('hello'),
				expectedHex: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
			},
			{
				name: 'hello world',
				input: new TextEncoder().encode('hello world'),
				expectedHex: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
			},
			{
				name: '32x00',
				input: new Uint8Array(32),
				expectedHex: '66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925'
			}
		]

		for (const c of cases) {
			const got = sha256(c.input)
			expect(got).toBeInstanceOf(Uint8Array)
			expect(got.length).toBe(32)
			expect(bytesToHex(got)).toBe(c.expectedHex)
		}
	})

	it('does not mutate the input', () => {
		const input = new Uint8Array([1, 2, 3])
		const snapshot = new Uint8Array(input)
		sha256(input)
		expect(input).toEqual(snapshot)
	})

	it('returns a new Uint8Array instance each time', () => {
		const input = new TextEncoder().encode('abc')
		const a = sha256(input)
		const b = sha256(input)
		expect(a).toEqual(b)
		expect(a).not.toBe(b)
		// and the bytes still match expected
		expect(bytesToHex(a)).toBe(
			'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
		)
	})
})
