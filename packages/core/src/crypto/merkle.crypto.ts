import { concatBytes } from '../primitives/bytes'
import { Hash256 } from '../primitives/256.hash'
import { hash256 } from './hash256.crypto'

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
