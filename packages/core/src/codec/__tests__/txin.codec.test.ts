import { describe, it, expect } from 'vitest'
import { TxIn } from '../../primitives/classes/txin'
import { HASH256_SIZE } from '../../primitives'
import { MAX_SCRIPT_BYTES } from '../../spec/limits'
import { decodeTxIn, encodeTxIn } from '../txin.codec'
import { bytesFilled, concatBytes } from './helpers'
import { encodeVarInt } from '../varint'

describe('txin.codec', () => {
	it('encodeTxIn throws if prevTxId length != HASH256_SIZE', () => {
		const bad = new Uint8Array(HASH256_SIZE - 1)
		const txIn = new TxIn(bad, 0, new Uint8Array(), 0)
		expect(() => encodeTxIn(txIn)).toThrowError(
			new RangeError('encodeTxIn: prevTxId length must equal HASH256_SIZE')
		)
	})

	it('roundtrip encodeTxIn -> decodeTxIn (table)', () => {
		const cases = [
			{
				name: 'empty scriptSig',
				txIn: new TxIn(bytesFilled(HASH256_SIZE, 9), 1, new Uint8Array(), 0xffffffff)
			},
			{
				name: 'small scriptSig',
				txIn: new TxIn(bytesFilled(HASH256_SIZE, 7), 5, bytesFilled(3, 1), 123)
			}
		] as const

		for (const c of cases) {
			const encoded = encodeTxIn(c.txIn)
			const decoded = decodeTxIn(encoded, 0)

			expect(decoded.offset).toBe(encoded.length)
			expect(decoded.txIn.prevTxId).toEqual(c.txIn.prevTxId)
			expect(decoded.txIn.prevIndex).toBe(c.txIn.prevIndex)
			expect(decoded.txIn.scriptSig).toEqual(c.txIn.scriptSig)
			expect(decoded.txIn.sequence).toBe(c.txIn.sequence)
		}
	})

	it('decodeTxIn rejects scriptSig length out of range', () => {
		// Build: prevTxId(32) + prevIndex(4) + varint(len) + script + sequence(4)
		const prevTxId = bytesFilled(HASH256_SIZE, 1)
		const prevIndex = new Uint8Array([0, 0, 0, 0])

		// MAX_SCRIPT_BYTES+1 triggers out-of-range (and we don't need to provide the script bytes)
		const len = BigInt(MAX_SCRIPT_BYTES) + 1n
		const lenBytes = encodeVarInt(len)

		const minimal = concatBytes(prevTxId, prevIndex, lenBytes)
		expect(() => decodeTxIn(minimal, 0)).toThrowError(
			new RangeError('decodeTxIn: scriptSig length out of range')
		)
	})

	it('decodeTxIn rejects scriptSig length exceeding remaining bytes', () => {
		const prevTxId = bytesFilled(HASH256_SIZE, 1)
		const prevIndex = new Uint8Array([0, 0, 0, 0])

		const lenBytes = encodeVarInt(10n) // says 10 bytes, but we provide none
		const bytes = concatBytes(prevTxId, prevIndex, lenBytes)

		expect(() => decodeTxIn(bytes, 0)).toThrowError(
			new RangeError('decodeTxIn: scriptSig length exceeds remaining bytes')
		)
	})
})