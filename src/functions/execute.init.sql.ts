import fs from 'fs-extra';
import path from 'node:path';

const executeInitSql = async (database: any, logger: any): Promise<void> => {
	const initSqlPath: string = path.join(process.cwd(), 'extensions', 'cope', 'src', 'sql', 'init.sql');
	if (fs.existsSync(initSqlPath)) {
		const initSql: string = fs.readFileSync(initSqlPath, 'utf8');
		logger.info('Executing SQL: init.sql');
		await database.raw(initSql);
		logger.info('Init SQL file executed successfully.\n');
	}
};
export default executeInitSql;