# Crypto panjuha-coin — Binary Codec Spec v0.1

## 1. General rules

### 1.1 Endianness

All fixed-size integers are serialized in **Little-Endian**:

- `u16` = 2 bytes LE
- `u32` = 4 bytes LE
- `u64` = 8 bytes LE

### 1.2 Bytes / Arrays

- `bytes[N]` — exactly `N` bytes.
- `bytes[var]` — a byte array prefixed with its length encoded as `VarInt`, followed by raw bytes unchanged.
- **Hash fields** (`Hash256`) are **exactly 32 bytes** and are **never byte-reversed** (no internal reverse inside the codec).

### 1.3 Determinism

- `encode(X)` must produce **the same bytes** for the same field values.
- `decode(bytes)` must be **strict**:
  - fail on EOF / out-of-bounds,
  - fail on **non-canonical VarInt**,
  - fail on exceeded limits (see section 5),
  - make no “silent assumptions” and never “fix” input data.

---

## 2. VarInt (bitcoin-like + canonical)

### 2.1 Format

VarInt encodes a non-negative integer `n`.

Encoding rules:

- if `n <= 0xFC` → 1 byte: `[n]`
- if `0xFD <= n <= 0xFFFF` → 3 bytes: `[0xFD] + u16LE(n)`
- if `0x10000 <= n <= 0xFFFFFFFF` → 5 bytes: `[0xFE] + u32LE(n)`
- if `n >= 0x100000000` → 9 bytes: `[0xFF] + u64LE(n)`

### 2.2 Canonical form (mandatory)

`decodeVarInt` must reject non-canonical encodings (the minimal possible prefix must be used):

- values `<= 0xFC` **must not** be encoded using `0xFD/0xFE/0xFF`
- values `<= 0xFFFF` **must not** be encoded using `0xFE/0xFF`
- values `<= 0xFFFFFFFF` **must not** be encoded using `0xFF`

---

## 3. Transaction (bitcoin-like container, no script logic)

### 3.1 Entities

#### Hash256

- `Hash256 = bytes[32]`

#### TxIn

Fields:

1. `prevTxId: Hash256` (32 bytes, raw)
2. `prevIndex: u32LE`
3. `scriptSig: bytes[var]` (VarInt length + bytes)
4. `sequence: u32LE`

#### TxOut

Fields:

1. `value: u64LE` (unsigned, stored as `bigint` in TS)
2. `scriptPubKey: bytes[var]` (VarInt length + bytes)

#### Transaction

Fields (in serialization order):

1. `version: u32LE`
2. `vinCount: VarInt`
3. `inputs: TxIn[vinCount]`
4. `voutCount: VarInt`
5. `outputs: TxOut[voutCount]`
6. `lockTime: u32LE`

### 3.2 Encoding layout (byte format)

```
Transaction :=
  u32LE(version)
  VarInt(vinCount)
  TxIn * vinCount
  VarInt(voutCount)
  TxOut * voutCount
  u32LE(lockTime)

TxIn :=
  bytes[32](prevTxId)
  u32LE(prevIndex)
  VarInt(scriptSigLen)
  bytes[scriptSigLen](scriptSig)
  u32LE(sequence)

TxOut :=
  u64LE(value)
  VarInt(scriptPubKeyLen)
  bytes[scriptPubKeyLen](scriptPubKey)
```

### 3.3 Decode rules (strictness)

When decoding:

- `vinCount` and `voutCount` must be checked against limits (see section 5).
- `scriptSigLen` and `scriptPubKeyLen` must be checked against limits (see section 5).
- Any attempt to read past the remaining bytes must fail with EOF/out-of-bounds.
- Any non-canonical VarInt must fail with `NonCanonicalVarInt`.

---

## 4. BlockHeader and Block

### 4.1 BlockHeader

Fields (strictly in this order):

1. `version: u32LE`
2. `prevBlockHash: Hash256` (bytes[32], no reverse)
3. `merkleRoot: Hash256` (bytes[32], no reverse)
4. `time: u32LE`
5. `bits: u32LE`
6. `nonce: u32LE`

Encoding layout:

```
BlockHeader :=
  u32LE(version)
  bytes[32](prevBlockHash)
  bytes[32](merkleRoot)
  u32LE(time)
  u32LE(bits)
  u32LE(nonce)
```

### 4.2 Block

Fields:

1. `header: BlockHeader`
2. `txCount: VarInt`
3. `txs: Transaction[txCount]`

Encoding layout:

```
Block :=
  BlockHeader
  VarInt(txCount)
  Transaction * txCount
```

### 4.3 Decode rules (strictness)

- `txCount` must be checked against limits (see section 5).
- Exactly `txCount` transactions must be decoded.
- EOF/out-of-bounds and non-canonical VarInt must fail, same as for Transaction.

---

## 5. v0.1 Limits (anti-OOM / anti-abuse)

These limits are part of the v0.1 contract and must match between TS and Rust.

Recommended v0.1 values:

- `MAX_SCRIPT_BYTES = 100_000`
- `MAX_TXINS = 10_000`
- `MAX_TXOUTS = 10_000`
- `MAX_TXS_PER_BLOCK = 100_000`

Rules:

- if `scriptSigLen > MAX_SCRIPT_BYTES` → error `LimitExceeded(scriptSigLen)`
- if `scriptPubKeyLen > MAX_SCRIPT_BYTES` → error `LimitExceeded(scriptPubKeyLen)`
- if `vinCount > MAX_TXINS` → error `LimitExceeded(vinCount)`
- if `voutCount > MAX_TXOUTS` → error `LimitExceeded(voutCount)`
- if `txCount > MAX_TXS_PER_BLOCK` → error `LimitExceeded(txCount)`

---

## 6. Errors (minimal set)

Implementations must distinguish at least these error classes:

- `EOF` / `OutOfBounds` — not enough bytes to read.
- `NonCanonicalVarInt` — VarInt is not encoded in minimal form.
- `LimitExceeded` — a limit from section 5 was exceeded.

---

## 7. Notes for TS/Rust compatibility

- `u64` is **unsigned 64-bit** (`0 .. 2^64-1`).
- Hash fields (`prevTxId`, `prevBlockHash`, `merkleRoot`) are **raw bytes[32]** with no internal byte-order conversions.
- The codec does not interpret `scriptSig` or `scriptPubKey`: they are just `Uint8Array` of the specified length.
