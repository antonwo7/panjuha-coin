import { describe, it, expect, vi } from 'vitest'

vi.mock('@panjuha-coin/core/crypto/hash256.crypto', () => {
	return {
		// Return a NEW Uint8Array each time to reflect typical hashing behaviour.
		hash256: (bytes: Uint8Array) => new Uint8Array(32).fill(bytes.length & 0xff)
	}
})

vi.mock('../../codec/block-header.codec', () => {
	return {
		encodeBlockHeader: (_hdr: any) => new Uint8Array([1, 2, 3])
	}
})

vi.mock('../../crypto/merkle-root.crypto', () => {
	return {
		computeMerkleRoot: (_txs: any[]) => new Uint8Array(32).fill(9)
	}
})

import { validateBlockForChain } from '../validation/block.validation'
import { REGTEST_PARAMS } from '../params/v0_1'

function mkHeader(overrides: Partial<any> = {}) {
	return {
		version: 1,
		prevBlockHash: new Uint8Array(32).fill(0),
		merkleRoot: new Uint8Array(32).fill(9),
		time: 100,
		bits: 1,
		nonce: 0,
		...overrides
	}
}

function mkBlock(overrides: Partial<any> = {}) {
	return {
		header: mkHeader(),
		transactions: [],
		...overrides
	}
}

describe('consensus/block.validation - validateBlockForChain', () => {
	it('rejects height mismatch', () => {
		const res = validateBlockForChain(mkBlock(), 10, REGTEST_PARAMS)
		expect(res.ok).toBe(false)
		expect(res.errors).toContain('block height mismatch')
	})

	it('rejects missing prev header when height > 0', () => {
		const res = validateBlockForChain(mkBlock() as any, 1, REGTEST_PARAMS)
		expect(res.ok).toBe(false)
		expect(res.errors).toContain('prevBlockHeader missing for non-genesis block')
	})

	it('reports prevBlockHash mismatch and merkleRoot mismatch (current behaviour)', () => {
		const res = validateBlockForChain(mkBlock(), mkHeader(), REGTEST_PARAMS)

		expect(res.ok).toBe(false)
		expect(res.errors).toContain('prevBlockHash mismatch')
		expect(res.errors).toContain('merkleRoot mismatch')
	})
})
