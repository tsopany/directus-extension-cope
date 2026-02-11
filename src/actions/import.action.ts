import fs from 'fs-extra';

const importAction = async (TABLES: string[], options: { file: string }, database: any, logger: any): Promise<never> => {
	console.log('Use "cope import -h" for command specific help.\n');

	try {
		const data: Record<string, any[]> = await fs.readJSON(options.file);

		await database.transaction(async (trx: any): Promise<void> => {
			// Reverse tables to handle foreign key dependencies (Permissions -> Roles)
			const reverseTables: string[] = [...TABLES].reverse();
			for (const table of reverseTables) {
				await trx(table).delete();
			}

			// Insert data in original order
			for (const table of TABLES) {
				if (data[table] && data[table].length > 0) {
					await trx(table).insert(data[table]);
				}
			}
		});

		logger.info(`Imported from ${options.file}.\n`);
		process.exit(0);
	} catch (err) {
		logger.error(err as Error);
		process.exit(1);
	}

};
export default importAction;