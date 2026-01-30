import { describe, it, expect } from 'vitest'
import { ByteWriter } from '../writer'

function bytes(n: number, fill: number): Uint8Array {
	return new Uint8Array(Array.from({ length: n }, () => fill))
}

describe('bytewriter - capacity', () => {
	it('ensureCapacity does not shrink and keeps existing bytes', () => {
		const w = new ByteWriter()

		w.writeBytes(bytes(10, 0x11))
		const before = w.toUint8Array()

		w.ensureCapacity(0) // no-op
		expect(w.toUint8Array()).toEqual(before)

		w.ensureCapacity(1) // still no growth needed
		expect(w.toUint8Array()).toEqual(before)
	})

	it('grows internal buffer when needed and preserves data', () => {
		const w = new ByteWriter()

		// Fill close to initial capacity (1024) and then exceed it.
		w.writeBytes(bytes(1024, 0xaa))
		expect(w.toUint8Array().length).toBe(1024)

		// this should trigger growth
		w.writeBytes(bytes(10, 0xbb))
		const out = w.toUint8Array()

		expect(out.length).toBe(1034)
		// first part preserved
		expect(out.slice(0, 3)).toEqual(new Uint8Array([0xaa, 0xaa, 0xaa]))
		// tail is new bytes
		expect(out.slice(1024, 1034)).toEqual(bytes(10, 0xbb))
	})

	it('can grow via writeU32LE when close to boundary', () => {
		const w = new ByteWriter()
		w.writeBytes(bytes(1023, 0x00))

		// next write needs 4 bytes; must grow and succeed
		w.writeU32LE(0x01020304)

		const out = w.toUint8Array()
		expect(out.length).toBe(1027)
		// last 4 bytes are little-endian 04 03 02 01
		expect(out.slice(1023, 1027)).toEqual(new Uint8Array([0x04, 0x03, 0x02, 0x01]))
	})
})
