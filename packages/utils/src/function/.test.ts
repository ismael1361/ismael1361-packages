import { debounce, throttle } from "./index";

describe("Function Utils", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe("debounce", () => {
		it("should debounce function calls", () => {
			const func = jest.fn();
			const debouncedFunc = debounce(func, 100);

			// Chamar a função várias vezes rapidamente
			debouncedFunc("a", "b", "c");
			debouncedFunc("a", "b", "c");
			debouncedFunc("a", "b", "c");

			// A função não deve ser chamada imediatamente
			expect(func).not.toHaveBeenCalled();

			// Avançar o tempo
			jest.advanceTimersByTime(100);

			// Agora a função deve ter sido chamada apenas uma vez
			expect(func).toHaveBeenCalledTimes(1);
			expect(func).toHaveBeenCalledWith("a", "b", "c");
		});

		it("should reset timer on subsequent calls", () => {
			const func = jest.fn();
			const debouncedFunc = debounce(func, 100);

			// Primeira chamada
			debouncedFunc("first");
			jest.advanceTimersByTime(50); // Avançar parcialmente

			// Segunda chamada - deve resetar o timer
			debouncedFunc("second");
			jest.advanceTimersByTime(50); // Ainda não deve chamar

			expect(func).not.toHaveBeenCalled();

			// Avançar o tempo restante
			jest.advanceTimersByTime(50); // Total 100ms desde a última chamada

			expect(func).toHaveBeenCalledTimes(1);
			expect(func).toHaveBeenCalledWith("second");
		});
	});

	describe("throttle", () => {
		it("should throttle function calls", () => {
			const func = jest.fn();
			const throttledFunc = throttle(func, 100);

			// Primeira chamada - deve executar imediatamente
			throttledFunc("first");
			expect(func).toHaveBeenCalledTimes(1);
			expect(func).toHaveBeenCalledWith("first");

			// Segunda chamada durante o throttle - não deve executar
			throttledFunc("second");
			expect(func).toHaveBeenCalledTimes(1); // Ainda apenas 1

			// Avançar o tempo
			jest.advanceTimersByTime(100);

			// Agora pode chamar novamente
			throttledFunc("third");
			expect(func).toHaveBeenCalledTimes(2);
			expect(func).toHaveBeenCalledWith("third");
		});

		it("should handle multiple calls after throttle period", () => {
			const func = jest.fn();
			const throttledFunc = throttle(func, 100);

			throttledFunc("call1");
			expect(func).toHaveBeenCalledTimes(1);

			// Avançar além do período de throttle
			jest.advanceTimersByTime(150);

			throttledFunc("call2");
			expect(func).toHaveBeenCalledTimes(2);

			throttledFunc("call3"); // Deve ser throttled
			expect(func).toHaveBeenCalledTimes(2); // Ainda 2

			jest.advanceTimersByTime(100);
			throttledFunc("call4");
			expect(func).toHaveBeenCalledTimes(3);
		});
	});
});
