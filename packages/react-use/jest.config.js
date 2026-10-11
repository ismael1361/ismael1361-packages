module.exports = {
	preset: "ts-jest",
	testEnvironment: "jsdom",
	roots: ["<rootDir>/src"],
	setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
	// moduleNameMapping: {
	//     "\\.(css|less|scss|sass)$": "identity-obj-proxy",
	// },
	// Configurações adicionais
	testTimeout: 60000,
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
	verbose: true,
};
