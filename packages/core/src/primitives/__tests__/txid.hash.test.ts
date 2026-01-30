import { describe, it, expect } from 'vitest'
import { txIdFromBytes, txIdFromHex, txIdToHex, txIdClone, isTxId } from '../txid.hash'

describe('txid.hash', () => {
	const hex = '11'.repeat(32)

	it('isTxId delegates to isHash256 (length 32)', () => {
		expect(isTxId(new Uint8Array(32))).toBe(true)
		expect(isTxId(new Uint8Array(31))).toBe(false)
	})

	it('txIdFromHex -> txIdToHex round-trip', () => {
		const id = txIdFromHex(hex)
		expect(txIdToHex(id)).toBe(hex)
	})

	it('txIdFromBytes clones (defensive copy)', () => {
		const src = new Uint8Array(32)
		src[0] = 5
		const id = txIdFromBytes(src)
		src[0] = 9
		expect(id[0]).toBe(5)
	})

	it('txIdClone returns a new array', () => {
		const id = txIdFromHex(hex)
		const c = txIdClone(id)
		expect(c).not.toBe(id)
		expect(txIdToHex(c)).toBe(hex)
	})
})
