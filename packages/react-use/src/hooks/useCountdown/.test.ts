import { renderHook, act, waitFor } from "@testing-library/react";
import { useCountdown } from "./index";

describe("useCountdown", () => {
	it("should update the countdown over time", async () => {
		const initialDate = new Date();
		const target = new Date(initialDate.getTime() + 2000);

		const { result } = renderHook(() =>
			useCountdown(target, {
				interval: 1000,
				format(date) {
					if (date.difference <= 0) {
						return "Finalizado";
					}
					return `Falta tempo`;
				},
			}),
		);

		expect(result.current).toBe("Falta tempo");

		await waitFor(
			() => {
				expect(result.current).toBe("Finalizado");
			},
			{ timeout: 3500 },
		);

		expect(result.current).toBe("Finalizado");
	});
});
