import { describe, it, expect } from 'vitest'
import { bitsToTarget, isHashBelowTarget } from '../pow'
import { U32 } from '../../primitives/u32.number'

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  if (clean.length % 2 !== 0) throw new Error('hex must have even length')
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  return out
}

describe('consensus/pow', () => {
  describe('bitsToTarget', () => {
    it('converts Bitcoin-style bits into a BigInt target (table)', () => {
      // Reference formula: target = M * 256^(E-3), where bits = [E][M(3 bytes)] (big-endian layout)
      // Example: 0x1d00ffff is Bitcoin mainnet genesis bits.
      const cases = [
        { bits: 0x1d00ffff, expected: BigInt(0x00ffff) * (BigInt(256) ** BigInt(0x1d - 3)) },
        { bits: 0x1f111111, expected: BigInt(0x111111) * (BigInt(256) ** BigInt(0x1f - 3)) },
        { bits: 0x0300abcd, expected: BigInt(0x00abcd) * (BigInt(256) ** BigInt(0x03 - 3)) },
      ] as const

      for (const tc of cases) {
        expect(bitsToTarget(U32(tc.bits))).toBe(tc.expected)
      }
    })

    it('works for small exponent where (E - 3) is 0', () => {
      // E=3 => 256^(0) = 1
      expect(bitsToTarget(U32(0x03000001))).toBe(BigInt(1))
      expect(bitsToTarget(U32(0x03ffffff))).toBe(BigInt(0xffffff))
    })
  })

  describe('isHashBelowTarget', () => {
    it('returns true when hash value is <= target (table)', () => {
      const target = BigInt(1000)

      const cases = [
        { hash: BigInt(0), ok: true },
        { hash: BigInt(999), ok: true },
        { hash: BigInt(1000), ok: true },
        { hash: BigInt(1001), ok: false },
      ] as const

      for (const tc of cases) {
        // Provide 32-byte "hash" as big-endian in our helper below.
        const hashHex = tc.hash.toString(16).padStart(64, '0')
        const hashBytes = hexToBytes(hashHex)
        expect(isHashBelowTarget(hashBytes, target)).toBe(tc.ok)
      }
    })

    it('treats 32-byte hash as big-endian integer', () => {
      // 0x01 followed by zeros (big-endian) is huge.
      const huge = new Uint8Array(32)
      huge[0] = 1
      expect(isHashBelowTarget(huge, BigInt(10))).toBe(false)

      // 0x...01 (last byte) is 1.
      const one = new Uint8Array(32)
      one[31] = 1
      expect(isHashBelowTarget(one, BigInt(10))).toBe(true)
    })
  })
})
