import { U32 } from '../u32.number'
import { TxIn } from './txin'
import { TxOut } from './txout'

export class Transaction {
	readonly version: U32
	readonly inputs: readonly TxIn[]
	readonly outputs: readonly TxOut[]
	readonly lockTime: U32

	constructor(
		version: number,
		inputs: TxIn[],
		outputs: TxOut[],
		lockTime: number
	) {
		this.version = U32(version)
		this.inputs = [...inputs]
		this.outputs = [...outputs]
		this.lockTime = U32(lockTime)
	}
}
