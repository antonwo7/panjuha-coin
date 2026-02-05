/**
 * Block header model.
 *
 * This is the consensus surface: the serialized header bytes are what miners hash.
 * Keep the fields minimal and stable; any change is a protocol change.
 */

import { Hash256, hash256Clone } from '../256.hash'
import { U32 } from '../u32.number'
/**
 * BlockHeader represents the 80-byte (Bitcoin-like) header fields that are hashed for Proof-of-Work.
 *
 * Notes:
 * - `prevBlockHash` and `merkleRoot` are 32-byte digests (opaque bytes here).
 * - `bits` is the compact target representation.
 */

export class BlockHeader {
	readonly version: U32
	readonly prevBlockHash: Hash256
	readonly merkleRoot: Hash256
	readonly time: U32
	readonly bits: U32
	readonly nonce: U32

	constructor(
		version: number,
		prevBlockHash: Hash256,
		merkleRoot: Hash256,
		time: number,
		bits: number,
		nonce: number
	) {
		this.version = U32(version)
		this.prevBlockHash = hash256Clone(prevBlockHash)
		this.merkleRoot = hash256Clone(merkleRoot)
		this.time = U32(time)
		this.bits = U32(bits)
		this.nonce = U32(nonce)
	}
}
