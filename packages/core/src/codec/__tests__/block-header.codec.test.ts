import { describe, it, expect } from 'vitest'
import { BlockHeader } from '../../primitives/classes/block-header'
import { HASH256_SIZE } from '../../primitives'
import { decodeBlockHeader, encodeBlockHeader } from '../block-header.codec'
import { bytesFilled } from './helpers'

describe('block-header.codec', () => {
	it('encodeBlockHeader throws if prevBlockHash length != HASH256_SIZE', () => {
		const header = new BlockHeader(
			1,
			new Uint8Array(HASH256_SIZE - 1),
			bytesFilled(HASH256_SIZE, 2),
			3,
			4,
			5
		)

		expect(() => encodeBlockHeader(header)).toThrowError(
			new RangeError('encodeBlockHeader: prevBlockHash length must equal HASH256_SIZE')
		)
	})

	it('encodeBlockHeader throws if merkleRoot length != HASH256_SIZE', () => {
		const header = new BlockHeader(
			1,
			bytesFilled(HASH256_SIZE, 1),
			new Uint8Array(HASH256_SIZE - 1),
			3,
			4,
			5
		)

		expect(() => encodeBlockHeader(header)).toThrowError(
			new RangeError('encodeBlockHeader: merkleRoot length must equal HASH256_SIZE')
		)
	})

	it('roundtrip encodeBlockHeader -> decodeBlockHeader (table)', () => {
		const cases = [
			new BlockHeader(
				1,
				bytesFilled(HASH256_SIZE, 1),
				bytesFilled(HASH256_SIZE, 2),
				0x11223344,
				0x55667788,
				0x99aabbcc
			),
			new BlockHeader(
				2,
				bytesFilled(HASH256_SIZE, 3),
				bytesFilled(HASH256_SIZE, 4),
				0,
				0,
				0
			)
		]

		for (const h of cases) {
			const enc = encodeBlockHeader(h)
			const dec = decodeBlockHeader(enc, 0)
			expect(dec.offset).toBe(enc.length)

			expect(dec.header.version).toBe(h.version)
			expect(dec.header.prevBlockHash).toEqual(h.prevBlockHash)
			expect(dec.header.merkleRoot).toEqual(h.merkleRoot)
			expect(dec.header.time).toBe(h.time)
			expect(dec.header.bits).toBe(h.bits)
			expect(dec.header.nonce).toBe(h.nonce)
		}
	})
})