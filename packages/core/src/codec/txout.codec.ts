import { TxOut } from '../primitives/classes/txout'
import { MAX_SCRIPT_PUBKEY_BYTES } from '../spec/limits'
import { ByteReader } from '../utils/reader'
import { ByteWriter } from '../utils/writer/writer'

export function encodeTxOut(txOut: TxOut): Uint8Array {
	const writer = new ByteWriter()

	writer.writeU64LE(txOut.value)

	writer.writeVarInt(BigInt(txOut.scriptPubKey.length))
	writer.writeBytes(txOut.scriptPubKey)

	return writer.toUint8Array()
}

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
