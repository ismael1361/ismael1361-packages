import { renderHook, act } from "@testing-library/react";
import { useToggle } from "./index";

describe("useToggle", () => {
	it("should return initial value", () => {
		const { result } = renderHook(() => useToggle(false));
		expect(result.current[0]).toBe(false);
	});

	it("should toggle value", () => {
		const { result } = renderHook(() => useToggle(false));
		act(() => result.current[1]());
		expect(result.current[0]).toBe(true);
		act(() => result.current[1]());
		expect(result.current[0]).toBe(false);
	});
});
