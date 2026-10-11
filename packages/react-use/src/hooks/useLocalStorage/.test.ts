import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./index";

describe("useLocalStorage", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	it("should return initial value", () => {
		const { result } = renderHook(() => useLocalStorage("test", "initial"));
		expect(result.current[0]).toBe("initial");
	});

	it("should set and get value from localStorage", () => {
		const { result } = renderHook(() => useLocalStorage("test", "initial"));

		act(() => {
			result.current[1]("new value");
		});

		expect(result.current[0]).toBe("new value");
		expect(window.localStorage.getItem("test")).toBe(JSON.stringify("new value"));
	});
});
