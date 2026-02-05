/**
 * Block model.
 *
 * A block is a header plus an ordered list of transactions.
 * Validation rules (PoW, merkle root, tx semantics) live outside the model.
 */

import { BlockHeader } from './block-header'
import { Transaction } from './transaction'
/**
 * Block is a block header plus an ordered list of transactions.
 *
 * Ordering matters: it affects the merkle root and therefore the block id.
 */

export class Block {
	readonly header: BlockHeader
	readonly transactions: readonly Transaction[]

	constructor(header: BlockHeader, transactions: readonly Transaction[]) {
		this.header = header
		this.transactions = [...transactions]
	}
}
