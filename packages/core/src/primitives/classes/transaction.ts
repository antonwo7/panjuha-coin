/**
 * Transaction model.
 *
 * Transactions are serialized in a canonical order and hashed to produce txid.
 * The model is intentionally "dumb": it holds data; validation is handled elsewhere.
 */

import { U32 } from '../u32.number'
import { TxIn } from './txin'
import { TxOut } from './txout'
/**
 * Transaction is a list of inputs and outputs plus version/locktime fields.
 *
 * The txid is computed from the canonical serialization of this structure.
 */

export class Transaction {
	readonly version: U32
	readonly inputs: readonly TxIn[]
	readonly outputs: readonly TxOut[]
	readonly lockTime: U32

	constructor(
		version: number,
		inputs: TxIn[],
		outputs: TxOut[],
		lockTime: number
	) {
		this.version = U32(version)
		this.inputs = [...inputs]
		this.outputs = [...outputs]
		this.lockTime = U32(lockTime)
	}
}
