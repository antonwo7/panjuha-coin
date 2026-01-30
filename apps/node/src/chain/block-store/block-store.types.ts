import { Hash256 } from '@panjuha-coin/core'
import { U32 } from '@panjuha-coin/core/primitives/u32.number'
import { U64 } from '@panjuha-coin/core/primitives/u64.number'

export type BlockStoreIndexPayload = { offset: U64; length: U32 }
export type BlockStoreIndex = BlockStoreIndexPayload & { hash: Hash256 }
export type BlockStoreIndexMap = Map<string, BlockStoreIndexPayload>

export type BlockStoreRecord = {
	length: U32
	payload: Uint8Array
}
