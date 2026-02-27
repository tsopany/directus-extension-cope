import type {HookConfig} from '@directus/extensions';

import sqlAction from './actions/sql.action';
import initAction from './actions/init.action'

const registerHook: HookConfig = async ({init}: any, {database}: any): Promise<void> => {
	init('cli.before', async ({program}: any): Promise<void> => {
		console.log('Use "cope -h" for help.');

		const cope: any = program
			.command('cope')
			.helpOption('-h, --help', 'Use "cope <command> -h" for command-specific help.');

		cope
			.command('init')
			.description('Execute init.sql to initialize relation metadata.')
			.action((): Promise<never> => initAction(database));

		cope
			.command('sql')
			.description('Execute raw SQL files in enums, tables, relations and triggers folders (including nested).')
			.option('-d, --sql-dir <directory>', 'SQL directory path', './snapshots/sql/')
			.action((options: { sqlDir: string }): Promise<never> => sqlAction(options, database));

		cope.action((): void => cope.help());
	});
};
export default registerHook;