import { describe, it, expect } from 'vitest'
import { BlockHeader } from '../block-header'

function h32(fill: number): Uint8Array {
	return new Uint8Array(32).fill(fill)
}

describe('block-header', () => {
	it('constructs and defensively copies hash fields', () => {
		const prev = h32(1)
		const merkle = h32(2)

		const h = new BlockHeader(1, prev as any, merkle as any, 100, 0x1d00ffff, 42)

		expect(h.version).toBe(1)
		expect(h.time).toBe(100)
		expect(h.bits).toBe(0x1d00ffff)
		expect(h.nonce).toBe(42)

		// defensive copies
		expect(h.prevBlockHash).not.toBe(prev as any)
		expect(h.merkleRoot).not.toBe(merkle as any)
		expect(h.prevBlockHash).toEqual(prev)
		expect(h.merkleRoot).toEqual(merkle)

		prev[0] = 99
		merkle[0] = 88
		expect(h.prevBlockHash[0]).toBe(1)
		expect(h.merkleRoot[0]).toBe(2)
	})

	it('validates numeric fields (table)', () => {
		const prev = h32(0) as any
		const merkle = h32(0) as any

		const cases: Array<{ name: string; version: number; time: number; bits: number; nonce: number }> = [
			{ name: 'version negative', version: -1, time: 0, bits: 0, nonce: 0 },
			{ name: 'time negative', version: 0, time: -1, bits: 0, nonce: 0 },
			{ name: 'bits negative', version: 0, time: 0, bits: -1, nonce: 0 },
			{ name: 'nonce negative', version: 0, time: 0, bits: 0, nonce: -1 },
			{ name: 'version > u32', version: 2 ** 32, time: 0, bits: 0, nonce: 0 },
			{ name: 'time > u32', version: 0, time: 2 ** 32, bits: 0, nonce: 0 },
			{ name: 'bits > u32', version: 0, time: 0, bits: 2 ** 32, nonce: 0 },
			{ name: 'nonce > u32', version: 0, time: 0, bits: 0, nonce: 2 ** 32 },
		]

		for (const c of cases) {
			expect(() => new BlockHeader(c.version, prev, merkle, c.time, c.bits, c.nonce)).toThrow()
		}
	})
})
