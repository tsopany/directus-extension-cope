import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';

import registerHook from '../src/index';
import initAction from '../src/actions/init.action';
import sqlAction from '../src/actions/sql.action';

vi.mock('../src/actions/init.action', () => ({
	default: vi.fn()
}));

vi.mock('../src/actions/sql.action', () => ({
	default: vi.fn()
}));

type CommandStub = {
	command?: ReturnType<typeof vi.fn>;
	helpOption?: ReturnType<typeof vi.fn>;
	description?: ReturnType<typeof vi.fn>;
	option?: ReturnType<typeof vi.fn>;
	action?: ReturnType<typeof vi.fn>;
	help?: ReturnType<typeof vi.fn>;
};

const createSubCommandStub = (): Required<Pick<CommandStub, 'description' | 'option' | 'action'>> => {
	const subCommand: Required<Pick<CommandStub, 'description' | 'option' | 'action'>> = {
		description: vi.fn(),
		option: vi.fn(),
		action: vi.fn()
	};
	subCommand.description.mockReturnValue(subCommand);
	subCommand.option.mockReturnValue(subCommand);
	subCommand.action.mockReturnValue(subCommand);
	return subCommand;
};

describe('registerHook', () => {
	beforeEach(() => {
		vi.mocked(initAction).mockResolvedValue(undefined as never);
		vi.mocked(sqlAction).mockResolvedValue(undefined as never);
	});

	afterEach((): void => {
		vi.restoreAllMocks();
	});

	test('registers cli.before and configures cope commands', async () => {
		const initCommand = createSubCommandStub();
		const sqlCommand = createSubCommandStub();
		const cope: Required<CommandStub> = {
			command: vi.fn((name: string) => {
				if (name === 'init') {
					return initCommand;
				}
				if (name === 'sql') {
					return sqlCommand;
				}
				throw new Error(`Unknown command: ${name}`);
			}),
			helpOption: vi.fn(),
			description: vi.fn(),
			option: vi.fn(),
			action: vi.fn(),
			help: vi.fn()
		};
		cope.helpOption.mockReturnValue(cope);
		cope.action.mockReturnValue(cope);
		const program = {
			command: vi.fn().mockReturnValue(cope)
		};
		const init = vi.fn();
		const database = {raw: vi.fn()};
		vi.spyOn(console, 'log').mockImplementation(() => undefined);

		await registerHook({init}, {database});

		expect(init).toHaveBeenCalledWith('cli.before', expect.any(Function));
		const beforeHandler = init.mock.calls[0]?.[1] as ({program}: {program: typeof program}) => Promise<void>;
		await beforeHandler({program});

		expect(program.command).toHaveBeenCalledWith('cope');
		expect(cope.helpOption).toHaveBeenCalledWith('-h, --help', 'Use "cope <command> -h" for command-specific help.');
		expect(cope.command).toHaveBeenCalledWith('init');
		expect(cope.command).toHaveBeenCalledWith('sql');
		expect(initCommand.description).toHaveBeenCalledWith('Execute init.sql to initialize relation metadata.');
		expect(sqlCommand.description).toHaveBeenCalledWith(
			'Execute raw SQL files in enums, tables, relations and triggers folders (including nested).'
		);
		expect(sqlCommand.option).toHaveBeenNthCalledWith(1, '-d, --sql-dir <directory>', 'SQL directory path', './snapshots/sql/');
		expect(sqlCommand.option).toHaveBeenNthCalledWith(
			2,
			'-f, --folders <folders>',
			'Comma-separated list of folders to execute (e.g., enums,triggers)'
		);
	});

	test('wires init and sql command actions to their action handlers', async () => {
		const initCommand = createSubCommandStub();
		const sqlCommand = createSubCommandStub();
		const cope: Required<CommandStub> = {
			command: vi.fn((name: string) => (name === 'init' ? initCommand : sqlCommand)),
			helpOption: vi.fn(),
			description: vi.fn(),
			option: vi.fn(),
			action: vi.fn(),
			help: vi.fn()
		};
		cope.helpOption.mockReturnValue(cope);
		cope.action.mockReturnValue(cope);
		const program = {
			command: vi.fn().mockReturnValue(cope)
		};
		const init = vi.fn();
		const database = {raw: vi.fn()};
		vi.spyOn(console, 'log').mockImplementation(() => undefined);

		await registerHook({init}, {database});
		const beforeHandler = init.mock.calls[0]?.[1] as ({program}: {program: typeof program}) => Promise<void>;
		await beforeHandler({program});

		const initHandler = initCommand.action.mock.calls[0]?.[0] as () => Promise<never>;
		await initHandler();
		expect(initAction).toHaveBeenCalledWith(database);

		const options = {sqlDir: './custom/sql', folders: 'tables,triggers'};
		const sqlHandler = sqlCommand.action.mock.calls[0]?.[0] as (opts: typeof options) => Promise<never>;
		await sqlHandler(options);
		expect(sqlAction).toHaveBeenCalledWith(options, database);

		const defaultHandler = cope.action.mock.calls[0]?.[0] as () => void;
		defaultHandler();
		expect(cope.help).toHaveBeenCalledTimes(1);
	});
});
