import type {HookConfig} from '@directus/extensions';

import sqlAction from './actions/sql.action';
import initAction from './actions/init.action';

const registerHook: HookConfig = ({init}: any, {database}: any): void => {
	init('cli.before', ({program}: any): void => {
		console.log('Use "cope -h" for help.');

		const cope: any = program.command('cope').helpOption('-h, --help', 'Use "cope <command> -h" for command-specific help.');

		cope
			.command('init')
			.description('Execute init.sql to initialize relation metadata.')
			.action((): Promise<never> => initAction(database));

		cope
			.command('sql')
			.description('Execute raw SQL files in enums, tables, relations and triggers folders (including nested).')
			.option('-d, --sql-dir <directory>', 'SQL directory path', './snapshots/sql/')
			.option('-f, --folders <folders>', 'Comma-separated list of folders to execute (e.g., enums,triggers)')
			.action((options: {sqlDir: string; folders?: string}): Promise<never> => sqlAction(options, database));

		cope.action((): void => cope.help());
	});
};
export default registerHook;
