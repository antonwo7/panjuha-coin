import { describe, it, expect } from 'vitest'
import { REGTEST_PARAMS } from '../params/v0_1'
import { COIN } from '../../primitives/amount.number'

describe('consensus/v0_1 - REGTEST_PARAMS', () => {
	it('has expected structural fields', () => {
		expect(REGTEST_PARAMS.networkName).toBe('regtest')
		expect(typeof REGTEST_PARAMS.genesisTimestamp).toBe('number')
		expect(typeof REGTEST_PARAMS.blockTimeSeconds).toBe('number')
		expect(typeof REGTEST_PARAMS.maxBlockSizeBytes).toBe('number')
		expect(typeof REGTEST_PARAMS.maxTxsPerBlock).toBe('number')
		expect(typeof REGTEST_PARAMS.coinbaseMaturity).toBe('number')
		expect(typeof REGTEST_PARAMS.halvingInterval).toBe('number')
	})

	it('uses a sane regtest configuration (spot checks)', () => {
		expect(REGTEST_PARAMS.blockTimeSeconds).toBeGreaterThan(0)
		expect(REGTEST_PARAMS.maxBlockSizeBytes).toBeGreaterThan(0)
		expect(REGTEST_PARAMS.maxTxsPerBlock).toBeGreaterThan(0)
		expect(REGTEST_PARAMS.halvingInterval).toBeGreaterThan(0)

		expect(REGTEST_PARAMS.initialBlockReward).toBe(BigInt(50) * BigInt(COIN))
	})
})
