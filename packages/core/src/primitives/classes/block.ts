import { BlockHeader } from './block-header'
import { Transaction } from './transaction'

export class Block {
	readonly header: BlockHeader
	readonly transactions: readonly Transaction[]

	constructor(header: BlockHeader, transactions: readonly Transaction[]) {
		this.header = header
		this.transactions = [...transactions]
	}
}
