// rollup.config.js — delega ao factory central da raiz
const createRollupConfig = require("../../rollup.base.js");

module.exports = createRollupConfig(require, require("./package.json"), {
	preserveModules: true,
	json: true,
	terser: false,
	preferBuiltins: false,
	extraExternal: [
		"@modelcontextprotocol/sdk/client/index.js",
		"@modelcontextprotocol/sdk/client/sse.js",
		"@modelcontextprotocol/sdk/client/streamableHttp.js",
		"@modelcontextprotocol/sdk/client/stdio.js",
	],
});