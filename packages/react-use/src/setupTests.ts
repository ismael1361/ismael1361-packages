import "@testing-library/jest-dom";

// Mock console.error to avoid noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
	console.error = (...args: any[]) => {
		// Ignorar avisos específicos do React
		if (/Warning.*not wrapped in act/.test(args[0]) || /ReactDOMTestUtils.act is deprecated/.test(args[0]) || /act\(...\) is not supported in production builds of React/.test(args[0])) {
			return;
		}
		originalError.call(console, ...args);
	};

	console.warn = (...args: any[]) => {
		// Ignorar avisos de depreciação específicos
		if (/ReactDOMTestUtils.act is deprecated/.test(args[0]) || /deprecated.*act/.test(args[0])) {
			return;
		}
		originalWarn.call(console, ...args);
	};
});

afterAll(() => {
	console.error = originalError;
	console.warn = originalWarn;
});
