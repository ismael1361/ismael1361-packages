import { renderHook, act } from "@testing-library/react";
import { useData } from "./index";

describe("useData", () => {
	it("should return initial value", () => {
		const { result } = renderHook(() => useData({ value: 0 }));

		act(() => {
			expect(result.current.data.value).toBe(0);
			expect(result.current.canUndo).toBe(false);
			expect(result.current.canRedo).toBe(false);

			result.current.data.value = 10;

			expect(result.current.data.value).toBe(10);
			expect(result.current.canUndo).toBe(true);
			expect(result.current.canRedo).toBe(false);

			result.current.undo();

			expect(result.current.data.value).toBe(0);
			expect(result.current.canUndo).toBe(false);
			expect(result.current.canRedo).toBe(true);

			result.current.data.value = 40;

			expect(result.current.data.value).toBe(40);
			expect(result.current.canUndo).toBe(true);
			expect(result.current.canRedo).toBe(false);
		});
	});
});
