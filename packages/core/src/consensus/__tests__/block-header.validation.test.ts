import { describe, it, expect } from 'vitest'
import { validateBlockHeader } from '../validation/block-header.validation'

function mkHeader(overrides: Partial<any> = {}) {
	return {
		version: 1,
		prevBlockHash: new Uint8Array(32),
		merkleRoot: new Uint8Array(32),
		time: 123,
		bits: 0x1d00ffff,
		nonce: 0,
		...overrides
	}
}

describe('consensus/block-header.validation', () => {
	it('accepts a minimal sane header', () => {
		const res = validateBlockHeader(mkHeader() as any)
		expect(res.ok).toBe(true)
		expect(res.errors).toEqual([])
	})

	it('rejects invalid version/time/bits/nonce (table)', () => {
		const cases = [
			{ name: 'version <= 0', hdr: mkHeader({ version: 0 }), err: 'header.version must be > 0' },
			{ name: 'time <= 0', hdr: mkHeader({ time: 0 }), err: 'header.time must be > 0' },
			{ name: 'bits <= 0', hdr: mkHeader({ bits: 0 }), err: 'header.bits must be > 0' },
			{ name: 'nonce < 0', hdr: mkHeader({ nonce: -1 }), err: 'header.nonce must be >= 0' }
		] as const

		for (const tc of cases) {
			const res = validateBlockHeader(tc.hdr as any)
			expect(res.ok, tc.name).toBe(false)
			expect(res.errors).toContain(tc.err)
		}
	})
})
