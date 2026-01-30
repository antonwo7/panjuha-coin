import { Hash256 } from '@panjuha-coin/core'
import { DAT_DIR, INDEX_FILENAME } from '../../config'
import * as fs from 'fs'
import * as path from 'path'

export function init(): void {
	if (fs.existsSync(DAT_DIR)) throw new Error('Dat file not exists')
}

export function loadIndexFromDisk() {
	const indexMap = new Map<Hash256, { offset: number; length: number }>()

	const indexData = fs.readFileSync(path.join(DAT_DIR, INDEX_FILENAME))
}

export function rebuildIndexFromBlocksDat() {}
