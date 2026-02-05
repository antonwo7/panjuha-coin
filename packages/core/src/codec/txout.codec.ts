/**
 * Transaction output codec (consensus-critical).
 *
 * Wire layout (Bitcoin-like):
 * - value        : uint64 LE (smallest unit)
 * - scriptPubKey : VarBytes (CompactSize length + bytes)
 */

import { TxOut } from '../primitives/classes/txout'
import { MAX_SCRIPT_PUBKEY_BYTES } from '../spec/limits'
import { ByteReader } from '../utils/reader'
import { ByteWriter } from '../utils/writer/writer'

/**
 * Encodes a transaction output into wire bytes.
 *
 * @param output Transaction output.
 * @returns Encoded bytes.
 */
export function encodeTxOut(txOut: TxOut): Uint8Array {
	const writer = new ByteWriter()

	writer.writeU64LE(txOut.value)

	writer.writeVarInt(BigInt(txOut.scriptPubKey.length))
	writer.writeBytes(txOut.scriptPubKey)

	return writer.toUint8Array()
}

/**
 * Decodes a transaction output from `bytes` starting at `offset`.
 *
 * @param bytes Source buffer.
 * @param offset Starting offset (default: 0).
 * @returns The decoded output and the new offset.
 * @throws If the buffer is truncated or malformed.
 */
export function decodeTxOut(bytes: Uint8Array, offset: number = 0): { txOut: TxOut; offset: number } {
	const reader = new ByteReader(bytes, offset)

	const value = reader.readU64LE()

	const scriptPubKeyLength = reader.readVarInt()
	if (
		scriptPubKeyLength < 0n ||
		scriptPubKeyLength > BigInt(MAX_SCRIPT_PUBKEY_BYTES) ||
		scriptPubKeyLength > BigInt(Number.MAX_SAFE_INTEGER)
	) {
		throw new RangeError('decodeTxOut: scriptPubKey length out of range')
	}
	if (scriptPubKeyLength > BigInt(reader.remaining)) {
		throw new RangeError('decodeTxOut: scriptPubKey length exceeds remaining bytes')
	}
	const scriptPubKey = reader.readBytes(Number(scriptPubKeyLength))

	const txOut = new TxOut(value, scriptPubKey)

	return {
		txOut,
		offset: reader.position
	}
}
