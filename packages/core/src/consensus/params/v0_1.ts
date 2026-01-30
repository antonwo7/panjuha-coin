import { Amount, COIN } from '@panjuha-coin/core/primitives/amount.number'
import { U32 } from '@panjuha-coin/core/primitives/u32.number'
import type { NetworkParams } from '../network-params.type'

export const REGTEST_PARAMS: NetworkParams = {
	networkName: 'regtest',
	genesisTimestamp: 1769283659,
	genesisNonce: U32(235268768),
	genesisBits: U32(545259519),
	blockTimeSeconds: 30,
	maxBlockSizeBytes: 1000000,
	maxTxsPerBlock: 1000000,
	coinbaseMaturity: 0,
	initialBlockReward: Amount(BigInt(50) * COIN),
	halvingInterval: 10
}
