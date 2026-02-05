/**
 * Block codec (consensus-critical).
 *
 * Wire layout:
 * - header       : BlockHeader
 * - txCount      : VarInt (CompactSize)
 * - transactions : txCount * Transaction
 */

import { Block } from '../primitives/classes/block'
import { Transaction } from '../primitives/classes/transaction'
import { MAX_TXS_PER_BLOCK } from '../spec/limits'
import { decodeBlockHeader, encodeBlockHeader } from './block-header.codec'
import { ByteReader } from '../utils/reader'
import { decodeTransaction, encodeTransaction } from './transaction.codec'
import { ByteWriter } from '../utils/writer/writer'

/**
 * Encodes a full block (header + transactions) into wire bytes.
 *
 * @param block Block object.
 * @returns Encoded bytes.
 */
export function encodeBlock(block: Block): Uint8Array {
	const writer = new ByteWriter()

	writer.writeBytes(encodeBlockHeader(block.header))

	writer.writeVarInt(BigInt(block.transactions.length))

	block.transactions.forEach((tx: Transaction) => writer.writeBytes(encodeTransaction(tx)))

	return writer.toUint8Array()
}

/**
 * Decodes a block from `bytes` starting at `offset`.
 *
 * @param bytes Source buffer.
 * @param offset Starting offset (default: 0).
 * @returns The decoded block and the new offset.
 * @throws If the buffer is truncated or malformed.
 */
export function decodeBlock(bytes: Uint8Array, offset: number = 0): { block: Block; offset: number } {
	const reader = new ByteReader(bytes, offset)

	const headerData = decodeBlockHeader(bytes, reader.position)
	const header = headerData.header

	reader.seek(headerData.offset)

	const txsLength = reader.readVarInt()
	if (txsLength < 0n) {
		throw new RangeError('decodeBlock: transactions length out of range')
	}
	if (txsLength > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw new RangeError('decodeBlock: transactions length exceeds MAX_SAFE_INTEGER')
	}
	if (txsLength > BigInt(MAX_TXS_PER_BLOCK)) {
		throw new RangeError('decodeBlock: transactions length exceeds MAX_TXS_PER_BLOCK')
	}

	const txs: Transaction[] = []

	const countTransactions = Number(txsLength)

	for (let i = 0; i < countTransactions; i++) {
		const txData = decodeTransaction(bytes, reader.position)
		txs.push(txData.transaction)
		reader.seek(txData.offset)
	}

	const block = new Block(header, txs)

	return {
		block,
		offset: reader.position
	}
}
