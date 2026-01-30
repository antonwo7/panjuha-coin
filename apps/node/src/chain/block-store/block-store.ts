import * as fs from 'fs'
import * as path from 'path'
import { CHECKSUM_LENGTH, DAT_DIR, DAT_FILENAME, INDEX_FILENAME, INDEX_SIZE, MAGIC } from '../../config'

import { BlockStoreIndex, BlockStoreIndexMap, BlockStoreRecord } from './block-store.types'

import { bytesEqual, bytesToHex, doubleSha256, Hash256, isHash256 } from '@panjuha-coin/core'
import { ByteWriter } from '@panjuha-coin/core/utils/bytes/writer'
import { ByteReader } from '@panjuha-coin/core/utils/bytes/reader'
import { U64 } from '@panjuha-coin/core/primitives/u64.number'
import { U32 } from '@panjuha-coin/core/primitives/u32.number'
import { Block } from '@panjuha-coin/core/primitives/classes/block'
import { encodeBlock } from '@panjuha-coin/core/codec/block.codec'
import { hash256 } from '@panjuha-coin/core/crypto/hash256.crypto'
import { encodeBlockHeader } from '@panjuha-coin/core/codec/block-header.codec'

export class BlockStore {
	dataDir: string
	blocksDatPath: string
	indexPath: string
	indexMap: BlockStoreIndexMap

	constructor() {
		this.dataDir = DAT_DIR
		this.blocksDatPath = path.join(this.dataDir, DAT_FILENAME)
		this.indexPath = path.join(this.dataDir, INDEX_FILENAME)
		this.indexMap = new Map()
	}

	// ---------------------------
	// Low-level helpers
	// ---------------------------

	private getFileSizeU64(filePath: string): U64 {
		const size = fs.statSync(filePath, { bigint: true }).size // bigint
		return U64(size)
	}

	private bytesChecksum(payload: Uint8Array): Uint8Array {
		// P2P-like: first N bytes of double-SHA256(payload)
		return doubleSha256(payload).slice(0, CHECKSUM_LENGTH)
	}

	private encodeIndexRecord(record: BlockStoreIndex): Uint8Array {
		if (!isHash256(record.hash)) {
			throw new RangeError(`BlockStore.encodeIndexRecord: 'hash' must be a valid Hash256 (32 bytes)`)
		}

		const writer = new ByteWriter()
		writer.writeBytes(record.hash) // 32
		writer.writeU64LE(record.offset) // 8
		writer.writeU32LE(record.length) // 4
		return writer.toUint8Array()
	}

	private decodeIndexRecord(bytes: Uint8Array): BlockStoreIndex {
		if (bytes.length !== INDEX_SIZE) {
			throw new RangeError(`BlockStore.decodeIndexRecord: expected ${INDEX_SIZE} bytes, got ${bytes.length}`)
		}

		const reader = new ByteReader(bytes)
		const hash = reader.readBytes(32) as Hash256
		const offset = reader.readU64LE() as U64
		const length = reader.readU32LE() as U32

		return { hash, offset, length }
	}

	private encodeBlockRecord(record: BlockStoreRecord): Uint8Array {
		const writer = new ByteWriter()
		writer.writeU32LE(MAGIC) // 4
		writer.writeU32LE(record.length) // 4 (payload length)
		writer.writeBytes(record.payload) // payload
		writer.writeBytes(this.bytesChecksum(record.payload)) // checksum bytes (CHECKSUM_LENGTH)
		return writer.toUint8Array()
	}

	/**
	 * Decode one record from a buffer at a given offset (offset is relative to this buffer).
	 * Returns:
	 *  - block: payload bytes (encoded block)
	 *  - nextOffset: position right after this record
	 */
	private decodeBlockRecordAt(bytes: Uint8Array, offset: number): { block: Uint8Array; nextOffset: number } {
		if (offset < 0 || offset > bytes.length) {
			throw new RangeError(
				`BlockStore.decodeBlockRecordAt: invalid offset=${offset}, bufferLength=${bytes.length}`
			)
		}

		const reader = new ByteReader(bytes, offset)

		// Need at least magic(4) + length(4)
		const headerNeed = 8
		const headerHave = bytes.length - reader.position
		if (headerHave < headerNeed) {
			throw new RangeError(
				`BlockStore.decodeBlockRecordAt: truncated header at offset=${offset} (need ${headerNeed}, have ${headerHave})`
			)
		}

		const magic = reader.readU32LE()
		if (magic !== MAGIC) {
			throw new RangeError(
				`BlockStore.decodeBlockRecordAt: magic mismatch at offset=${offset} (got ${magic}, expected ${MAGIC})`
			)
		}

		const length = reader.readU32LE()
		const remaining = bytes.length - reader.position
		const need = length + CHECKSUM_LENGTH
		if (remaining < need) {
			throw new RangeError(
				`BlockStore.decodeBlockRecordAt: truncated body at offset=${offset} (payloadLen=${length}, checksumLen=${CHECKSUM_LENGTH}, need=${need}, have=${remaining})`
			)
		}

		const payload = reader.readBytes(length)
		const checksum = reader.readBytes(CHECKSUM_LENGTH)

		const expected = this.bytesChecksum(payload)
		if (!bytesEqual(checksum, expected)) {
			throw new RangeError(
				`BlockStore.decodeBlockRecordAt: checksum mismatch at offset=${offset} (payloadLen=${length})`
			)
		}

		return { block: payload, nextOffset: reader.position }
	}

	private appendIndexRecord(record: BlockStoreIndex) {
		fs.appendFileSync(this.indexPath, this.encodeIndexRecord(record))
	}

