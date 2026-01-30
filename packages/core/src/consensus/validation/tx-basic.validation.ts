import { isAmount } from '@panjuha-coin/core/primitives/amount.number'
import { Transaction } from '@panjuha-coin/core/primitives/classes/transaction'
import { isTxId, txIdToHex } from '@panjuha-coin/core/primitives/txid.hash'
import { isU32 } from '@panjuha-coin/core/primitives/u32.number'
import type { ValidationError, ValidationResult } from '@panjuha-coin/core/result'
import { MAX_SCRIPT_BYTES, MAX_TX_INPUTS, MAX_TX_OUTPUTS } from '@panjuha-coin/core/spec/limits'
import { isArrayUnique } from '@panjuha-coin/shared-utils/array'

export function validateTxBasic(tx: Transaction): ValidationResult {
	const errors: ValidationError[] = []

	if (!isU32(tx.version))
		errors.push({
			code: 'INVALID_TX_VERSION',
			message: 'Transaction version must be a valid unsigned 32-bit integer (u32).',
			path: 'tx.version'
		})

	if (!isU32(tx.lockTime))
		errors.push({
			code: 'INVALID_TX_LOCK_TIME',
			message: 'Transaction lockTime must be a valid unsigned 32-bit integer (u32).',
			path: 'tx.lockTime'
		})

	if (tx.inputs.length <= 0 || tx.inputs.length > MAX_TX_INPUTS)
		errors.push({
			code: 'INVALID_TX_INPUT_COUNT',
			message: `Transaction must have between 1 and ${MAX_TX_INPUTS} inputs.`,
			path: 'tx.inputs'
		})

	if (tx.outputs.length <= 0 || tx.outputs.length > MAX_TX_OUTPUTS)
		errors.push({
			code: 'INVALID_TX_OUTPUT_COUNT',
			message: `Transaction must have between 1 and ${MAX_TX_OUTPUTS} outputs.`,
			path: 'tx.outputs'
		})

	const prevTxIdPrevIndex: string[] = []

	tx.inputs.forEach((input, i) => {
		if (!isTxId(input.prevTxId))
			errors.push({
				code: 'INVALID_TXIN_PREV_TXID',
				message: 'TxIn.prevTxId must be a valid 32-byte transaction id (TxId).',
				path: `tx.inputs[${i}].prevTxId`
			})

		if (!isU32(input.prevIndex))
			errors.push({
				code: 'INVALID_TXIN_PREV_INDEX',
				message: 'TxIn.prevIndex must be a valid unsigned 32-bit integer (u32).',
				path: `tx.inputs[${i}].prevIndex`
			})

		if (input.scriptSig.length > MAX_SCRIPT_BYTES)
			errors.push({
				code: 'TXIN_SCRIPTSIG_TOO_LARGE',
				message: `TxIn.scriptSig length must not exceed ${MAX_SCRIPT_BYTES} bytes.`,
				path: `tx.inputs[${i}].scriptSig`
			})

		if (!isU32(input.sequence))
			errors.push({
				code: 'INVALID_TXIN_SEQUENCE',
				message: 'TxIn.sequence must be a valid unsigned 32-bit integer (u32).',
				path: `tx.inputs[${i}].sequence`
			})

		prevTxIdPrevIndex.push(`${txIdToHex(input.prevTxId)}::${String(input.prevIndex)}`)
	})

	if (!isArrayUnique(prevTxIdPrevIndex))
		errors.push({
			code: 'DUPLICATE_INPUT_OUTPOINT',
			message: 'Transaction inputs must not contain duplicate outpoints (prevTxId + prevIndex).',
			path: 'tx.inputs'
		})

	let outputTotalAmount: bigint = 0n

	tx.outputs.forEach((output, i) => {
		outputTotalAmount += output.value

		if (!isAmount(output.value))
			errors.push({
				code: 'INVALID_TXOUT_VALUE',
				message: 'TxOut.value must be a valid Amount (u64) and must not exceed MAX_MONEY.',
				path: `tx.outputs[${i}].value`
			})

		if (output.scriptPubKey.length > MAX_SCRIPT_BYTES)
			errors.push({
				code: 'TXOUT_SCRIPTPUBKEY_TOO_LARGE',
				message: `TxOut.scriptPubKey length must not exceed ${MAX_SCRIPT_BYTES} bytes.`,
				path: `tx.outputs[${i}].scriptPubKey`
			})
	})

	if (!isAmount(outputTotalAmount))
		errors.push({
			code: 'INVALID_TX_TOTAL_OUTPUT',
			message:
				'Total output value (sum of all TxOut.value) must be a valid Amount (u64) and must not exceed MAX_MONEY.',
			path: 'tx.outputs'
		})

	return { result: errors.length === 0, errors }
}
