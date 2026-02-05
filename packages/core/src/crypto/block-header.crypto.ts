/**
 * Block header hashing helpers.
 *
 * This module ties together header serialization (if applicable) and the hashing function used for PoW.
 * Be careful with endianness: internal byte order and human-facing hex often differ.
 */

import { encodeBlockHeader } from '../codec/block-header.codec'
import { BlockHeaderHash } from '../primitives/block-header.hash'
import { BlockHeader } from '../primitives/classes/block-header'
import { hash256 } from './hash256.crypto'

/**
 * Computes the block header hash used by PoW.
 *
 * @param header BlockHeader (or already-serialized header bytes, depending on the API).
 * @returns 32-byte hash.
 */
export function getBlockHeaderHash(header: BlockHeader): BlockHeaderHash {
	const headerBytes = encodeBlockHeader(header)
	return hash256(headerBytes) as BlockHeaderHash
}
