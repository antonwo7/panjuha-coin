import { describe, it, expect } from 'vitest'
import { TxOut } from '../../primitives/classes/txout'
import { MAX_SCRIPT_PUBKEY_BYTES } from '../../spec/limits'
import { decodeTxOut, encodeTxOut } from '../txout.codec'
import { bytesFilled, concatBytes, encodeU64LE } from './helpers'
import { encodeVarInt } from '../varint'

describe('txout.codec', () => {
	it('roundtrip encodeTxOut -> decodeTxOut (table)', () => {
		const cases = [
			{
				name: 'empty scriptPubKey',
				txOut: new TxOut(0n, new Uint8Array())
			},
			{
				name: 'small scriptPubKey',
				txOut: new TxOut(123n, bytesFilled(5, 3))
			}
		] as const

		for (const c of cases) {
			const encoded = encodeTxOut(c.txOut)
			const decoded = decodeTxOut(encoded, 0)

			expect(decoded.offset).toBe(encoded.length)
			expect(decoded.txOut.value).toBe(c.txOut.value)
			expect(decoded.txOut.scriptPubKey).toEqual(c.txOut.scriptPubKey)
		}
	})

	it('decodeTxOut rejects scriptPubKey length out of range', () => {
		const value = encodeU64LE(1n)
		const len = BigInt(MAX_SCRIPT_PUBKEY_BYTES) + 1n
		const lenBytes = encodeVarInt(len)

		const bytes = concatBytes(value, lenBytes)
		expect(() => decodeTxOut(bytes, 0)).toThrowError(
			new RangeError('decodeTxOut: scriptPubKey length out of range')
		)
	})

	it('decodeTxOut rejects scriptPubKey length exceeding remaining bytes', () => {
		const value = encodeU64LE(1n)
		const lenBytes = encodeVarInt(10n) // says 10 bytes but provide none

		const bytes = concatBytes(value, lenBytes)
		expect(() => decodeTxOut(bytes, 0)).toThrowError(
			new RangeError('decodeTxOut: scriptPubKey length exceeds remaining bytes')
		)
	})
})