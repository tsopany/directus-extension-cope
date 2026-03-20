import * as fs from 'fs-extra';
import * as path from 'node:path';
import {tmpdir} from 'node:os';
import {afterEach, describe, expect, test, vi} from 'vitest';

import sqlAction from '../../src/actions/sql.action';

const tempDirs: string[] = [];

const createTempDir = (): string => {
	const dir: string = fs.mkdtempSync(path.join(tmpdir(), 'cope-sql-action-'));
	tempDirs.push(dir);
	return dir;
};

const mockProcessExit = (mode: 'throw' | 'noop' = 'throw'): ReturnType<typeof vi.spyOn> => {
	return vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null): never => {
		if (mode === 'throw') {
			throw new Error(`process.exit:${code}`);
		}
		return undefined as never;
	});
};
const suppressConsole = () => {
	const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
	vi.spyOn(console, 'log').mockImplementation(() => undefined);
	return {errorSpy};
};

afterEach((): void => {
	for (const dir of tempDirs.splice(0)) {
		fs.removeSync(dir);
	}
	vi.restoreAllMocks();
});

describe('sqlAction', () => {
	test('exits with code 1 when --folders is missing', async () => {
		const database = {raw: vi.fn()};
		mockProcessExit();
		const {errorSpy} = suppressConsole();

		await expect(sqlAction({sqlDir: './snapshots/sql/'}, database)).rejects.toThrow('process.exit:1');

		expect(database.raw).not.toHaveBeenCalled();
		expect(errorSpy).toHaveBeenCalledWith('Error: --folders parameter is required.');
	});

	test('exits with code 1 when invalid folders are provided', async () => {
		const database = {raw: vi.fn()};
		mockProcessExit();
		const {errorSpy} = suppressConsole();

		await expect(sqlAction({sqlDir: './snapshots/sql/', folders: 'tables,invalid'}, database)).rejects.toThrow(
			'process.exit:1'
		);

		expect(database.raw).not.toHaveBeenCalled();
		expect(errorSpy).toHaveBeenCalledWith(
			'Invalid folder(s): invalid. Valid options: enums, tables, indexes, relations, triggers'
		);
	});

	test('executes SQL files from the requested folders and exits with code 0', async () => {
		const baseDir: string = createTempDir();
		const folderDir: string = path.join(baseDir, 'tables');
		fs.ensureDirSync(path.join(folderDir, 'nested'));
		fs.writeFileSync(path.join(folderDir, '01-create-table.sql'), 'SELECT 1;');
		fs.writeFileSync(path.join(folderDir, 'nested', '02-create-index.sql'), 'SELECT 2;');
		fs.writeFileSync(path.join(folderDir, 'README.md'), 'ignored');

		const database = {
			raw: vi.fn().mockResolvedValue(undefined)
		};
		const exitSpy = mockProcessExit('noop');
		suppressConsole();
		await expect(sqlAction({sqlDir: baseDir, folders: 'tables'}, database)).resolves.toBeUndefined();

		expect(database.raw).toHaveBeenCalledTimes(2);
		expect(database.raw).toHaveBeenNthCalledWith(1, 'SELECT 1;');
		expect(database.raw).toHaveBeenNthCalledWith(2, 'SELECT 2;');
		expect(exitSpy).toHaveBeenCalledWith(0);
	});

	test('logs and skips missing requested folder, then exits with code 0', async () => {
		const baseDir: string = createTempDir();
		const database = {raw: vi.fn().mockResolvedValue(undefined)};
		const exitSpy = mockProcessExit('noop');
		const {errorSpy} = suppressConsole();

		await expect(sqlAction({sqlDir: baseDir, folders: 'relations'}, database)).resolves.toBeUndefined();

		expect(database.raw).not.toHaveBeenCalled();
		expect(errorSpy).toHaveBeenCalledWith(`SQL folder not found: ${path.join(baseDir, 'relations')}, skipping...`);
		expect(exitSpy).toHaveBeenCalledWith(0);
	});

	test('logs per-file SQL execution error and continues processing', async () => {
		const baseDir: string = createTempDir();
		const folderDir: string = path.join(baseDir, 'tables');
		fs.ensureDirSync(folderDir);
		fs.writeFileSync(path.join(folderDir, '01-fail.sql'), 'SELECT fail;');
		fs.writeFileSync(path.join(folderDir, '02-ok.sql'), 'SELECT ok;');

		const rawErr = new Error('raw failed');
		const database = {
			raw: vi.fn().mockRejectedValueOnce(rawErr).mockResolvedValueOnce(undefined)
		};
		const exitSpy = mockProcessExit('noop');
		const {errorSpy} = suppressConsole();

		await expect(sqlAction({sqlDir: baseDir, folders: 'tables'}, database)).resolves.toBeUndefined();

		expect(database.raw).toHaveBeenCalledTimes(2);
		expect(errorSpy).toHaveBeenCalledWith(`SQL Execution "${path.join('tables', '01-fail.sql')}" failed:`);
		expect(errorSpy).toHaveBeenCalledWith(rawErr);
		expect(exitSpy).toHaveBeenCalledWith(0);
	});

	test('logs global execution failure and exits with code 1 when traversal throws', async () => {
		const baseDir: string = createTempDir();
		fs.writeFileSync(path.join(baseDir, 'tables'), 'this should be a directory');
		const database = {raw: vi.fn().mockResolvedValue(undefined)};
		const exitSpy = mockProcessExit('noop');
		const {errorSpy} = suppressConsole();

		await expect(sqlAction({sqlDir: baseDir, folders: 'tables'}, database)).resolves.toBeUndefined();

		expect(errorSpy).toHaveBeenCalledWith('SQL Execution failed:');
		expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
		expect(exitSpy).toHaveBeenCalledWith(1);
	});
});
