import { describe, it, expect } from 'vitest'
import { Transaction } from '../../primitives/classes/transaction'
import { TxIn } from '../../primitives/classes/txin'
import { TxOut } from '../../primitives/classes/txout'
import { HASH256_SIZE } from '../../primitives'
import { MAX_TX_INPUTS, MAX_TX_OUTPUTS } from '../../spec/limits'
import { decodeTransaction, encodeTransaction } from '../transaction.codec'
import { bytesFilled, concatBytes, encodeU32LE } from './helpers'
import { encodeVarInt } from '../varint'

describe('transaction.codec', () => {
	it('roundtrip encodeTransaction -> decodeTransaction (table)', () => {
		const mkIn = (seed: number) => new TxIn(bytesFilled(HASH256_SIZE, seed), seed, bytesFilled(seed % 5, seed + 1), 0xfffffffe)

		const mkOut = (seed: number) => new TxOut(BigInt(seed), bytesFilled(seed % 6, seed + 2))

		const cases = [
			{
				name: '1-in 1-out',
				tx: new Transaction(1, [mkIn(1)], [mkOut(1)], 0)
			},
			{
				name: '2-in 2-out',
				tx: new Transaction(2, [mkIn(1), mkIn(2)], [mkOut(3), mkOut(4)], 500)
			}
		] as const

		for (const c of cases) {
			const enc = encodeTransaction(c.tx)
			const dec = decodeTransaction(enc, 0)

			expect(dec.offset).toBe(enc.length)
			expect(dec.transaction.version).toBe(c.tx.version)
			expect(dec.transaction.lockTime).toBe(c.tx.lockTime)

			expect(dec.transaction.inputs.length).toBe(c.tx.inputs.length)
			expect(dec.transaction.outputs.length).toBe(c.tx.outputs.length)

			for (let i = 0; i < c.tx.inputs.length; i++) {
				expect(dec.transaction.inputs[i].prevTxId).toEqual(c.tx.inputs[i].prevTxId)
				expect(dec.transaction.inputs[i].prevIndex).toBe(c.tx.inputs[i].prevIndex)
				expect(dec.transaction.inputs[i].scriptSig).toEqual(c.tx.inputs[i].scriptSig)
				expect(dec.transaction.inputs[i].sequence).toBe(c.tx.inputs[i].sequence)
			}

			for (let i = 0; i < c.tx.outputs.length; i++) {
				expect(dec.transaction.outputs[i].value).toBe(c.tx.outputs[i].value)
				expect(dec.transaction.outputs[i].scriptPubKey).toEqual(c.tx.outputs[i].scriptPubKey)
			}
		}
	})

	it('decodeTransaction rejects inputs length > MAX_SAFE_INTEGER', () => {
		const version = encodeU32LE(1)
		const len = BigInt(Number.MAX_SAFE_INTEGER) + 1n
		const lenBytes = encodeVarInt(len)

		const bytes = concatBytes(version, lenBytes)
		expect(() => decodeTransaction(bytes, 0)).toThrowError(new RangeError('decodeTransaction: inputs length exceeds MAX_SAFE_INTEGER'))
	})

	it('decodeTransaction rejects inputs length > MAX_TX_INPUTS', () => {
		const version = encodeU32LE(1)
		const len = BigInt(MAX_TX_INPUTS) + 1n
		const lenBytes = encodeVarInt(len)

		const bytes = concatBytes(version, lenBytes)
		expect(() => decodeTransaction(bytes, 0)).toThrowError(new RangeError('decodeTransaction: inputs length exceeds MAX_TX_INPUTS'))
	})

	it('decodeTransaction rejects outputs length > MAX_SAFE_INTEGER', () => {
		const version = encodeU32LE(1)
		const inputsLen = encodeVarInt(0n) // no inputs

		const outputsLen = encodeVarInt(BigInt(Number.MAX_SAFE_INTEGER) + 1n)

		const bytes = concatBytes(version, inputsLen, outputsLen)
		expect(() => decodeTransaction(bytes, 0)).toThrowError(new RangeError('decodeTransaction: outputs length exceeds MAX_SAFE_INTEGER'))
	})

	it('decodeTransaction rejects outputs length > MAX_TX_OUTPUTS', () => {
		const version = encodeU32LE(1)
		const inputsLen = encodeVarInt(0n)

		const outputsLen = encodeVarInt(BigInt(MAX_TX_OUTPUTS) + 1n)

		const bytes = concatBytes(version, inputsLen, outputsLen)
		expect(() => decodeTransaction(bytes, 0)).toThrowError(new RangeError('decodeTransaction: outputs length exceeds MAX_TX_OUTPUTS'))
	})
})
