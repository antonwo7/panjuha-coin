import { Hash256, hash256FromBytes } from '../primitives/256.hash'
import { sha256 as nativeSha256 } from '@noble/hashes/sha2.js'

export function sha256(data: Uint8Array): Hash256 {
	return hash256FromBytes(nativeSha256(data))
}

export function doubleSha256(data: Uint8Array): Hash256 {
	return sha256(sha256(data))
}
