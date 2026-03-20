import {afterEach, describe, expect, test, vi} from 'vitest';

import executeInitSql from '../../src/functions/execute.init.sql';

afterEach((): void => {
	vi.restoreAllMocks();
});

describe('executeInitSql', () => {
	test('executes init SQL against the database and logs progress', async () => {
		const database = {
			raw: vi.fn().mockResolvedValue(undefined)
		};
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

		await executeInitSql(database);

		expect(database.raw).toHaveBeenCalledTimes(1);
		expect(database.raw).toHaveBeenCalledWith(expect.stringContaining('EXTENSION IF NOT EXISTS "pgcrypto"'));
		expect(logSpy).toHaveBeenCalledWith('Executing SQL: init.sql');
		expect(logSpy).toHaveBeenCalledWith('Init SQL file executed successfully.');
	});
});
