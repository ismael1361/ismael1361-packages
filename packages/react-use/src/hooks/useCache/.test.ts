import { renderHook, act } from "@testing-library/react";
import { useCache } from "./index";

describe("useCache", () => {
	it("should return initial value", () => {
		const { result } = renderHook(() => useCache("test", 0));
		expect(result.current[0]).toBe(0);

		act(() => {
			result.current[1](10);
		});

		expect(result.current[0]).toBe(10);
	});
});
