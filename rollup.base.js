// rollup.base.js — factory único de configuração de build para todos os pacotes.
// O `projectRequire` é o require DO PACOTE (passado pelo rollup.config.js local),
// preservando a resolução de versões dos plugins por pacote (rollup 3 vs 4).
module.exports = function createRollupConfig(projectRequire, packageJson, options = {}) {
	const resolve = projectRequire("@rollup/plugin-node-resolve");
	const commonjs = projectRequire("@rollup/plugin-commonjs");
	const typescript = projectRequire("@rollup/plugin-typescript");
	const terser = options.terser !== false ? projectRequire("@rollup/plugin-terser") : null;
	const json = options.json ? projectRequire("@rollup/plugin-json") : null;
	const fs = projectRequire("fs");

	const external = [
		...(packageJson.dependencies ? Object.keys(packageJson.dependencies) : []),
		...(options.includeDevDeps ? Object.keys(packageJson.devDependencies || {}) : []),
		...(options.includeAll
			? [
					...Object.keys(packageJson.peerDependencies || {}),
					...Object.keys(packageJson.optionalDependencies || {}),
					...Object.keys(packageJson.devDependencies || {}),
				]
			: []),
		...(options.extraExternal || []),
	];

	const input = options.multiEntry
		? fs
				.readdirSync("./src")
				.filter((file) => file.endsWith(".ts"))
				.map((file) => `./src/${file}`)
		: options.input || "src/index.ts";

	const output = options.preserveModules
		? [
				{
					format: "cjs",
					sourcemap: true,
					dir: "dist",
					preserveModules: true,
					preserveModulesRoot: "src",
					entryFileNames: "[name].js",
				},
				{
					format: "esm",
					sourcemap: true,
					dir: "dist",
					preserveModules: true,
					preserveModulesRoot: "src",
					entryFileNames: "[name].esm.js",
				},
			]
		: [
				{
					file: "dist/index.js",
					format: "cjs",
					sourcemap: true,
				},
				{
					file: "dist/index.esm.js",
					format: "esm",
					sourcemap: true,
				},
			];

	return {
		input,
		output,
		plugins: [
			resolve({
				preferBuiltins: options.preferBuiltins ?? true,
			}),
			commonjs(),
			...(json ? [json()] : []),
			typescript({
				tsconfig: "./tsconfig.json",
				sourceMap: true,
				...(options.declaration
					? { declaration: true, declarationDir: "./dist" }
					: {}),
			}),
			...(terser ? [terser()] : []),
		],
		external,
	};
};