/**
 * Transaction codec (consensus-critical).
 *
 * Wire layout:
 * - version  : uint32 LE
 * - inputs   : VarArray<TxIn>
 * - outputs  : VarArray<TxOut>
 * - lockTime : uint32 LE
 */

import { Transaction } from '../primitives/classes/transaction'
import { TxIn } from '../primitives/classes/txin'
import { TxOut } from '../primitives/classes/txout'
import { MAX_TX_INPUTS, MAX_TX_OUTPUTS } from '../spec/limits'
import { ByteReader } from '../utils/reader'
import { decodeTxIn, encodeTxIn } from './txin.codec'
import { decodeTxOut, encodeTxOut } from './txout.codec'
import { ByteWriter } from '../utils/writer/writer'

/**
 * Encodes a transaction into its canonical wire form.
 *
 * @param tx Transaction object.
 * @returns Encoded bytes.
 */
export function encodeTransaction(transaction: Transaction): Uint8Array {
	const writer = new ByteWriter()

	writer.writeU32LE(transaction.version)

	writer.writeVarInt(BigInt(transaction.inputs.length))

	transaction.inputs.forEach((input: TxIn) => writer.writeBytes(encodeTxIn(input)))

	writer.writeVarInt(BigInt(transaction.outputs.length))

	transaction.outputs.forEach((output: TxOut) => writer.writeBytes(encodeTxOut(output)))

	writer.writeU32LE(transaction.lockTime)

	return writer.toUint8Array()
}

/**
 * Decodes a transaction from `bytes` starting at `offset`.
 *
 * @param bytes Source buffer.
 * @param offset Starting offset (default: 0).
 * @returns The decoded transaction and the new offset.
 * @throws If the buffer is truncated or malformed.
 */
export function decodeTransaction(bytes: Uint8Array, offset: number = 0): { transaction: Transaction; offset: number } {
	const reader = new ByteReader(bytes, offset)

	const version = reader.readU32LE()

	const inputsLength = reader.readVarInt()
	if (inputsLength < 0n) {
		throw new RangeError('decodeTransaction: inputs length out of range')
	}
	if (inputsLength > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw new RangeError('decodeTransaction: inputs length exceeds MAX_SAFE_INTEGER')
	}
	if (inputsLength > BigInt(MAX_TX_INPUTS)) {
		throw new RangeError('decodeTransaction: inputs length exceeds MAX_TX_INPUTS')
	}

	const inputs = []

	const countInputs = Number(inputsLength)

	for (let i = 0; i < countInputs; i++) {
		const inputData = decodeTxIn(bytes, reader.position)
		inputs.push(inputData.txIn)
		reader.seek(inputData.offset)
	}

	const outputsLength = reader.readVarInt()
	if (outputsLength < 0n) {
		throw new RangeError('decodeTransaction: outputs length out of range')
	}
	if (outputsLength > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw new RangeError('decodeTransaction: outputs length exceeds MAX_SAFE_INTEGER')
	}
	if (outputsLength > BigInt(MAX_TX_OUTPUTS)) {
		throw new RangeError('decodeTransaction: outputs length exceeds MAX_TX_OUTPUTS')
	}

	const outputs = []

	const countOutputs = Number(outputsLength)

	for (let i = 0; i < countOutputs; i++) {
		const outputData = decodeTxOut(bytes, reader.position)
		outputs.push(outputData.txOut)
		reader.seek(outputData.offset)
	}

	const lockTime = reader.readU32LE()

	const transaction = new Transaction(version, inputs, outputs, lockTime)

	return {
		transaction,
		offset: reader.position
	}
}
