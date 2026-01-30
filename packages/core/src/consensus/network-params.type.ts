import { Amount } from '../primitives/amount.number'
import { U32 } from '../primitives/u32.number'

export type NetworkParams = {
	networkName: string
	genesisTimestamp: number
	genesisNonce: U32
	genesisBits: U32
	blockTimeSeconds: number
	maxBlockSizeBytes: number
	maxTxsPerBlock: number
	coinbaseMaturity: number
	initialBlockReward: Amount
	halvingInterval: number
}
