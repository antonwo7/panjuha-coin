import { isHash256 } from '@panjuha-coin/core/primitives'
import { BlockHeader } from '@panjuha-coin/core/primitives/classes/block-header'
import { isU32 } from '@panjuha-coin/core/primitives/u32.number'
import type { ValidationError, ValidationResult } from '@panjuha-coin/core/result'

export function validateBlockHeader(blockHeader: BlockHeader): ValidationResult {
	const errors: ValidationError[] = []

	if (!isHash256(blockHeader.prevBlockHash))
		errors.push({
			code: 'INVALID_BLOCK_PREV_HASH',
			message: 'BlockHeader.prevBlockHash must be a valid 32-byte hash (Hash256).',
			path: 'blockHeader.prevBlockHash'
		})

	if (!isHash256(blockHeader.merkleRoot))
		errors.push({
			code: 'INVALID_BLOCK_MERKLE_ROOT',
			message: 'BlockHeader.merkleRoot must be a valid 32-byte hash (Hash256).',
			path: 'blockHeader.merkleRoot'
		})

	if (!isU32(blockHeader.version))
		errors.push({
			code: 'INVALID_BLOCK_VERSION',
			message: 'BlockHeader.version must be a valid unsigned 32-bit integer (u32).',
			path: 'blockHeader.version'
		})

	if (!isU32(blockHeader.time))
		errors.push({
			code: 'INVALID_BLOCK_TIME',
			message: 'BlockHeader.time must be a valid unsigned 32-bit integer (u32).',
			path: 'blockHeader.time'
		})

	if (!isU32(blockHeader.bits))
		errors.push({
			code: 'INVALID_BLOCK_BITS',
			message: 'BlockHeader.bits must be a valid unsigned 32-bit integer (u32).',
			path: 'blockHeader.bits'
		})

	if (!isU32(blockHeader.nonce))
		errors.push({
			code: 'INVALID_BLOCK_NONCE',
			message: 'BlockHeader.nonce must be a valid unsigned 32-bit integer (u32).',
			path: 'blockHeader.nonce'
		})

	return { result: errors.length === 0, errors }
}
