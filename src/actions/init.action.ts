import executeInitSql from '../functions/execute.init.sql';

const initAction = async (database: any): Promise<never> => {
	console.log('Use "cope init -h" for command specific help.');

	try {
		await executeInitSql(database);

		process.exit(0);
	} catch (err) {
		console.error(err as Error);
		process.exit(1);
	}
};
export default initAction;
