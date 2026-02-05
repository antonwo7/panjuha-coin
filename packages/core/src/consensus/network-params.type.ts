/**
 * Network parameters (chain constants).
 *
 * These values define the network identity and consensus settings (block time, limits, emission schedule).
 * Changing any of them after launch effectively creates a different chain.
 */

import { Amount } from '../primitives/amount.number'
import { U32 } from '../primitives/u32.number'
/**
 * NetworkParams defines the chain constants for a given network (e.g. regtest/testnet/mainnet).
 * It is effectively part of the protocol: nodes must agree on these values.
 */

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
