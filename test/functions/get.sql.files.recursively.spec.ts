import * as fs from 'fs-extra';
import * as path from 'node:path';
import {tmpdir} from 'node:os';
import {afterEach, describe, expect, test} from 'vitest';

import getSqlFilesRecursively from '../../src/functions/get.sql.files.recursively';

const tempDirs: string[] = [];

const createTempDir = (): string => {
	const dir: string = fs.mkdtempSync(path.join(tmpdir(), 'cope-get-sql-files-'));
	tempDirs.push(dir);
	return dir;
};

afterEach((): void => {
	for (const dir of tempDirs.splice(0)) {
		fs.removeSync(dir);
	}
});

describe('getSqlFilesRecursively', () => {
	test('returns only .sql files recursively in sorted order', () => {
		const rootDir: string = createTempDir();
		fs.ensureDirSync(path.join(rootDir, 'tables', 'nested'));
		fs.ensureDirSync(path.join(rootDir, 'indexes'));

		fs.writeFileSync(path.join(rootDir, 'z.sql'), 'select 1;');
		fs.writeFileSync(path.join(rootDir, 'tables', 'b.sql'), 'select 2;');
		fs.writeFileSync(path.join(rootDir, 'tables', 'nested', 'a.sql'), 'select 3;');
		fs.writeFileSync(path.join(rootDir, 'indexes', 'ignore.txt'), 'not sql');

		const files: string[] = getSqlFilesRecursively(rootDir);
		const relativeFiles: string[] = files.map((filePath) => path.relative(rootDir, filePath));

		expect(relativeFiles).toEqual([
			path.join('tables', 'b.sql'),
			path.join('tables', 'nested', 'a.sql'),
			'z.sql'
		]);
	});
});
