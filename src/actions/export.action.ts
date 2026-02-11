import fs from 'fs-extra';

import executeInitSql from '../functions/execute.init.sql';

const exportAction = async (TABLES: string[], options: { file: string }, database: any): Promise<never> => {
	console.log('Use "cope export -h" for command specific help.');

	try {
		await executeInitSql(database);

		const payload: Record<string, any[]> = {};
		for (const table of TABLES) {
			payload[table] = await database(table).select('*');
		}

		await fs.writeJSON(options.file, payload, {spaces: 2});
		console.log(`Exported to ${options.file}.`);

		process.exit(0);
	} catch (err) {
		console.error(err as Error);
		process.exit(1);
	}
};
export default exportAction;