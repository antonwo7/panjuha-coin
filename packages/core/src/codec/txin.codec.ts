import { HASH256_SIZE, hash256FromBytes } from '../primitives'
import { TxIn } from '../primitives/classes/txin'
import { MAX_SCRIPT_BYTES } from '../spec/limits'
import { ByteReader } from '../utils/reader'
import { ByteWriter } from '../utils/writer'

export function encodeTxIn(txIn: TxIn): Uint8Array {
	if (txIn.prevTxId.length !== HASH256_SIZE) {
		throw new RangeError('encodeTxIn: prevTxId length must equal HASH256_SIZE')
	}

	const writer = new ByteWriter()

	writer.writeBytes(txIn.prevTxId)
	writer.writeU32LE(txIn.prevIndex)

	writer.writeVarInt(BigInt(txIn.scriptSig.length))
	writer.writeBytes(txIn.scriptSig)

	writer.writeU32LE(txIn.sequence)

	return writer.toUint8Array()
}

export function decodeTxIn(bytes: Uint8Array, offset: number = 0): { txIn: TxIn; offset: number } {
	const reader = new ByteReader(bytes, offset)

	const prevTxId = hash256FromBytes(reader.readBytes(32))
	const prevIndex = reader.readU32LE()

	const scriptSigLength = reader.readVarInt()
	if (scriptSigLength < 0n || scriptSigLength > BigInt(MAX_SCRIPT_BYTES) || scriptSigLength > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw new RangeError('decodeTxIn: scriptSig length out of range')
	}
	if (scriptSigLength > BigInt(reader.remaining)) {
		throw new RangeError('decodeTxIn: scriptSig length exceeds remaining bytes')
	}
	const scriptSig = reader.readBytes(Number(scriptSigLength))

	const sequence = reader.readU32LE()

	const txIn = new TxIn(prevTxId, prevIndex, scriptSig, sequence)

	return {
		txIn,
		offset: reader.position
	}
}
