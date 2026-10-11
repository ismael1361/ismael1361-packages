import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const PACKAGES_DIR = "packages";
const EXPECTED_PACKAGES = [
	"animation",
	"env-secure",
	"mcp-engine",
	"react-use",
	"router",
	"utils",
	"vps-manager",
	"work-daemon",
];

const INTERNAL_SCOPE = "@ismael1361/";
const DEPENDENCY_FIELDS = [
	"dependencies",
	"devDependencies",
	"peerDependencies",
	"optionalDependencies",
];

const EXPECTED_PRETTIER_CONFIG = {
	arrowParens: "always",
	bracketSameLine: false,
	bracketSpacing: true,
	semi: true,
	singleQuote: false,
	jsxSingleQuote: false,
	quoteProps: "consistent",
	trailingComma: "all",
	singleAttributePerLine: true,
	htmlWhitespaceSensitivity: "css",
	vueIndentScriptAndStyle: false,
	proseWrap: "preserve",
	insertPragma: false,
	printWidth: 200,
	requirePragma: false,
	tabWidth: 4,
	useTabs: true,
	embeddedLanguageFormatting: "auto",
};

const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));

function getRootPackage() {
	const pkgPath = join(rootDir, "package.json");
	assert.ok(existsSync(pkgPath), "package.json da raiz ausente (workspace Bun não inicializado)");
	return readJson(pkgPath);
}

function resolveWorkspaceDirs(rootPackage) {
	const workspaces = Array.isArray(rootPackage.workspaces)
		? rootPackage.workspaces
		: rootPackage.workspaces?.packages ?? [];
	return workspaces.flatMap((pattern) => {
		if (!pattern.includes("*")) {
			return [pattern];
		}
		const base = pattern.slice(0, pattern.indexOf("*")).replace(/\/$/, "");
		return readdirSync(join(rootDir, base), { withFileTypes: true })
			.filter(
				(entry) =>
					entry.isDirectory() &&
					existsSync(join(rootDir, base, entry.name, "package.json")),
			)
			.map((entry) => `${base}/${entry.name}`);
	});
}

function getWorkspacePackages() {
	return resolveWorkspaceDirs(getRootPackage()).map((dir) => {
		const pkgPath = join(rootDir, dir, "package.json");
		assert.ok(existsSync(pkgPath), `${dir}/package.json ausente`);
		return { dir, pkg: readJson(pkgPath) };
	});
}

test("raiz é privada e declara exatamente os 8 workspaces em packages/", () => {
	const rootPackage = getRootPackage();
	assert.equal(rootPackage.private, true, "package.json da raiz deve ser private");
	assert.deepEqual(
		resolveWorkspaceDirs(rootPackage).sort(),
		EXPECTED_PACKAGES.map((name) => `${PACKAGES_DIR}/${name}`).sort(),
		"workspaces da raiz divergem dos pacotes presentes em packages/",
	);
});

test("raiz não declara dependências de runtime", () => {
	const rootPackage = getRootPackage();
	for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
		assert.equal(
			rootPackage[field],
			undefined,
			`package.json da raiz não deve declarar "${field}" (apenas devDependencies de tooling)`,
		);
	}
});

test("todo workspace tem nome único dentro do escopo @ismael1361/", () => {
	const packages = getWorkspacePackages();
	const names = packages.map(({ pkg }) => pkg.name);
	assert.equal(
		new Set(names).size,
		names.length,
		`nomes de pacote duplicados: ${names.join(", ")}`,
	);
	for (const { dir, pkg } of packages) {
		assert.ok(
			typeof pkg.name === "string" && pkg.name.startsWith(INTERNAL_SCOPE),
			`${dir}/package.json deve declarar um nome no escopo ${INTERNAL_SCOPE}`,
		);
	}
});

test("dependências internas usam o protocolo workspace:", () => {
	for (const { dir, pkg } of getWorkspacePackages()) {
		for (const field of DEPENDENCY_FIELDS) {
			for (const [name, range] of Object.entries(pkg[field] ?? {})) {
				if (!name.startsWith(INTERNAL_SCOPE)) continue;
				assert.ok(
					String(range).startsWith("workspace:"),
					`${dir}: "${name}" deve usar workspace: (valor atual: "${range}")`,
				);
			}
		}
	}
});

