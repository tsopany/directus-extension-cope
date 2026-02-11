import type {HookConfig} from '@directus/extensions';

import sqlAction from './actions/sql.action';
import initAction from './actions/init.action'
import exportAction from './actions/export.action';
import importAction from './actions/import.action';

const TABLES: string[] = [
	// System Metadata
	'directus_collections',
	'directus_fields',
	'directus_relations',

	// Access Control
	'directus_policies',
	'directus_access',
	'directus_permissions'
];

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

		cope
			.command('export')
			.description('Export Directus metadata to JSON file.')
			.option('-f, --file <file>', 'Output file', './snapshots/cope-snapshot.json')
			.action((options: { file: string }): Promise<never> => exportAction(TABLES, options, database));

		cope
			.command('import')
			.description('Import Directus metadata from JSON file')
			.option('-f, --file <file>', 'Input file', './snapshots/cope-snapshot.json.')
			.action((options: { file: string }): Promise<never> => importAction(TABLES, options, database));

		cope.action((): void => cope.help());
	});
};
export default registerHook;