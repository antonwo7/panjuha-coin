import { TxId } from '../txid.hash'
import { U32 } from '../u32.number'

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
