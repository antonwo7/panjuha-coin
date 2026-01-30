import { HASH256_SIZE, hash256FromBytes } from '../primitives'
import { BlockHeader } from '../primitives/classes/block-header'
import { ByteReader } from '../utils/reader'
import { ByteWriter } from '../utils/writer'

export function encodeBlockHeader(header: BlockHeader): Uint8Array {
	if (header.prevBlockHash.length !== HASH256_SIZE) {
		throw new RangeError('encodeBlockHeader: prevBlockHash length must equal HASH256_SIZE')
	}
	if (header.merkleRoot.length !== HASH256_SIZE) {
		throw new RangeError('encodeBlockHeader: merkleRoot length must equal HASH256_SIZE')
	}

	const writer = new ByteWriter()

	writer.writeU32LE(header.version)
	writer.writeBytes(header.prevBlockHash)
	writer.writeBytes(header.merkleRoot)
	writer.writeU32LE(header.time)
	writer.writeU32LE(header.bits)
	writer.writeU32LE(header.nonce)

	return writer.toUint8Array()
}

export function decodeBlockHeader(bytes: Uint8Array, offset: number = 0): { header: BlockHeader; offset: number } {
	const reader = new ByteReader(bytes, offset)

	const version = reader.readU32LE()
	const prevBlockHash = hash256FromBytes(reader.readBytes(32))
	const merkleRoot = hash256FromBytes(reader.readBytes(32))
	const time = reader.readU32LE()
	const bits = reader.readU32LE()
	const nonce = reader.readU32LE()

	const blockHeader = new BlockHeader(version, prevBlockHash, merkleRoot, time, bits, nonce)

	return {
		header: blockHeader,
		offset: reader.position
	}
}
