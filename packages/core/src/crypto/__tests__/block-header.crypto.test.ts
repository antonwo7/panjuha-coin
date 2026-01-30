import { describe, it, expect } from 'vitest'
import { getBlockHeaderHash } from '../block-header.crypto'
import { BlockHeader } from '../../primitives/classes/block-header'
import { encodeBlockHeader } from '../../codec/block-header.codec'
import { hash256 } from '../hash256.crypto'
import { hash256FromBytes } from '../../primitives/256.hash'

function fill32(byte: number): Uint8Array {
	return new Uint8Array(32).fill(byte)
}

describe('block-header.crypto', () => {
	it('hashes encoded header (integration)', () => {
		const header = new BlockHeader(
			1,
			hash256FromBytes(fill32(1)),
			hash256FromBytes(fill32(2)),
			123,
			0x1d00ffff,
			42
		)

		const expected = hash256(encodeBlockHeader(header))
		const got = getBlockHeaderHash(header)

		expect(got).toBeInstanceOf(Uint8Array)
		expect(got.length).toBe(32)
		expect(got).toEqual(expected)
	})

	it('changes when header changes', () => {
		const mk = (nonce: number) =>
			new BlockHeader(
				1,
				hash256FromBytes(fill32(1)),
				hash256FromBytes(fill32(2)),
				123,
				0x1d00ffff,
				nonce
			)

		const a = getBlockHeaderHash(mk(1))
		const b = getBlockHeaderHash(mk(2))

		expect(a).not.toEqual(b)
	})

	it('is deterministic for the same header instance', () => {
		const header = new BlockHeader(
			2,
			hash256FromBytes(fill32(9)),
			hash256FromBytes(fill32(8)),
			999,
			0,
			0
		)

		const a = getBlockHeaderHash(header)
		const b = getBlockHeaderHash(header)
		expect(a).toEqual(b)
	})
})