test("todo pacote publica via bun publish e executa lifecycle via bun run", () => {
	for (const { dir, pkg } of getWorkspacePackages()) {
		const scripts = pkg.scripts ?? {};
		assert.equal(scripts.release, "bun publish", `${dir}: defina "release": "bun publish"`);
		assert.equal(
			scripts["npm:publish"],
			undefined,
			`${dir}: remova o script legado "npm:publish"`,
		);
		for (const [name, command] of Object.entries(scripts)) {
			assert.ok(
				!/(^|\s)(npm|npx)(\s|$)/.test(String(command)),
				`${dir}: script "${name}" ainda invoca npm/npx ("${command}")`,
			);
		}
	}
});

test("migração concluída: bun.lock único na raiz e sem package-lock.json nos pacotes", () => {
	assert.ok(
		existsSync(join(rootDir, "bun.lock")),
		"bun.lock ausente na raiz — rode `bun install`",
	);
	for (const dir of resolveWorkspaceDirs(getRootPackage())) {
		assert.ok(
			!existsSync(join(rootDir, dir, "package-lock.json")),
			`${dir}/package-lock.json deve ser removido (bun.lock é o lockfile único)`,
		);
	}
});

test("pacotes consumidores resolvem os irmãos por link do workspace", () => {
	for (const { dir, pkg } of getWorkspacePackages()) {
		const internalDeps = DEPENDENCY_FIELDS.flatMap((field) =>
			Object.keys(pkg[field] ?? {}),
		).filter((name) => name.startsWith(INTERNAL_SCOPE));
		for (const dep of internalDeps) {
			const linked = join(rootDir, dir, "node_modules", dep);
			const hoisted = join(rootDir, "node_modules", dep);
			assert.ok(
				existsSync(linked) || existsSync(hoisted),
				`${dir}: "${dep}" não está linkado ao workspace (rode \`bun install\`)`,
			);
		}
	}
});

test("raiz .gitignore cobre a união das regras, sem duplicatas", () => {
	const requiredPatterns = [
		"node_modules/",
		".pnp",
		".pnp.js",
		"dist/",
		"build/",
		"coverage/",
		"*.log",
		".env*",
		".DS_Store",
		".idea",
		".vscode",
	];
	const gitignorePath = join(rootDir, ".gitignore");
	assert.ok(existsSync(gitignorePath), ".gitignore ausente na raiz");
	const rules = readFileSync(gitignorePath, "utf8")
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line !== "" && !line.startsWith("#"));
	for (const pattern of requiredPatterns) {
		assert.ok(rules.includes(pattern), `raiz .gitignore deve conter "${pattern}"`);
	}
	const duplicates = rules.filter((rule, index) => rules.indexOf(rule) !== index);
	assert.deepEqual(duplicates, [], `regras duplicadas no .gitignore da raiz: ${duplicates.join(", ")}`);
});

test("nenhum pacote mantém .gitignore próprio (regras centralizadas na raiz)", () => {
	for (const { dir } of getWorkspacePackages()) {
		assert.ok(
			!existsSync(join(rootDir, dir, ".gitignore")),
			`${dir}/.gitignore deve ser removido (regras centralizadas na raiz)`,
		);
	}
});

test("nenhum pacote mantém .npmignore (publicação controlada pelo campo files)", () => {
	for (const { dir } of getWorkspacePackages()) {
		assert.ok(
			!existsSync(join(rootDir, dir, ".npmignore")),
			`${dir}/.npmignore deve ser removido (o allowlist é o campo "files")`,
		);
	}
});

test("todo pacote declara files como allowlist de publicação", () => {
	for (const { dir, pkg } of getWorkspacePackages()) {
		assert.ok(
			Array.isArray(pkg.files) && pkg.files.length > 0,
			`${dir}/package.json deve declarar "files" não vazio`,
		);
	}
});

test("raiz expõe eslint.config.js CommonJS válido exportando array", () => {
	const require = createRequire(import.meta.url);
	let config;
	try {
		config = require(join(rootDir, "eslint.config.js"));
	} catch (error) {
		assert.fail(`eslint.config.js não carrega: ${error.message}`);
	}
	assert.ok(
		Array.isArray(config) && config.length > 0,
		"eslint.config.js deve exportar array não vazio de objetos de config",
	);
});

