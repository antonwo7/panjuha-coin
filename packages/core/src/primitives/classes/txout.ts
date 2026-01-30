import { Amount } from '../amount.number'
import { U64 } from '../u64.number'

export class TxOut {
	readonly value: Amount
	readonly scriptPubKey: Uint8Array

	constructor(value: bigint, scriptPubKey: Uint8Array) {
		this.value = Amount(value)
		this.scriptPubKey = new Uint8Array(scriptPubKey)
	}
}
