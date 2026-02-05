/**
 * Transaction ID helpers.
 *
 * The txid is computed as hash256(serialized transaction bytes).
 * Note: human-facing hex is commonly the reverse of the internal little-endian bytes.
 */

import { encodeTransaction } from '../codec/transaction.codec'
import { hash256 } from '../crypto/hash256.crypto'
import { Transaction } from '../primitives/classes/transaction'
import { TxId, txIdFromBytes } from '../primitives/txid.hash'

/**
 * Computes the transaction id (txid) for a serialized transaction.
 *
 * @param tx Transaction object or already-serialized bytes (depending on overload).
 * @returns txid as a 32-byte hash.
 */
export function getTxId(tx: Transaction): TxId {
	return txIdFromBytes(hash256(encodeTransaction(tx)))
}
