import {
	Hash256,
	hash256Clone,
	hash256FromBytes,
	hash256FromHex,
	hash256ToHex
} from './256.hash'

declare const BlockHeaderHashBrand: unique symbol
export type BlockHeaderHash = Hash256 & {
	readonly [BlockHeaderHashBrand]: 'BlockHeaderHashBrand'
}

export function blockHashFromBytes(bytes: Uint8Array): BlockHeaderHash {
	return hash256FromBytes<BlockHeaderHash>(bytes)
}

export function blockHashFromHex(hex: string): BlockHeaderHash {
	return hash256FromHex<BlockHeaderHash>(hex)
}

export function blockHashToHex(hash: BlockHeaderHash): string {
	return hash256ToHex<BlockHeaderHash>(hash)
}

export function blockHashClone(hash: BlockHeaderHash): BlockHeaderHash {
	return hash256Clone<BlockHeaderHash>(hash)
}
