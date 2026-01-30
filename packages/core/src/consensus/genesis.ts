import { utf8ToBytes } from '@noble/hashes/utils'
import { encodeTransaction } from '../codec/transaction.codec'
import { hash256 } from '../crypto/hash256.crypto'
import { zeroHash256 } from '../primitives'
import { Block } from '../primitives/classes/block'
import { BlockHeader } from '../primitives/classes/block-header'
import { Transaction } from '../primitives/classes/transaction'
import { TxIn } from '../primitives/classes/txin'
import { TxOut } from '../primitives/classes/txout'
import { NetworkParams } from './network-params.type'
import { computeMerkleRoot } from '../crypto'

export function createGenesisBlock(params: NetworkParams): Block {
	const txIn = new TxIn(zeroHash256(), 2 ** 32 - 1, utf8ToBytes('MyCoin genesis 2026-01-24'), 2 ** 32 - 1)

	const txOut = new TxOut(params.initialBlockReward, new Uint8Array())

	const tx = new Transaction(1, [txIn], [txOut], 0)

	const txId = hash256(encodeTransaction(tx))

	const merkleRoot = computeMerkleRoot([txId])

	const genesisBlockHeader = new BlockHeader(
		1,
		zeroHash256(),
		merkleRoot,
		params.genesisTimestamp,
		params.genesisBits,
		params.genesisNonce
	)

	return new Block(genesisBlockHeader, [tx])
}
