import { describe, it, expect } from 'vitest'
import { TxOut } from '../txout'

describe('txout', () => {
	it('constructs and defensively copies scriptPubKey', () => {
		const script = new Uint8Array([0xaa, 0xbb, 0xcc])
		const txout = new TxOut(123n, script)

		expect(txout.value).toBe(123n)
		expect(txout.scriptPubKey).toEqual(script)
		expect(txout.scriptPubKey).not.toBe(script)

		script[0] = 0x00
		expect(txout.scriptPubKey[0]).toBe(0xaa)
	})

	it('validates value (table)', () => {
		const script = new Uint8Array([])
		const cases: Array<{ name: string; value: bigint }> = [
			{ name: 'negative', value: -1n },
			// if Amount enforces u64 range, this should fail too:
			{ name: 'too large for u64', value: 2n ** 64n },
		]
		for (const c of cases) {
			expect(() => new TxOut(c.value, script)).toThrow()
		}
	})
})
