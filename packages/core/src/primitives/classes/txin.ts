/**
 * Transaction input model.
 *
 * Points to a previous output (outpoint) and provides an unlocking script (scriptSig).
 * In a UTXO design, inputs consume existing outputs and create new ones via outputs.
 */

import { TxId } from '../txid.hash'
import { U32 } from '../u32.number'
/**
 * TxIn spends a previous output identified by (txid, vout).
 *
 * The `scriptSig` is carried as raw bytes; script evaluation belongs to a separate layer.
 */

export class TxIn {
	readonly prevTxId: TxId
	readonly prevIndex: U32
	readonly scriptSig: Uint8Array
	readonly sequence: U32

	constructor(prevTxId: Uint8Array, prevIndex: number, scriptSig: Uint8Array, sequence: number) {
		this.prevTxId = TxId(prevTxId)
		this.prevIndex = U32(prevIndex)
		this.scriptSig = new Uint8Array(scriptSig)
		this.sequence = U32(sequence)
	}
}
