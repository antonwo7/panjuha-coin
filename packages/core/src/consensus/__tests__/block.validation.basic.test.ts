import { describe, it, expect, vi } from 'vitest'
import { MAX_TXS_PER_BLOCK } from '../../spec/limits'
import { REGTEST_PARAMS } from '../params/v0_1'

vi.mock('../../codec/block.codec', () => {
	return {
		encodeBlock: (block: any) => {
			// We allow tests to force an encoded size by setting __encodedSize on the block.
			const size = typeof block?.__encodedSize === 'number' ? block.__encodedSize : 100
			return new Uint8Array(size)
		}
	}
})

import { validateBlockBasic } from '../validation/block.validation'

function mkBlock(overrides: Partial<any> = {}) {
	return {
		header: {
			version: 1,
			prevBlockHash: new Uint8Array(32),
			merkleRoot: new Uint8Array(32),
			time: 1,
			bits: 1,
			nonce: 0
		},
		transactions: [
			{
				// minimal tx shape for validation; block.basic does not inspect tx internals
				version: 1,
				inputs: [],
				outputs: [],
				lockTime: 0
			}
		],
		__encodedSize: 100,
		...overrides
	}
}

describe('consensus/block.validation - validateBlockBasic', () => {
	it('accepts a small block below size/tx limits', () => {
		const res = validateBlockBasic(mkBlock() as any)
		expect(res.ok).toBe(true)
		expect(res.errors).toEqual([])
	})

	it('rejects too many transactions (table)', () => {
		const tooMany = Array.from({ length: MAX_TXS_PER_BLOCK + 1 }, () => mkBlock().transactions[0])
		const res = validateBlockBasic(mkBlock({ transactions: tooMany }) as any)
		expect(res.ok).toBe(false)
		expect(res.errors).toContain(`block.transactions must have <= ${MAX_TXS_PER_BLOCK} txs`)
	})

	it('rejects too large encoded block', () => {
		const res = validateBlockBasic(mkBlock({ __encodedSize: REGTEST_PARAMS.maxBlockSizeBytes + 1 }) as any)
		expect(res.ok).toBe(false)
		expect(res.errors).toContain(`block size must be <= ${REGTEST_PARAMS.maxBlockSizeBytes} bytes`)
	})
})
