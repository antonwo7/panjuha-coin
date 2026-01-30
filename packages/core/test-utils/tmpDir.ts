import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export async function withTempDir<T>(fn: (dir: string) => Promise<T> | T, prefix: string = 'core-test-'): Promise<T> {
	const dir = await mkdtemp(join(tmpdir(), prefix))
	try {
		return await fn(dir)
	} finally {
		await rm(dir, { recursive: true, force: true })
	}
}
