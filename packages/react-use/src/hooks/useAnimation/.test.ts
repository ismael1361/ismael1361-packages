import { renderHook, act, waitFor } from "@testing-library/react";
import { useAnimation } from "./index";

describe("useAnimation", () => {
	it("should return initial value", async () => {
		const { result } = renderHook(() =>
			useAnimation(
				function* (state) {
					yield* this.timing(state.opacity, { to: 1, duration: 1000 });
				},
				{ opacity: 0 },
			),
		);

		expect(result.current.state.opacity.value).toBe(0);

		await waitFor(
			() => {
				expect(result.current.state.opacity.value).toBe(1);
			},
			{ timeout: 1500 },
		);

		expect(result.current.state.opacity.value).toBe(1);
	});
});
