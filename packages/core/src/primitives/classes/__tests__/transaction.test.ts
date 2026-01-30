import { describe, it, expect } from 'vitest'
import { Transaction } from '../transaction'
import { TxIn } from '../txin'
import { TxOut } from '../txout'

function h32(fill: number): Uint8Array {
	return new Uint8Array(32).fill(fill)
}

describe('transaction', () => {
	it('constructs and copies inputs/outputs arrays (not deep copy)', () => {
		const i1 = new TxIn(h32(1) as any, 0, new Uint8Array([1]), 0)
		const i2 = new TxIn(h32(2) as any, 1, new Uint8Array([2]), 1)
		const o1 = new TxOut(10n, new Uint8Array([0x51]))
		const o2 = new TxOut(20n, new Uint8Array([0x52]))

		const inputs = [i1, i2]
		const outputs = [o1, o2]

		const tx = new Transaction(2, inputs, outputs, 0)

		expect(tx.version).toBe(2)
		expect(tx.lockTime).toBe(0)

		// arrays copied
		expect(tx.inputs).not.toBe(inputs)
		expect(tx.outputs).not.toBe(outputs)

		// elements are same references
		expect(tx.inputs[0]).toBe(i1)
		expect(tx.outputs[1]).toBe(o2)

		// mutating original arrays does not affect stored arrays
		inputs.pop()
		outputs.shift()
		expect(tx.inputs.length).toBe(2)
		expect(tx.outputs.length).toBe(2)
	})

	it('validates numeric fields (table)', () => {
		const i = new TxIn(h32(1) as any, 0, new Uint8Array([]), 0)
		const o = new TxOut(1n, new Uint8Array([]))

		const cases: Array<{ name: string; version: number; lockTime: number }> = [
			{ name: 'version negative', version: -1, lockTime: 0 },
			{ name: 'lockTime negative', version: 1, lockTime: -1 },
			{ name: 'version > u32', version: 2 ** 32, lockTime: 0 },
			{ name: 'lockTime > u32', version: 1, lockTime: 2 ** 32 },
		]

		for (const c of cases) {
			expect(() => new Transaction(c.version, [i], [o], c.lockTime)).toThrow()
		}
	})
})
