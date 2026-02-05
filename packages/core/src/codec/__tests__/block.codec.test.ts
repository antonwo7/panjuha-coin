import { describe, it, expect } from 'vitest'
import { Block } from '../../primitives/classes/block'
import { BlockHeader } from '../../primitives/classes/block-header'
import { Transaction } from '../../primitives/classes/transaction'
import { TxIn } from '../../primitives/classes/txin'
import { TxOut } from '../../primitives/classes/txout'
import { Hash256, HASH256_SIZE } from '../../primitives'
import { MAX_TXS_PER_BLOCK } from '../../spec/limits'
import { decodeBlock, encodeBlock } from '../block.codec'
import { encodeBlockHeader } from '../block-header.codec'
import { bytesFilled, concatBytes } from './helpers'
import { encodeVarInt } from '../varint'

describe('block.codec', () => {
	function mkHeader(seed: number): BlockHeader {
		return new BlockHeader(
			1,
			bytesFilled(HASH256_SIZE, seed) as Hash256,
			bytesFilled(HASH256_SIZE, seed + 1) as Hash256,
			seed,
			seed + 2,
			seed + 3
		)
	}

	function mkTx(seed: number): Transaction {
		const input = new TxIn(bytesFilled(HASH256_SIZE, seed), seed, bytesFilled(seed % 4, seed + 10), 0)
		const output = new TxOut(BigInt(seed), bytesFilled(seed % 5, seed + 20))
		return new Transaction(1, [input], [output], seed)
	}

	it('roundtrip encodeBlock -> decodeBlock (table)', () => {
		const cases = [new Block(mkHeader(1), [mkTx(1)]), new Block(mkHeader(2), [mkTx(1), mkTx(2)])]

		for (const b of cases) {
			const enc = encodeBlock(b)
			const dec = decodeBlock(enc, 0)

			expect(dec.offset).toBe(enc.length)
			expect(dec.block.header.version).toBe(b.header.version)
			expect(dec.block.header.prevBlockHash).toEqual(b.header.prevBlockHash)
			expect(dec.block.header.merkleRoot).toEqual(b.header.merkleRoot)

			expect(dec.block.transactions.length).toBe(b.transactions.length)
			for (let i = 0; i < b.transactions.length; i++) {
				expect(dec.block.transactions[i].version).toBe(b.transactions[i].version)
				expect(dec.block.transactions[i].lockTime).toBe(b.transactions[i].lockTime)
			}
		}
	})

	it('decodeBlock rejects txs length > MAX_SAFE_INTEGER', () => {
		const header = mkHeader(1)
		const headerBytes = encodeBlockHeader(header)

		const txsLen = encodeVarInt(BigInt(Number.MAX_SAFE_INTEGER) + 1n)
		const bytes = concatBytes(headerBytes, txsLen)

		expect(() => decodeBlock(bytes, 0)).toThrowError(
			new RangeError('decodeBlock: transactions length exceeds MAX_SAFE_INTEGER')
		)
	})

	it('decodeBlock rejects txs length > MAX_TXS_PER_BLOCK', () => {
		const header = mkHeader(1)
		const headerBytes = encodeBlockHeader(header)

		const txsLen = encodeVarInt(BigInt(MAX_TXS_PER_BLOCK) + 1n)
		const bytes = concatBytes(headerBytes, txsLen)

		expect(() => decodeBlock(bytes, 0)).toThrowError(
			new RangeError('decodeBlock: transactions length exceeds MAX_TXS_PER_BLOCK')
		)
	})
})
