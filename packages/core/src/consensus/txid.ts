import { encodeTransaction } from '../codec/transaction.codec'
import { hash256 } from '../crypto/hash256.crypto'
import { Transaction } from '../primitives/classes/transaction'
import { TxId, txIdFromBytes } from '../primitives/txid.hash'

export function getTxId(tx: Transaction): TxId {
	return txIdFromBytes(hash256(encodeTransaction(tx)))
}
