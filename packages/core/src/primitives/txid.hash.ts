import { bytesToHex, hexToBytes } from './bytes'
import { Hash256, hash256Clone, hash256FromBytes, hash256FromHex, hash256ToHex, isHash256 } from './256.hash'

declare const TxIdBrand: unique symbol

export type TxId = Hash256 & { readonly [TxIdBrand]: 'TxId' }

export function TxId(value: Uint8Array) {
	return value as TxId
}

export function isTxId(bytes: Uint8Array): boolean {
	return isHash256(bytes)
}

export function txIdFromBytes(bytes: Uint8Array): TxId {
	return hash256FromBytes<TxId>(bytes)
}

export function txIdFromHex(hex: string): TxId {
	return hash256FromHex<TxId>(hex)
}

export function txIdToHex(hash: TxId): string {
	return hash256ToHex<TxId>(hash)
}

export function txIdClone(hash: TxId): TxId {
	return hash256Clone<TxId>(hash)
}
