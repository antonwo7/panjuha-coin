import { encodeBlockHeader } from '../codec/block-header.codec'
import { BlockHeaderHash } from '../primitives/block-header.hash'
import { BlockHeader } from '../primitives/classes/block-header'
import { hash256 } from './hash256.crypto'

export function getBlockHeaderHash(header: BlockHeader): BlockHeaderHash {
	const headerBytes = encodeBlockHeader(header)
	return hash256(headerBytes) as BlockHeaderHash
}
