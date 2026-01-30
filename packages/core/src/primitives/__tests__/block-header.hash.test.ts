import { describe, it, expect } from 'vitest'
import { blockHashFromBytes, blockHashFromHex, blockHashToHex, blockHashClone } from '../block-header.hash'

describe('block-header.hash', () => {
	const hex = 'aa'.repeat(32)

	it('blockHashFromHex -> blockHashToHex round-trip', () => {
		const h = blockHashFromHex(hex)
		expect(blockHashToHex(h)).toBe(hex)
	})

	it('blockHashFromBytes clones (defensive copy)', () => {
		const src = new Uint8Array(32)
		src[0] = 1
		const h = blockHashFromBytes(src)
		src[0] = 9
		expect(h[0]).toBe(1)
	})

	it('blockHashClone returns a new array', () => {
		const h = blockHashFromHex(hex)
		const c = blockHashClone(h)
		expect(c).not.toBe(h)
		expect(blockHashToHex(c)).toBe(hex)
	})
})
