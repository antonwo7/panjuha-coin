/**
 * Merkle tree utilities.
 *
 * Implements a Bitcoin-style merkle root:
 * - leaves are transaction hashes (32 bytes)
 * - when a level has an odd number of nodes, the last one is duplicated
 *
 * This is consensus-sensitive: the odd-node duplication rule must be stable.
 */

import { concatBytes } from '../primitives/bytes'
import { Hash256 } from '../primitives/256.hash'
import { hash256 } from './hash256.crypto'

/**
 * Computes the merkle root for the given leaf hashes.
 *
 * Rules:
 * - leaves are treated as opaque 32-byte hashes
 * - if a level has an odd number of nodes, the last hash is duplicated
 *
 * @param leaves List of 32-byte hashes.
 * @returns Merkle root (32 bytes). For an empty list, behavior depends on design (usually zero-hash).
 */
export function computeMerkleRoot(txids: Hash256[]): Hash256 {
	if (txids.length === 0)
		throw new Error('Merkle root requires at least 1 txid')

	let len = txids.length
	let tempids = [...txids]

	while (len > 1) {
		const tempLevel: Hash256[] = []
		for (let j = 0; j < len; j = j + 2) {
			const cur = tempids[j]
			const next = tempids[j + 1] === undefined ? cur : tempids[j + 1]
			tempLevel.push(hash256(concatBytes(cur, next)))
		}
		tempids = tempLevel
		len = tempLevel.length
	}

	return tempids[0]
}
