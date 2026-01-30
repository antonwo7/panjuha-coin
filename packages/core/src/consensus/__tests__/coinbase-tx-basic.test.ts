import { describe, it, expect } from 'vitest'
import { validateCoinbaseTxBasic } from '../validation/coinbase-tx-basic'
import { COIN } from '../../primitives/amount.number'

function mkCoinbase(overrides: Partial<any> = {}) {
	return {
		version: 1,
		lockTime: 0,
		inputs: [
			{
				prevTxId: new Uint8Array(32), // all zeros for coinbase
				prevIndex: 0xffffffff, // coinbase index
				scriptSig: new Uint8Array([1, 2, 3]),
				sequence: 0
			}
		],
		outputs: [
			{
				value: BigInt(50) * BigInt(COIN),
				scriptPubKey: new Uint8Array([0x51])
			}
		],
		...overrides
	}
}

describe('consensus/coinbase-tx-basic', () => {
	it('accepts a minimal coinbase tx', () => {
		const res = validateCoinbaseTxBasic(mkCoinbase() as any)
		expect(res.ok).toBe(true)
		expect(res.errors).toEqual([])
	})

	it('rejects non-coinbase shapes (table)', () => {
		const cases = [
			{
				name: 'not exactly 1 input',
				tx: mkCoinbase({ inputs: [mkCoinbase().inputs[0], mkCoinbase().inputs[0]] }),
				err: 'coinbase must have exactly 1 input'
			},
			{
				name: 'prevTxId not all zeros',
				tx: mkCoinbase({ inputs: [{ ...mkCoinbase().inputs[0], prevTxId: new Uint8Array(32).fill(1) }] }),
				err: 'coinbase input prevTxId must be all zeros'
			},
			{
				name: 'prevIndex not 0xffffffff',
				tx: mkCoinbase({ inputs: [{ ...mkCoinbase().inputs[0], prevIndex: 1 }] }),
				err: 'coinbase input prevIndex must be 0xffffffff'
			}
		] as const

		for (const tc of cases) {
			const res = validateCoinbaseTxBasic(tc.tx as any)
			expect(res.ok, tc.name).toBe(false)
			expect(res.errors).toContain(tc.err)
		}
	})
})
