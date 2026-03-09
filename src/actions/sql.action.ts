import fs from 'fs-extra';
import path from 'node:path';

import getSqlFilesRecursively from '../functions/get.sql.files.recursively';

const sqlAction = async (options: {sqlDir: string; folders?: string}, database: any): Promise<never> => {
	console.log('Use "cope sql -h" for command specific help.');

	const allFolders: string[] = ['enums', 'tables', 'indexes', 'relations', 'triggers'];

	if (!options.folders) {
		console.error('Error: --folders parameter is required.');
		console.error(`Valid options: ${allFolders.join(', ')}`);
		process.exit(1);
	}

	const requestedFolders: string[] = options.folders.split(',').map((f) => f.trim());
	const invalidFolders: string[] = requestedFolders.filter((f) => !allFolders.includes(f));

	if (invalidFolders.length > 0) {
		console.error(`Invalid folder(s): ${invalidFolders.join(', ')}. Valid options: ${allFolders.join(', ')}`);
		process.exit(1);
	}

	const sqlFolders: string[] = allFolders.filter((f) => requestedFolders.includes(f));
	console.log(`Executing SQL from folders: ${sqlFolders.join(', ')}`);
	const baseDir: string = path.resolve(process.cwd(), options.sqlDir);

	try {
		for (const folder of sqlFolders) {
			const folderPath: string = path.join(baseDir, folder);

			if (!fs.existsSync(folderPath)) {
				console.error(`SQL folder not found: ${folderPath}, skipping...`);
				continue;
			}

			const files: string[] = getSqlFilesRecursively(folderPath);
			for (const filePath of files) {
				const relativePath: string = path.relative(baseDir, filePath);
				const sql: string = fs.readFileSync(filePath, 'utf8');

				try {
					console.log(`Executing SQL "${relativePath}".`);
					await database.raw(sql);
				} catch (err) {
					console.error(`SQL Execution "${relativePath}" failed:`);
					console.error(err as Error);
				}
			}
		}
		console.log('SQL Execution completed.');

		process.exit(0);
	} catch (err) {
		console.error('SQL Execution failed:');
		console.error(err as Error);
		process.exit(1);
	}
};
export default sqlAction;
