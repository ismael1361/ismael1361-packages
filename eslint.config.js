// eslint.config.js — config única para todo o monorepo (flat config, ESLint 10)
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const prettier = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
	{
		ignores: ["**/node_modules/", ".git/", "**/dist/", "**/coverage/", "**/*.tgz", "bun.lock"],
	},
	js.configs.recommended, // regras core (aplica em **/*.{js,cjs,mjs} e TS)
	...tseslint.configs.recommended, // parser + plugin TS (sem type-aware)
	{
		// política do monorepo: `any` explícito é permitido, mas sinalizado como warn
		files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
		rules: {
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/ban-ts-comment": "warn",
			"preserve-caught-error": "warn",
			"no-control-regex": "off",
			"@typescript-eslint/no-unused-vars": "warn",
			"no-prototype-builtins": "warn",
			"@typescript-eslint/no-this-alias": "warn",
			"no-useless-escape": "off",
			"prefer-const": "warn",
			"no-useless-assignment": "off",
			"@typescript-eslint/no-unused-expressions": "warn",
			"no-empty": "warn",
			"prefer-rest-params": "warn",
			"@typescript-eslint/no-empty-object-type": "warn",
			"prefer-spread": "warn",
			"@typescript-eslint/no-unsafe-function-type": "warn",
		},
	},
	{
		// configs CommonJS do monorepo (rollup.config.js, jest.config.js, eslint.config.js)
		files: ["**/*.js", "**/*.cjs"],
		languageOptions: {
			sourceType: "commonjs",
			globals: globals.node,
		},
		rules: {
			"@typescript-eslint/no-require-imports": "off", // require é idioma nativo destes configs
		},
	},
	{
		// scripts ESM do monorepo (ex.: test/workspace.test.mjs)
		files: ["**/*.mjs"],
		languageOptions: {
			sourceType: "module",
			globals: globals.node,
		},
	},
	{
		// globals do Jest para arquivos de teste
		files: ["**/*.test.ts", "**/__tests__/**/*.ts"],
		languageOptions: { globals: globals.jest },
	},
	prettier, // sempre último: desliga regras de formatação do core
];
