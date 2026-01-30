import { describe, it, expect } from 'vitest'
import { validateTxBasic } from '../tx-basic.validation'
import { MAX_SCRIPT_BYTES, MAX_SCRIPT_PUBKEY_BYTES, MAX_TX_INPUTS, MAX_TX_OUTPUTS } from '../../spec/limits'
import { COIN } from '../../primitives/amount.number'

function mkTx(overrides: Partial<any> = {}) {
  return {
    version: 1,
    lockTime: 0,
    inputs: [{
      prevTxId: new Uint8Array(32),
      prevIndex: 0,
      scriptSig: new Uint8Array([1,2,3]),
      sequence: 0,
    }],
    outputs: [{
      value: BigInt(1) * BigInt(COIN),
      scriptPubKey: new Uint8Array([0x51]), // OP_TRUE-ish placeholder
    }],
    ...overrides,
  }
}

describe('consensus/tx-basic.validation', () => {
  it('accepts a minimal sane tx', () => {
    const res = validateTxBasic(mkTx() as any)
    expect(res.ok).toBe(true)
    expect(res.errors).toEqual([])
  })

  it('rejects invalid numeric fields (table)', () => {
    const cases = [
      { name: 'version <= 0', tx: mkTx({ version: 0 }), err: 'tx.version must be > 0' },
      { name: 'lockTime negative', tx: mkTx({ lockTime: -1 }), err: 'tx.lockTime must be >= 0' },
    ] as const

    for (const tc of cases) {
      const res = validateTxBasic(tc.tx as any)
      expect(res.ok, tc.name).toBe(false)
      expect(res.errors).toContain(tc.err)
    }
  })

  it('rejects invalid input/output counts (table)', () => {
    const tooManyInputs = Array.from({ length: MAX_TX_INPUTS + 1 }, () => mkTx().inputs[0])
    const tooManyOutputs = Array.from({ length: MAX_TX_OUTPUTS + 1 }, () => mkTx().outputs[0])

    const cases = [
      { name: 'no inputs', tx: mkTx({ inputs: [] }), err: 'tx.inputs must have at least 1 input' },
      { name: 'too many inputs', tx: mkTx({ inputs: tooManyInputs }), err: `tx.inputs must have <= ${MAX_TX_INPUTS} inputs` },
      { name: 'no outputs', tx: mkTx({ outputs: [] }), err: 'tx.outputs must have at least 1 output' },
      { name: 'too many outputs', tx: mkTx({ outputs: tooManyOutputs }), err: `tx.outputs must have <= ${MAX_TX_OUTPUTS} outputs` },
    ] as const

    for (const tc of cases) {
      const res = validateTxBasic(tc.tx as any)
      expect(res.ok, tc.name).toBe(false)
      expect(res.errors).toContain(tc.err)
    }
  })

  it('rejects scripts exceeding limits (table)', () => {
    const bigSig = new Uint8Array(MAX_SCRIPT_BYTES + 1)
    const bigPub = new Uint8Array(MAX_SCRIPT_PUBKEY_BYTES + 1)

    const cases = [
      { name: 'scriptSig too big', tx: mkTx({ inputs: [{ ...mkTx().inputs[0], scriptSig: bigSig }] }), err: `tx.inputs[0].scriptSig too large (max ${MAX_SCRIPT_BYTES})` },
      { name: 'scriptPubKey too big', tx: mkTx({ outputs: [{ ...mkTx().outputs[0], scriptPubKey: bigPub }] }), err: `tx.outputs[0].scriptPubKey too large (max ${MAX_SCRIPT_PUBKEY_BYTES})` },
    ] as const

    for (const tc of cases) {
      const res = validateTxBasic(tc.tx as any)
      expect(res.ok, tc.name).toBe(false)
      expect(res.errors).toContain(tc.err)
    }
  })
})
