/**
 * Block header hash helpers.
 *
 * Provides the dedicated type/constructor for a block header hash (32 bytes).
 * Keep this separate from generic Hash256 to reduce accidental mixups.
 */

import {
	Hash256,
	hash256Clone,
	hash256FromBytes,
	hash256FromHex,
	hash256ToHex
} from './256.hash'

declare const BlockHeaderHashBrand: unique symbol
/**
 * BlockHeaderHash is an opaque block header identifier (32 bytes).
 */
export type BlockHeaderHash = Hash256 & {
	readonly [BlockHeaderHashBrand]: 'BlockHeaderHashBrand'
}

/**
 * Constructs the hash wrapper from raw bytes (or a hex string).
 *
 * @param input 32-byte buffer (or hex string, depending on overload).
 * @returns Hash wrapper.
 * @throws If the input length is not exactly 32 bytes (or hex is invalid).
 */
export function blockHashFromBytes(bytes: Uint8Array): BlockHeaderHash {
	return hash256FromBytes<BlockHeaderHash>(bytes)
}

/**
 * Constructs the hash wrapper from raw bytes (or a hex string).
 *
 * @param input 32-byte buffer (or hex string, depending on overload).
 * @returns Hash wrapper.
 * @throws If the input length is not exactly 32 bytes (or hex is invalid).
 */
export function blockHashFromHex(hex: string): BlockHeaderHash {
	return hash256FromHex<BlockHeaderHash>(hex)
}

/**
 * Converts the hash to a hex string.
 *
 * Note: if you follow Bitcoin conventions, display hex may use reversed byte order.
 */
export function blockHashToHex(hash: BlockHeaderHash): string {
	return hash256ToHex<BlockHeaderHash>(hash)
}

/**
 * Hash helper.
 */
export function blockHashClone(hash: BlockHeaderHash): BlockHeaderHash {
	return hash256Clone<BlockHeaderHash>(hash)
}
