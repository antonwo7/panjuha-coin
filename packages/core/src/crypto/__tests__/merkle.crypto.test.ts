import { describe, it, expect } from 'vitest'
import { computeMerkleRoot } from '../merkle.crypto'
import { hash256FromBytes } from '../../primitives/256.hash'

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
}

function fill32(byte: number): Uint8Array {
	return new Uint8Array(32).fill(byte)
}

describe('merkle.crypto', () => {
	it('throws for empty txids', () => {
		expect(() => computeMerkleRoot([] as any)).toThrowError(new Error('No txids'))
	})

	it('computes merkle root for 1/2/3 txids (table)', () => {
		const tx1 = hash256FromBytes(fill32(1))
		const tx2 = hash256FromBytes(fill32(2))
		const tx3 = hash256FromBytes(fill32(3))

		const cases: Array<{ name: string; txids: any[]; expectedHex: string }> = [
			{
				name: 'one txid (no hashing at this layer)',
				txids: [tx1],
				expectedHex: bytesToHex(fill32(1))
			},
			{
				name: 'two txids',
				txids: [tx1, tx2],
				expectedHex: '652fa427cfd9a052ee1fd8ec02d0bc9cd65458d6632ce654ff1b2a2c31f20d0d'
			},
			{
				name: 'three txids (duplicates last)',
				txids: [tx1, tx2, tx3],
				expectedHex: 'a93d4f8b8df3d0f6a854f2319d83c5fd2eec20c1543da5d3818e58255aef2b5c'
			}
		]

		for (const c of cases) {
			const got = computeMerkleRoot(c.txids as any)
			expect(got).toBeInstanceOf(Uint8Array)
			expect(got.length).toBe(32)
			expect(bytesToHex(got)).toBe(c.expectedHex)
		}
	})

	it('is deterministic and does not mutate txid arrays', () => {
		const original = fill32(7)
		const tx = hash256FromBytes(original)

		const a = computeMerkleRoot([tx] as any)
		const b = computeMerkleRoot([tx] as any)

		expect(a).toEqual(b)
		expect(bytesToHex(original)).toBe('07'.repeat(32))
	})
})
