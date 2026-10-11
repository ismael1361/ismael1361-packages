const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");
const current_package = require("./package.json");

const dependencies = Object.keys(current_package?.dependencies || {});
const devDependencies = Object.keys(current_package?.devDependencies || {});

dependencies.push(...devDependencies);

module.exports = {
	input: "src/index.ts",
	output: [
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
	],
	plugins: [
		resolve(),
		commonjs(),
		typescript({
			tsconfig: "./tsconfig.json",
			declaration: true,
			declarationDir: "./dist",
			sourceMap: true,
		}),
		terser(),
	],
	external: dependencies,
};
