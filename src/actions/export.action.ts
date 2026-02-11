import fs from 'fs-extra';

import executeInitSql from '../functions/execute.init.sql';

const exportAction = async (TABLES: string[], options: { file: string }, database: any, logger: any): Promise<never> => {
	console.log('Use "cope export -h" for command specific help.\n');

	try {
		await executeInitSql(database, logger);

		const payload: Record<string, any[]> = {};
		for (const table of TABLES) {
			// database(table) returns a Knex QueryBuilder
			payload[table] = await database(table).select('*');
		}

		await fs.writeJSON(options.file, payload, {spaces: 2});
		logger.info(`Exported to ${options.file}.\n`);
		process.exit(0);
	} catch (err) {
		logger.error(err as Error);
		process.exit(1);
	}
};
export default exportAction;