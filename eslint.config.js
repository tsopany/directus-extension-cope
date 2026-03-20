import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				project: ['./tsconfig.eslint.json'],
			},
		},
		rules: {
			// This codebase currently uses `any` for Directus/database hooks.
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
	},
];
