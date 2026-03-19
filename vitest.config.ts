import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		reporters: ['verbose', 'junit'],
		include: [
			'test/**/*.{test,spec}.?(c|m)[jt]s?(x)',
			'src/**/__tests__/*.{test,spec}.?(c|m)[jt]s?(x)'
		],
		outputFile: 'coverage/test-results.xml',
		coverage: {
			provider: 'v8',
			all: true,
			reportsDirectory: './coverage',
			reporter: ['text', 'json', 'html', 'lcov'],
			include: ['src/**/*.ts'],
			exclude: [
				'dist/**',
				'node_modules/**',
				'**/*.d.ts'
			]
		}
	}
});
