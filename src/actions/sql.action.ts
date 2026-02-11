import fs from 'fs-extra';
import path from 'node:path';

import getSqlFilesRecursively from '../functions/get.sql.files.recursively';

const sqlAction = async (options: { sqlDir: string }, database: any, logger: any): Promise<never> => {
	console.log('Use "cope sql -h" for command specific help.\n');

	const sqlFolders: string[] = ['enums', 'tables', 'relations', 'triggers'];
	const baseDir: string = path.resolve(process.cwd(), options.sqlDir);

	try {
		for (const folder of sqlFolders) {
			const folderPath: string = path.join(baseDir, folder);

			if (!fs.existsSync(folderPath)) {
				logger.warn(`SQL folder not found: ${folderPath}, skipping...`);
				continue;
			}

			const files: string[] = getSqlFilesRecursively(folderPath);
			for (const filePath of files) {
				const relativePath: string = path.relative(baseDir, filePath);
				const sql: string = fs.readFileSync(filePath, 'utf8');

				try {
					logger.info(`Executing SQL "${relativePath}".`);
					await database.raw(sql);
				} catch (err) {
					logger.error(`SQL Execution "${relativePath}" failed:`);
					logger.error(err as Error);
				}
			}
		}
		logger.info('All SQL files executed successfully.\n');
		process.exit(0);
	} catch (err) {
		logger.error('SQL Execution failed:');
		logger.error(err as Error);
		process.exit(1);
	}
};
export default sqlAction;