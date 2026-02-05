/**
 * Coinbase transaction builder (minimal / regtest-friendly).
 *
 * Coinbase is the first transaction in a block. It mints the block subsidy (and later fees).
 * This helper only builds the basic shape; enforce full coinbase rules in validation.
 */

import { bytesEqual, zeroHash256 } from '@panjuha-coin/core/primitives'
import { Transaction } from '@panjuha-coin/core/primitives/classes/transaction'
import { ValidationError, ValidationResult } from '@panjuha-coin/core/result'

export function isCoinbaseTx(tx: Transaction) {
	if (
		tx.inputs.length === 1 &&
		bytesEqual(tx.inputs[0].prevTxId, zeroHash256()) &&
		tx.inputs[0].prevIndex === 2 ** 32 - 1 &&
		tx.inputs[0].scriptSig.length > 0
	) {
		return true
	}
	return false
}

export function validateCoinbaseTxBasic(tx: Transaction): ValidationResult {
	const errors: ValidationError[] = []

	if (tx.inputs.length !== 1)
		errors.push({
			code: 'INVALID_COINBASE_INPUTS_COUNT',
			message: 'Coinbase transaction must have exactly 1 input.',
			path: 'tx.inputs.length'
		})

	if (!bytesEqual(tx.inputs[0].prevTxId, zeroHash256()))
		errors.push({
			code: 'INVALID_COINBASE_PREV_TX_ID',
			message: 'Coinbase input.prevTxId must be 32 bytes of zeros (zero hash).',
			path: 'tx.inputs[0].prevTxId'
		})

	if (tx.inputs[0].prevIndex !== 2 ** 32 - 1)
		errors.push({
			code: 'INVALID_COINBASE_PREV_INDEX',
			message: 'Coinbase input.prevIndex must be 0xffffffff.',
			path: 'tx.inputs[0].prevIndex'
		})

	if (tx.inputs[0].scriptSig.length === 0)
		errors.push({
			code: 'INVALID_COINBASE_SCRIPTSIG_EMPTY',
			message: 'Coinbase input.scriptSig must be non-empty.',
			path: 'tx.inputs[0].scriptSig'
		})

	return { result: errors.length === 0, errors }
}
