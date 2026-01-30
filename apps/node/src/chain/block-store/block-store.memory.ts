import { Hash256, isHash256 } from '@panjuha-coin/core'
import { encodeBlockHeader } from '@panjuha-coin/core/codec/block-header.codec'
import { encodeBlock } from '@panjuha-coin/core/codec/block.codec'
import { hash256 } from '@panjuha-coin/core/crypto/hash256.crypto'
import { Block } from '@panjuha-coin/core/primitives/classes/block'
import * as fs from 'fs'
import { BlockStoreIndeMap } from './block-store.types'

export function put(hash: Hash256, block: Block) {
	if (!block.header) throw new Error('Invalid block header')
	if (!isHash256(hash)) throw new Error('Invalid block hash')

	const blockHash = hash256(encodeBlockHeader(block.header))
	if (hash !== hash256(encodeBlockHeader(block.header))) throw new Error('Invalid block hash')

	const encodedBlock = encodeBlock(block)
}

export function initFromDataToMemoty() {
	const indexMap: BlockStoreIndeMap = new Map()

	const indexData = fs.readFileSync('data/blocks.index')
}