	private appendBlockRecord(encodedBlockPayload: Uint8Array) {
		const recordBytes = this.encodeBlockRecord({
			length: U32(encodedBlockPayload.length),
			payload: encodedBlockPayload
		})
		fs.appendFileSync(this.blocksDatPath, recordBytes)
	}

	// ---------------------------
	// Startup / recovery
	// ---------------------------

	/**
	 * Scan blocks.dat sequentially and truncate a broken tail (if any).
	 * This avoids reading the whole file into memory (important if blocks.dat is large).
	 */
	private checkAndTruncateBlocksDat(): void {
		const fd = fs.openSync(this.blocksDatPath, 'r+')
		try {
			const fileSize = fs.fstatSync(fd, { bigint: true }).size // bigint
			let pos: bigint = 0n
			let lastGoodPos: bigint = 0n

			// Small fixed header buffer: magic(4) + len(4)
			const headerBuf = Buffer.alloc(8)

			while (pos < fileSize) {
				// Read header (8 bytes)
				const readHeader = fs.readSync(fd, headerBuf, 0, 8, pos)
				if (readHeader !== 8) {
					// truncated header at end -> truncate
					break
				}

				// Parse header (LE)
				const magic = headerBuf.readUInt32LE(0)
				const payloadLen = headerBuf.readUInt32LE(4) // u32 -> number

				if (magic !== MAGIC) {
					// Corruption / wrong boundary -> stop and truncate tail
					break
				}

				const recordSize = 8n + BigInt(payloadLen) + BigInt(CHECKSUM_LENGTH)
				if (pos + recordSize > fileSize) {
					// record claims more bytes than available -> truncated tail
					break
				}

				// Read payload + checksum
				const bodyLen = payloadLen + CHECKSUM_LENGTH
				const bodyBuf = Buffer.alloc(bodyLen)
				const readBody = fs.readSync(fd, bodyBuf, 0, bodyLen, pos + 8n)
				if (readBody !== bodyLen) {
					break
				}

				const payload = bodyBuf.subarray(0, payloadLen)
				const checksum = bodyBuf.subarray(payloadLen, payloadLen + CHECKSUM_LENGTH)

				const expected = this.bytesChecksum(payload)
				if (!bytesEqual(checksum, expected)) {
					// bad checksum -> stop and truncate tail
					break
				}

				// Record is good, advance
				lastGoodPos = pos + recordSize
				pos = lastGoodPos
			}

			// Truncate if tail is bad (pos stopped before end)
			if (lastGoodPos < fileSize) {
				// NOTE: Node's ftruncateSync historically takes number; in modern Node versions bigint is often supported for positions in read/write,
				// but truncate support can vary. Here we cast via Number for practicality.
				// In practice you won't hit > Number.MAX_SAFE_INTEGER in this project step anyway.
				fs.ftruncateSync(fd, Number(lastGoodPos))
			}
		} finally {
			fs.closeSync(fd)
		}
	}

	/**
	 * Loads index into memory.
	 * Also trims a broken tail of blocks.index if it ends in a partial record.
	 */
	private loadIndexFromFile(): void {
		this.indexMap = new Map()
		if (!fs.existsSync(this.indexPath)) return

		const fd = fs.openSync(this.indexPath, 'r+')
		try {
			const size = fs.fstatSync(fd, { bigint: true }).size // bigint
			const fullBytes = Number(size)

			// If file ends with partial record -> drop tail
			const validBytes = Math.floor(fullBytes / INDEX_SIZE) * INDEX_SIZE
			if (validBytes !== fullBytes) {
				fs.ftruncateSync(fd, validBytes)
			}

			// Stream-read records
			const bufRecords = 1024
			const buf = Buffer.alloc(INDEX_SIZE * bufRecords)

			let pos = 0
			while (pos < validBytes) {
				const toRead = Math.min(buf.length, validBytes - pos)
				const n = fs.readSync(fd, buf, 0, toRead, pos)
				if (n <= 0) break

				let off = 0
				while (off + INDEX_SIZE <= n) {
					const recBytes = buf.subarray(off, off + INDEX_SIZE)
					const rec = this.decodeIndexRecord(recBytes as unknown as Uint8Array)
					const { hash, ...payload } = rec
					this.indexMap.set(bytesToHex(hash), payload)
					off += INDEX_SIZE
				}

				pos += n
			}
		} finally {
			fs.closeSync(fd)
		}
	}

	open() {
		if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true })
		if (!fs.existsSync(this.blocksDatPath)) fs.writeFileSync(this.blocksDatPath, '')
		if (!fs.existsSync(this.indexPath)) fs.writeFileSync(this.indexPath, '')

		this.checkAndTruncateBlocksDat()
		this.loadIndexFromFile()
	}

	// ---------------------------
	// Public API
	// ---------------------------

	put(hash: Hash256, block: Block): void {
		if (!isHash256(hash)) {
			throw new RangeError(`BlockStore.put: invalid 'hash' (must be Hash256)`)
		}

		const expectedHash = hash256(encodeBlockHeader(block.header))
		if (!bytesEqual(expectedHash, hash)) {
			throw new RangeError(`BlockStore.put: hash mismatch (hash must equal hash256(blockHeader))`)
		}

		const hexHash = bytesToHex(hash)
		if (this.indexMap.has(hexHash)) return // idempotent

		const encodedBlock = encodeBlock(block)
		const encodedBlockLength = U32(encodedBlock.length)

		// offset = file size BEFORE append
		const datFileSize = this.getFileSizeU64(this.blocksDatPath)

		this.appendBlockRecord(encodedBlock)

		this.appendIndexRecord({
			hash,
			offset: datFileSize,
			length: encodedBlockLength
		})

		this.indexMap.set(hexHash, {
			offset: datFileSize,
			length: encodedBlockLength
		})
	}
}
