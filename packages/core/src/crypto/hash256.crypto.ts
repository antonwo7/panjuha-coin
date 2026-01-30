import { doubleSha256 } from './sha256.crypto'

export function hash256(bytes: Uint8Array) {
	return doubleSha256(bytes)
}
