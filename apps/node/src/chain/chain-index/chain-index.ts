import {
	base64ToKey,
	bytesEqual,
	bytesToBase64,
	Hash256,
	hash256Clone,
	zeroHash256
} from '@panjuha-coin/core'
import { U32 } from '@panjuha-coin/core/primitives/u32.number'

enum StatusFlags {
	VALID_BASIC,
	VALID_CHAIN,
	NONE
}

export type ChainIndexEntry = {
	hash: Hash256
	prevHash: Hash256
	key: string
	prevKey: string
	height: number
	time: U32
	bits: U32
	hasBlockData: boolean
	statusFlags: StatusFlags
}

export class ChainIndex {
	private tipHash: Hash256
	private tipKey: string
	private tipHeight: number
	private genesisHash: Hash256
	private map = new Map<string, ChainIndexEntry>()

	constructor() {
		const zeroHash = zeroHash256()
		this.tipHeight = -1
		this.tipHash = zeroHash
		this.tipKey = this.hashToKey(zeroHash)
		this.genesisHash = zeroHash
	}

	private hashToKey(hash: Hash256): string {
		return bytesToBase64(hash)
	}

	private keyToHash(key: string): Hash256 {
		return base64ToKey(key) as Hash256
	}

	private has(hash: Hash256): boolean {
		return this.map.has(this.hashToKey(hash))
	}

	private hasByKey(key: string): boolean {
		return this.map.has(key)
	}

	private get(hash: Hash256): ChainIndexEntry | undefined {
		return this.map.get(this.hashToKey(hash))
	}

	private set(entry: ChainIndexEntry): void {
		if (this.hasByKey(entry.key)) throw new Error('')
		this.map.set(entry.key, entry)
	}

	private getTip(): { key: string; hash: Hash256; height: number } {
		return { key: this.getTipKey(), hash: this.getTipHash(), height: this.getTipHeight() }
	}

	private setTipHash(hash: Hash256): void {
		this.tipHash = hash256Clone(hash)
	}

	private getTipHash(): Hash256 {
		return hash256Clone(this.tipHash)
	}

	private setTipKey(key: string): void {
		this.tipKey = key
	}

	private getTipKey(): string {
		return this.tipKey
	}

	private getTipHeight(): number {
		return this.tipHeight
	}

	private setTipHeight(value: number): void {
		if (this.getTipHeight() >= value) throw new Error('')
		this.tipHeight = value
	}

	setGenesis(genesisHash: Hash256): void {
		if (this.getTipHeight() > -1) throw new Error('')

		const clonedHash = hash256Clone(genesisHash)

		const key = this.hashToKey(genesisHash)
		const prevHash = zeroHash256()
		const prevKey = this.hashToKey(prevHash)

		const genesisChainIndex: ChainIndexEntry = {
			key,
			hash: clonedHash,
			prevKey,
			prevHash: prevHash,
			height: 0,
			time: U32(Date.now()),
			bits: U32(0),
			hasBlockData: true,
			statusFlags: StatusFlags.NONE
		}

		this.map.set(this.hashToKey(clonedHash), genesisChainIndex)

		this.setTipHash(genesisHash)
		this.setTipKey(key)
		this.setTipHeight(0)
		this.genesisHash = clonedHash
	}

	private canAttachToTip(prevHash: Hash256): boolean {
		return bytesEqual(prevHash, this.getTipHash())
	}

	appendBlock(hash: Hash256, prevHash: Hash256): void {
		if (this.has(hash)) throw new Error('')
		if (!this.has(prevHash)) throw new Error('')
		if (!bytesEqual(prevHash, this.getTipHash())) throw new Error('')

		const clonedHash = hash256Clone(hash)
		const key = this.hashToKey(hash)
		const prevKey = this.getTipKey()

		this.setTipHeight(this.getTipHeight() + 1)

		const chainIndex: ChainIndexEntry = {
			key,
			hash: clonedHash,
			prevKey,
			prevHash,
			height: this.getTipHeight(),
			time: U32(Date.now()),
			bits: U32(0),
			hasBlockData: true,
			statusFlags: StatusFlags.NONE
		}

		this.set(chainIndex)

		this.setTipHash(hash)
		this.setTipKey(key)
	}

	private size(): number {
		return this.map.size
	}

	private getHeight(hash: Hash256): number | undefined {
		return this.get(hash)?.height ?? undefined
	}

	private getPrevHash(hash: Hash256): Hash256 | undefined {
		return this.get(hash)?.prevHash || undefined
	}

	private isEmpty(): boolean {
		return this.map.size === 0
	}

	private getAllEntries(): ReturnType<typeof this.map.entries> {
		return this.map.entries()
	}
}
