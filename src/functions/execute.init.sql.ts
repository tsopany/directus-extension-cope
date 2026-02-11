const executeInitSql = async (database: any): Promise<void> => {
	console.log('Executing SQL: init.sql');
	await database.raw(sql);
	console.log('Init SQL file executed successfully.');
};
export default executeInitSql;

const sql: string = `
	---
	CREATE
	EXTENSION IF NOT EXISTS "pgcrypto";
	
	-- STEP 1: KILL ZOMBIES (Delete relations that no longer exist in DB)
	-- This prevents the "Field does not exist" snapshot crashes
	DELETE
	FROM directus_relations
	WHERE
	  -- Only target user tables (ignore system tables)
	    many_collection NOT LIKE 'directus_%'
	  AND
	  -- Check if this specific FK is missing from the actual database
	    NOT EXISTS (SELECT 1
	                FROM information_schema.key_column_usage kcu
	                WHERE kcu.table_name = directus_relations.many_collection
	                  AND kcu.column_name = directus_relations.many_field);
	
	-- STEP 2: REGISTER NEW (The script you just used)
	INSERT INTO directus_relations (many_collection, many_field, one_collection, one_deselect_action)
	SELECT tc.table_name,
	       kcu.column_name,
	       ccu.table_name,
	       'nullify'
	FROM information_schema.table_constraints AS tc
	         JOIN information_schema.key_column_usage AS kcu
	              ON tc.constraint_name = kcu.constraint_name
	                  AND tc.table_schema = kcu.table_schema
	         JOIN information_schema.constraint_column_usage AS ccu
	              ON ccu.constraint_name = tc.constraint_name
	                  AND ccu.table_schema = tc.table_schema
	WHERE tc.constraint_type = 'FOREIGN KEY'
	  AND tc.table_name NOT LIKE 'directus_%'
	  AND NOT EXISTS (SELECT 1
	                  FROM directus_relations dr
	                  WHERE dr.many_collection = tc.table_name
	                    AND dr.many_field = kcu.column_name);
`;