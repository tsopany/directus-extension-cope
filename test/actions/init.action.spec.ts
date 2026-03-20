import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';

import initAction from '../../src/actions/init.action';
import executeInitSql from '../../src/functions/execute.init.sql';

vi.mock('../../src/functions/execute.init.sql', () => ({
	default: vi.fn()
}));

describe('initAction', () => {
	beforeEach((): void => {
		vi.mocked(executeInitSql).mockResolvedValue(undefined);
		vi.spyOn(process, 'exit').mockImplementation(((): never => undefined as never) as typeof process.exit);
		vi.spyOn(console, 'log').mockImplementation(() => undefined);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach((): void => {
		vi.restoreAllMocks();
	});

	test('executes init SQL and exits with code 0', async () => {
		const database = {raw: vi.fn()};

		await initAction(database);

		expect(executeInitSql).toHaveBeenCalledWith(database);
		expect(console.log).toHaveBeenCalledWith('Use "cope init -h" for command specific help.');
		expect(process.exit).toHaveBeenCalledWith(0);
		expect(process.exit).not.toHaveBeenCalledWith(1);
	});

	test('logs error and exits with code 1 when init SQL execution fails', async () => {
		const database = {raw: vi.fn()};
		const err = new Error('boom');
		vi.mocked(executeInitSql).mockRejectedValueOnce(err);

		await initAction(database);

		expect(executeInitSql).toHaveBeenCalledWith(database);
		expect(console.error).toHaveBeenCalledWith(err);
		expect(process.exit).toHaveBeenCalledWith(1);
	});
});