test("eslint.config.js centraliza ignores de artefatos de build", () => {
	const require = createRequire(import.meta.url);
	const config = require(join(rootDir, "eslint.config.js"));
	const ignoresEntries = config.filter((entry) => Array.isArray(entry.ignores));
	assert.ok(ignoresEntries.length > 0, "esperado ao menos um objeto de config com ignores");
	const ignores = ignoresEntries.flatMap((entry) => entry.ignores);
	assert.ok(ignores.includes("**/node_modules/"), "ignores deve cobrir **/node_modules/");
	assert.ok(ignores.includes("**/dist/"), "ignores deve cobrir **/dist/ (artefatos de build)");
});

test("eslint.config.js desliga regras de formatação via eslint-config-prettier", () => {
	const require = createRequire(import.meta.url);
	const config = require(join(rootDir, "eslint.config.js"));
	const entriesWithRules = config.filter(
		(entry) => entry.rules && typeof entry.rules === "object",
	);
	assert.ok(
		entriesWithRules.some((entry) => entry.rules.semi === "off"),
		"algum objeto deve desligar regras de formatação (semi: off do eslint-config-prettier)",
	);
});

test("raiz declara lint/lint:fix e lint-staged cobre packages/ com eslint+prettier", () => {
	const rootPackage = getRootPackage();
	assert.ok(rootPackage.scripts?.lint, 'raiz deve declarar script "lint"');
	assert.ok(
		rootPackage.scripts.lint.includes("--quiet"),
		'script "lint" deve ocultar warnings (--quiet)',
	);
	const lintTarget = "packages/*/src/**/*.{ts,tsx,js,jsx}";
	assert.ok(
		rootPackage.scripts.lint.includes(lintTarget),
		`script "lint" deve focar ${lintTarget} (mesmo alvo do prettier)`,
	);
	assert.ok(
		rootPackage.scripts["lint:fix"].includes(lintTarget),
		`script "lint:fix" deve focar ${lintTarget}`,
	);
	assert.ok(rootPackage.scripts?.["lint:fix"], 'raiz deve declarar script "lint:fix"');
	const staged = rootPackage["lint-staged"];
	assert.ok(staged && typeof staged === "object", 'raiz deve declarar "lint-staged"');
	const [pattern, commands] = Object.entries(staged)[0];
	assert.ok(
		pattern.startsWith("packages/"),
		`lint-staged deve cobrir packages/ (padrão atual: "${pattern}")`,
	);
	assert.ok(Array.isArray(commands), "comandos de lint-staged devem ser array");
	assert.ok(commands.includes("eslint --fix"), "lint-staged deve rodar eslint --fix");
	assert.ok(commands.includes("prettier --write"), "lint-staged deve rodar prettier --write");
});

test("eslint: no-explicit-any efetiva como warn em arquivos TS", () => {
	const require = createRequire(import.meta.url);
	const config = require(join(rootDir, "eslint.config.js"));
	const matchesTs = (entry) =>
		!entry.files || entry.files.some((pattern) => pattern.includes("*.ts"));
	let effective;
	for (const entry of config) {
		if (
			entry.rules &&
			matchesTs(entry) &&
			Object.hasOwn(entry.rules, "@typescript-eslint/no-explicit-any")
		) {
			effective = entry.rules["@typescript-eslint/no-explicit-any"];
		}
	}
	assert.equal(
		effective,
		"warn",
		"severidade efetiva (última entrada aplicável a .ts) de no-explicit-any deve ser warn",
	);
});

test("prettier: raiz .prettierrc.json cobre a união das opções dos pacotes", () => {
	const prettierPath = join(rootDir, ".prettierrc.json");
	assert.ok(existsSync(prettierPath), ".prettierrc.json ausente na raiz");
	let config;
	try {
		config = JSON.parse(readFileSync(prettierPath, "utf8"));
	} catch (error) {
		assert.fail(`.prettierrc.json inválido: ${error.message}`);
	}
	assert.ok(
		config && typeof config === "object" && !Array.isArray(config),
		".prettierrc.json deve ser um objeto JSON",
	);
	for (const [key, value] of Object.entries(EXPECTED_PRETTIER_CONFIG)) {
		assert.ok(Object.hasOwn(config, key), `prettier: raiz deve declarar "${key}"`);
		assert.equal(config[key], value, `prettier: "${key}" deve ser ${JSON.stringify(value)}`);
	}
});

test("nenhum pacote mantém .prettierrc.json próprio", () => {
	for (const { dir } of getWorkspacePackages()) {
		assert.ok(
			!existsSync(join(rootDir, dir, ".prettierrc.json")),
			`${dir}/.prettierrc.json deve ser removido (config centralizada na raiz)`,
		);
	}
});
