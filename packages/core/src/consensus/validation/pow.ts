import { encodeBlockHeader } from '@panjuha-coin/core/codec/block-header.codec'
import { hash256 } from '@panjuha-coin/core/crypto/hash256.crypto'
import { bytesToHex, hexToBigInt } from '@panjuha-coin/core/primitives'
import { BlockHeader } from '@panjuha-coin/core/primitives/classes/block-header'
import { U32 } from '@panjuha-coin/core/primitives/u32.number'

export function verifyPoW(blockHeader: BlockHeader, bits: U32): boolean {
	const bhHash = hash256(encodeBlockHeader(blockHeader))
	const hashInt = hexToBigInt(bytesToHex(bhHash))

	const E = bits >>> 24
	if (E < 3) return false

	const M = bits & 0x00ffffff
	if (M === 0) return false

	const target = BigInt(M) << (8n * BigInt(E - 3))

	return hashInt <= target
}
