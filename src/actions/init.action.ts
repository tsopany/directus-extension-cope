import executeInitSql from '../functions/execute.init.sql';

const initAction = async (database: any, logger: any): Promise<never> => {
	console.log('Use "cope init -h" for command specific help.\n');

	try {
		await executeInitSql(database, logger);
		process.exit(0);
	} catch (err) {
		logger.error(err as Error);
		process.exit(1);
	}
};
export default initAction;