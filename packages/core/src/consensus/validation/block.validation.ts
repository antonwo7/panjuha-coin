/**
 * Block validation (basic structural checks).
 *
 * This layer focuses on "is the block well-formed?" rather than chain selection or UTXO rules.
 * Expect to add deeper checks later (merkle root, coinbase rules, tx semantics).
 */

import { Block } from '@panjuha-coin/core/primitives/classes/block'
import type { ValidationError, ValidationResult } from '@panjuha-coin/core/result'
import { validateBlockHeader } from './block-header.validation'
import { MAX_TXS_PER_BLOCK } from '@panjuha-coin/core/spec/limits'
import { validateTxBasic } from './tx-basic.validation'
import { isCoinbaseTx } from './coinbase-tx-basic'
import { BlockHeader } from '@panjuha-coin/core/primitives/classes/block-header'
import { NetworkParams } from '../network-params.type'
import { encodeBlockHeader } from '@panjuha-coin/core/codec/block-header.codec'
import { hash256 } from '@panjuha-coin/core/crypto/hash256.crypto'
import { computeMerkleRoot } from '@panjuha-coin/core/crypto'
import { encodeTransaction } from '@panjuha-coin/core/codec/transaction.codec'
import { encodeBlock } from '@panjuha-coin/core/codec/block.codec'
import { bytesToHex, hexToBigInt } from '@panjuha-coin/core/primitives'

/**
 * Validates the given object and throws on the first rule violation.
 *
 * Keep this strict: if we accept malformed data here, it becomes a consensus footgun later.
 *
 * @param input Object to validate.
 * @throws If the object violates a required rule.
 */
export function validateBlockBasic(block: Block): ValidationResult {
	const blockHeaderValidation = validateBlockHeader(block.header)

	let errors: ValidationError[] = blockHeaderValidation.errors

	if (block.transactions.length > MAX_TXS_PER_BLOCK)
		errors.push({
			code: 'LIMIT_EXCEEDED_TXS_PER_BLOCK',
			message: `Block contains too many transactions: ${block.transactions.length}. Maximum allowed is MAX_TXS_PER_BLOCK=${MAX_TXS_PER_BLOCK}.`,
			path: 'block.transactions'
		})

	if (block.transactions.length === 0)
		errors.push({
			code: 'INVALID_BLOCK_NO_TRANSACTIONS',
			message: 'Block must contain at least 1 transaction (coinbase).',
			path: 'block.transactions'
		})

	if (block.transactions.length > 0 && !isCoinbaseTx(block.transactions[0]))
		errors.push({
			code: 'INVALID_BLOCK_COINBASE_POSITION',
			message: 'Coinbase transaction must be the first transaction in the block.',
			path: 'block.transactions[0]'
		})

	block.transactions.forEach((tx, i) => {
		const txValidation = validateTxBasic(tx)

		if (txValidation.errors.length > 0)
			errors = errors.concat(
				txValidation.errors.map(err => ({
					...err,
					path: `block.transactions[${i}].${err.path}`,
					message: `Tx ${i + 1}: ${err.message}`
				}))
			)

		if (i > 0 && isCoinbaseTx(tx))
			errors.push({
				code: 'INVALID_BLOCK_MULTIPLE_COINBASE',
				message: `Tx ${i + 1}: only the first transaction can be coinbase.`,
				path: `block.transactions[${i}]`
			})
	})

	return { result: errors.length === 0, errors }
}

/**
 * Validates the given object and throws on the first rule violation.
 *
 * Keep this strict: if we accept malformed data here, it becomes a consensus footgun later.
 *
 * @param input Object to validate.
 * @throws If the object violates a required rule.
 */
export function validateBlockForChain(
	block: Block,
	prevBlockHeader: BlockHeader,
	params: NetworkParams
): ValidationResult {
	const blockBasicValidation = validateBlockBasic(block)

	let errors = blockBasicValidation.errors

	if (block.header.prevBlockHash !== hash256(encodeBlockHeader(prevBlockHeader)))
		errors.push({
			code: 'INVALID_BLOCK_PREV_HASH_MISMATCH',
			message: '',
			path: 'block.header.prevBlockHash'
		})

	if (
		block.header.merkleRoot !==
		computeMerkleRoot(block.transactions.map(tx => hash256(encodeTransaction(tx))))
	)
		errors.push({
			code: 'INVALID_BLOCK_MERKLE_ROOT_MISMATCH',
			message: '',
			path: 'block.header.prevBlockHash'
		})

	if (encodeBlock(block).length > params.maxBlockSizeBytes)
		errors.push({
			code: 'INVALID_BLOCK_MERKLE_ROOT_MISMATCH',
			message: '',
			path: 'block.header.prevBlockHash'
		})

	return { result: errors.length === 0, errors }
}
