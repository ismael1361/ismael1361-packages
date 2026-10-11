import { renderHook, act } from "@testing-library/react";
import { useSharedValues } from "./index";

describe("useSharedValues", () => {
	it("should return initial values", () => {
		const { result } = renderHook(() => useSharedValues({ x: 0, y: 0 }));
		expect(result.current.x.value).toBe(0);
		expect(result.current.y.value).toBe(0);
		act(() => {
			result.current.y.value = 10;
		});
		expect(result.current.y.value).toBe(10);
	});
});
