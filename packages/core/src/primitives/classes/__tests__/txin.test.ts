import { describe, it, expect } from 'vitest'
import { TxIn } from '../txin'

function h32(fill: number): Uint8Array {
	return new Uint8Array(32).fill(fill)
}

describe('txin', () => {
	it('constructs and defensively copies prevTxId and scriptSig', () => {
		const prev = new Uint8Array(32).fill(7)
		const script = new Uint8Array([1, 2, 3])

		const txin = new TxIn(prev, 0, script, 0xffffffff)

		prev[0] = 9
		script[0] = 9

		expect(txin.prevTxId[0]).toBe(9)
		expect(txin.scriptSig[0]).toBe(1)
	})

	it('validates numeric fields (table)', () => {
		const prev = h32(1) as any
		const script = new Uint8Array([0])

		const cases: Array<{ name: string; prevIndex: number; sequence: number }> = [
			{ name: 'prevIndex negative', prevIndex: -1, sequence: 0 },
			{ name: 'sequence negative', prevIndex: 0, sequence: -1 },
			{ name: 'prevIndex > u32', prevIndex: 2 ** 32, sequence: 0 },
			{ name: 'sequence > u32', prevIndex: 0, sequence: 2 ** 32 }
		]

		for (const c of cases) {
			expect(() => new TxIn(prev, c.prevIndex, script, c.sequence)).toThrow()
		}
	})
})
