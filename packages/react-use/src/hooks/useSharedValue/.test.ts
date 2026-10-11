import { renderHook, act } from "@testing-library/react";
import { useSharedValue } from "./index";

describe("useSharedValue", () => {
	it("should return initial value", () => {
		const { result } = renderHook(() => useSharedValue(0));

		act(() => {
			expect(result.current.value).toBe(0);
			result.current.value = 10;
			expect(result.current.value).toBe(10);
		});
	});
});
