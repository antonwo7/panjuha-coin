import { describe, it, expect } from 'vitest'
import { createGenesisBlock } from '../genesis'
import { REGTEST_PARAMS } from '../params/v0_1'
import { encodeTransaction } from '../../codec/transaction.codec'
import { hash256 } from '../../crypto/hash256.crypto'
import { computeMerkleRoot } from '../../crypto'
import { zeroHash256 } from '../../primitives'

describe('consensus/genesis', () => {
	it('creates a deterministic genesis block for given params', () => {
		const b1 = createGenesisBlock(REGTEST_PARAMS)
		const b2 = createGenesisBlock(REGTEST_PARAMS)

		expect(b1).toEqual(b2)
	})

	it('sets header fields from params and zero prev hash', () => {
		const b = createGenesisBlock(REGTEST_PARAMS)

		expect(b.header.version).toBe(1)
		expect(b.header.prevBlockHash).toEqual(zeroHash256())
		expect(b.header.time).toBe(REGTEST_PARAMS.genesisTimestamp)
		expect(b.header.bits).toBe(REGTEST_PARAMS.genesisBits)
		expect(b.header.nonce).toBe(REGTEST_PARAMS.genesisNonce)
	})

	it('header merkle root matches txid(s) of its transactions', () => {
		const b = createGenesisBlock(REGTEST_PARAMS)

		expect(b.transactions.length).toBe(1)

		const tx0 = b.transactions[0]
		const txId0 = hash256(encodeTransaction(tx0))
		const recomputedRoot = computeMerkleRoot([txId0])

		expect(b.header.merkleRoot).toEqual(recomputedRoot)
	})
})
