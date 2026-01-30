import { describe, it, expect } from 'vitest'
import { Block } from '../block'
import { BlockHeader } from '../block-header'
import { Transaction } from '../transaction'
import { TxIn } from '../txin'
import { TxOut } from '../txout'

function h32(fill: number): Uint8Array {
	return new Uint8Array(32).fill(fill)
}

describe('block', () => {
	it('stores header reference and copies transactions array', () => {
		const header = new BlockHeader(1, h32(1) as any, h32(2) as any, 0, 0, 0)

		const tx = new Transaction(
			1,
			[new TxIn(h32(9) as any, 0, new Uint8Array([]), 0)],
			[new TxOut(1n, new Uint8Array([0x51]))],
			0
		)

		const txs = [tx]
		const b = new Block(header, txs)

		// header is kept as reference (no clone)
		expect(b.header).toBe(header)

		// transactions array copied
		expect(b.transactions).not.toBe(txs)
		expect(b.transactions).toEqual(txs)
		expect(b.transactions[0]).toBe(tx)

		// mutating original array does not affect stored txs
		txs.push(tx)
		expect(b.transactions.length).toBe(1)
	})
})
