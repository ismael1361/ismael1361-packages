// rollup.config.js — delega ao factory central da raiz
const createRollupConfig = require("../../rollup.base.js");

module.exports = createRollupConfig(require, require("./package.json"), {
	includeDevDeps: true,
	declaration: true,
});