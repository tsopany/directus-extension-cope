import fs from 'fs-extra';
import path from 'node:path';
import {Dirent} from 'node:fs';

const getSqlFilesRecursively = (dir: string): string[] => {
	let results: string[] = [];
	const entries: Dirent<string>[] = fs.readdirSync(dir, {withFileTypes: true});
	for (const entry of entries) {
		const fullPath: string = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results = results.concat(getSqlFilesRecursively(fullPath));
		} else if (entry.name.endsWith('.sql')) {
			results.push(fullPath);
		}
	}
	return results.sort();
};
export default getSqlFilesRecursively;