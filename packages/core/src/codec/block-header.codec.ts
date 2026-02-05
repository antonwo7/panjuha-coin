/**
 * BlockHeader codec (consensus-critical).
 *
 * Wire layout (Bitcoin-like):
 * - version       : uint32 LE
 * - prevBlockHash : 32 bytes
 * - merkleRoot    : 32 bytes
 * - time          : uint32 LE
 * - bits          : uint32 LE
 * - nonce         : uint32 LE
 */

import { HASH256_SIZE, hash256FromBytes } from '../primitives'
import { BlockHeader } from '../primitives/classes/block-header'
import { ByteReader } from '../utils/reader'
import { ByteWriter } from '../utils/writer'

/**
 * Encodes a block header into wire bytes.
 *
 * @param header Block header object.
 * @returns Wire representation (exact bytes hashed for PoW).
 */
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

/**
 * Decodes a block header from `bytes` starting at `offset`.
 *
 * @param bytes Source buffer.
 * @param offset Starting offset (default: 0).
 * @returns The decoded header and the new offset.
 * @throws If the buffer is truncated.
 */
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
