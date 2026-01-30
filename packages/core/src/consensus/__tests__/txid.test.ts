import { describe, it, expect } from 'vitest'
import { txIdFromBytes } from '../txid'

describe('consensus/txid', () => {
  it('derives TxId deterministically from bytes', () => {
    const a = new Uint8Array([1,2,3])
    const b = new Uint8Array([1,2,3])
    const id1 = txIdFromBytes(a)
    const id2 = txIdFromBytes(b)
    expect(id1).toEqual(id2)
    expect(id1).toHaveLength(32)
  })

  it('does not return the same reference as input', () => {
    const input = new Uint8Array([9, 9, 9])
    const id = txIdFromBytes(input)
    // It's a Uint8Array (or subtype); must not alias input.
    expect(id).not.toBe(input as any)
  })
})
