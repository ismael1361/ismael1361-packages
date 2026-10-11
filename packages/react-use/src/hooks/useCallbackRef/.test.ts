import { renderHook, act } from "@testing-library/react";
import { useCallbackRef } from "./index";

describe("useCallbackRef", () => {
	it("should return the same function", () => {
		const { result } = renderHook(() =>
			useCallbackRef((number: number) => {
				return number;
			}),
		);
		expect(result.current(1)).toBe(1);
	});
});
