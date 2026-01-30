// export type ValidationOk = { ok: true }

// export type ValidationErr = {
// 	ok: false
// 	code: string
// 	message?: string
// }

// export type ValidationResult = ValidationOk | ValidationErr

// export const ok = (): ValidationOk => ({ ok: true })

// export const err = (code: string, message?: string): ValidationErr => ({
// 	ok: false,
// 	code,
// 	message
// })

export type ValidationError = { code: string; message: string; path?: string }
export type ValidationResult = {
	result: boolean
	errors: ValidationError[]
}
