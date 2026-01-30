export function isArrayUnique(a: any[]) {
	return a.length === [...new Set(a)].length
}
