import { describe, it, expect } from 'vitest'
import { hash256 } from '../hash256.crypto'

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
}

describe('hash256.crypto (double sha256)', () => {
	it('computes hash256 known vectors (table)', () => {
		const enc = new TextEncoder()
		const cases: Array<{ name: string; input: Uint8Array; expectedHex: string }> = [
			{
				name: 'empty',
				input: new Uint8Array([]),
				expectedHex: '5df6e0e2761359d30a8275058e299fcc0381534545f55cf43e41983f5d4c9456'
			},
			{
				name: 'abc',
				input: enc.encode('abc'),
				expectedHex: '4f8b42c22dd3729b519ba6f68d2da7cc5b2d606d05daed5ad5128cc03e6c6358'
			},
			{
				name: 'hello',
				input: enc.encode('hello'),
				expectedHex: '9595c9df90075148eb06860365df33584b75bff782a510c6cd4883a419833d50'
			},
			{
				name: 'hello world',
				input: enc.encode('hello world'),
				expectedHex: 'bc62d4b80d9e36da29c16c5d4d9f11731f36052c72401a76c23c0fb5a9b74423'
			},
			{
				name: '32x00',
				input: new Uint8Array(32),
				expectedHex: '2b32db6c2c0a6235fb1397e8225ea85e0f0e6e8c7b126d0016ccbde0e667151e'
			}
		]

		for (const c of cases) {
			const got = hash256(c.input)
			expect(got).toBeInstanceOf(Uint8Array)
			expect(got.length).toBe(32)
			expect(bytesToHex(got)).toBe(c.expectedHex)
		}
	})

	it('returns a new array each time', () => {
		const input = new TextEncoder().encode('abc')
		const a = hash256(input)
		const b = hash256(input)
		expect(a).toEqual(b)
		expect(a).not.toBe(b)
	})
})
