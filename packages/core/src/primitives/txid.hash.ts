/**
 * txid helpers.
 *
 * txid is a specific 32-byte hash derived from the transaction serialization.
 * The internal representation is bytes; any hex display may involve reversed endianness.
 */

import { bytesToHex, hexToBytes } from './bytes'
import { Hash256, hash256Clone, hash256FromBytes, hash256FromHex, hash256ToHex, isHash256 } from './256.hash'

declare const TxIdBrand: unique symbol
/**
 * TxId is an opaque transaction identifier (32 bytes).
 */

export type TxId = Hash256 & { readonly [TxIdBrand]: 'TxId' }

export function TxId(value: Uint8Array) {
	return value as TxId
}

/**
 * Hash helper.
 */
export function isTxId(bytes: Uint8Array): boolean {
	return isHash256(bytes)
}

/**
 * Constructs the hash wrapper from raw bytes (or a hex string).
 *
 * @param input 32-byte buffer (or hex string, depending on overload).
 * @returns Hash wrapper.
 * @throws If the input length is not exactly 32 bytes (or hex is invalid).
 */
export function txIdFromBytes(bytes: Uint8Array): TxId {
	return hash256FromBytes<TxId>(bytes)
}

/**
 * Constructs the hash wrapper from raw bytes (or a hex string).
 *
 * @param input 32-byte buffer (or hex string, depending on overload).
 * @returns Hash wrapper.
 * @throws If the input length is not exactly 32 bytes (or hex is invalid).
 */
export function txIdFromHex(hex: string): TxId {
	return hash256FromHex<TxId>(hex)
}

/**
 * Converts the hash to a hex string.
 *
 * Note: if you follow Bitcoin conventions, display hex may use reversed byte order.
 */
export function txIdToHex(hash: TxId): string {
	return hash256ToHex<TxId>(hash)
}

/**
 * Hash helper.
 */
export function txIdClone(hash: TxId): TxId {
	return hash256Clone<TxId>(hash)
}
