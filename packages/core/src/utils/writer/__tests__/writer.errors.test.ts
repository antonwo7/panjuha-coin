import { describe, it, expect } from 'vitest'
import { ByteWriter } from '../writer'

function snapshot(w: ByteWriter): string {
	return Array.from(w.toUint8Array())
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
}

describe('bytewriter - errors', () => {
	it('ensureCapacity validates needBytes', () => {
		const w = new ByteWriter()
		const before = snapshot(w)

		const cases: Array<{ needBytes: number; msg: string }> = [
			{
				needBytes: -1,
				msg: 'ByteWriter: ensureCapacity needBytes must be a non-negative integer (needBytes=-1)'
			},
			{
				needBytes: 0.5,
				msg: 'ByteWriter: ensureCapacity needBytes must be a non-negative integer (needBytes=0.5)'
			},
			{
				needBytes: Number.NaN,
				msg: 'ByteWriter: ensureCapacity needBytes must be a non-negative integer (needBytes=NaN)'
			}
		]

		for (const tc of cases) {
			expect(() => w.ensureCapacity(tc.needBytes)).toThrowError(
				new RangeError(tc.msg)
			)
			expect(snapshot(w)).toBe(before)
		}
	})

	it('writeU8 validates finite integer and range', () => {
		const w = new ByteWriter()
		w.writeU8(1) // make sure buffer not empty, to detect accidental mutation
		const before = snapshot(w)

		const cases: Array<{ value: any; err: Error }> = [
			{
				value: 1.5,
				err: new RangeError(
					'ByteWriter: writeU8 value must be a finite integer (value=1.5)'
				)
			},
			{
				value: Number.NaN,
				err: new RangeError(
					'ByteWriter: writeU8 value must be a finite integer (value=NaN)'
				)
			},
			{
				value: Number.POSITIVE_INFINITY,
				err: new RangeError(
					'ByteWriter: writeU8 value must be a finite integer (value=Infinity)'
				)
			},
			{
				value: -1,
				err: new RangeError(
					'ByteWriter: writeU8 value out of range [0, 255] (value=-1)'
				)
			},
			{
				value: 256,
				err: new RangeError(
					'ByteWriter: writeU8 value out of range [0, 255] (value=256)'
				)
			}
		]

		for (const tc of cases) {
			expect(() => w.writeU8(tc.value)).toThrowError(tc.err)
			expect(snapshot(w)).toBe(before)
		}
	})

	it('writeBytes requires Uint8Array', () => {
		const w = new ByteWriter()
		const before = snapshot(w)

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const badValues: any[] = [null, undefined, [1, 2, 3], { length: 3 }, 'abc', 123]

		for (const v of badValues) {
			expect(() => w.writeBytes(v)).toThrowError(
				new TypeError('ByteWriter: writeBytes expects a Uint8Array')
			)
			expect(snapshot(w)).toBe(before)
		}
	})

	it('writeU16LE validates finite integer and range', () => {
		const w = new ByteWriter()
		const before = snapshot(w)

		const cases: Array<{ value: any; msg: string }> = [
			{
				value: 1.1,
				msg: 'ByteWriter: writeU16LE value must be a finite integer (value=1.1)'
			},
			{
				value: Number.NaN,
				msg: 'ByteWriter: writeU16LE value must be a finite integer (value=NaN)'
			},
			{
				value: -1,
				msg: 'ByteWriter: writeU16LE value out of range [0, 65535] (value=-1)'
			},
			{
				value: 65536,
				msg: 'ByteWriter: writeU16LE value out of range [0, 65535] (value=65536)'
			}
		]

		for (const tc of cases) {
			expect(() => w.writeU16LE(tc.value)).toThrowError(new RangeError(tc.msg))
			expect(snapshot(w)).toBe(before)
		}
	})

	it('writeU32LE validates finite integer and range', () => {
		const w = new ByteWriter()
		const before = snapshot(w)

		const cases: Array<{ value: any; msg: string }> = [
			{
				value: 1.1,
				msg: 'ByteWriter: writeU32LE value must be a finite integer (value=1.1)'
			},
			{
				value: Number.NaN,
				msg: 'ByteWriter: writeU32LE value must be a finite integer (value=NaN)'
			},
			{
				value: -1,
				msg: 'ByteWriter: writeU32LE value out of range [0, 2^32 - 1] (value=-1)'
			},
			{
				value: 2 ** 32,
				msg: `ByteWriter: writeU32LE value out of range [0, 2^32 - 1] (value=${2 ** 32})`
			}
		]

		for (const tc of cases) {
			expect(() => w.writeU32LE(tc.value)).toThrowError(new RangeError(tc.msg))
			expect(snapshot(w)).toBe(before)
		}
	})

	it('writeU64LE validates bigint and range', () => {
		const w = new ByteWriter()
		const before = snapshot(w)

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typeErrors: any[] = [1, 1.1, '1', null, undefined]
		for (const v of typeErrors) {
			expect(() => w.writeU64LE(v)).toThrowError(
				new TypeError('ByteWriter: writeU64LE expects a bigint')
			)
			expect(snapshot(w)).toBe(before)
		}

		const rangeCases: Array<{ value: bigint; msg: string }> = [
			{
				value: -1n,
				msg: 'ByteWriter: writeU64LE value out of range [0, 2^64 - 1] (value=-1)'
			},
			{
				value: 2n ** 64n,
				msg: `ByteWriter: writeU64LE value out of range [0, 2^64 - 1] (value=${2n ** 64n})`
			}
		]

		for (const tc of rangeCases) {
			expect(() => w.writeU64LE(tc.value)).toThrowError(new RangeError(tc.msg))
			expect(snapshot(w)).toBe(before)
		}
	})

	it('writeVarInt validates bigint and range', () => {
		const w = new ByteWriter()
		const before = snapshot(w)

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typeErrors: any[] = [1, 1.1, '1', null, undefined]
		for (const v of typeErrors) {
			expect(() => w.writeVarInt(v)).toThrowError(
				new TypeError('ByteWriter: writeVarInt expects a bigint')
			)
			expect(snapshot(w)).toBe(before)
		}

		const rangeCases: Array<{ value: bigint; msg: string }> = [
			{
				value: -1n,
				msg: 'ByteWriter: writeVarInt value out of range [0, 2^64 - 1] (value=-1)'
			},
			{
				value: 2n ** 64n,
				msg: `ByteWriter: writeVarInt value out of range [0, 2^64 - 1] (value=${2n ** 64n})`
			}
		]

		for (const tc of rangeCases) {
			expect(() => w.writeVarInt(tc.value)).toThrowError(new RangeError(tc.msg))
			expect(snapshot(w)).toBe(before)
		}
	})
})
