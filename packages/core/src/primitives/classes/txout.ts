/**
 * Transaction output model.
 *
 * Holds an amount in smallest units and a locking script (scriptPubKey) that controls spending.
 */

import { Amount } from '../amount.number'
import { U64 } from '../u64.number'
/**
 * TxOut creates a new spendable output locked by `scriptPubKey`.
 *
 * Amount must be integer-only (smallest units).
 */

export class TxOut {
	readonly value: Amount
	readonly scriptPubKey: Uint8Array

	constructor(value: bigint, scriptPubKey: Uint8Array) {
		this.value = Amount(value)
		this.scriptPubKey = new Uint8Array(scriptPubKey)
	}
}
