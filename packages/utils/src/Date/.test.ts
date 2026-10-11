import { formatDate } from "./formatDate";

describe("Date Utils", () => {
	describe("formatDate", () => {
		it("should format date", () => {
			const date = new Date("2023/01/01");
			expect(formatDate(date, "YYYY-MM-DD")).toBe("2023-01-01");

			const dateWithTime = new Date("2023-01-01T12:34:56");
			expect(formatDate(dateWithTime, "YYYY-MM-DD HH:mm:ss")).toBe("2023-01-01 12:34:56");

			const dateWithMilliseconds = new Date("2023-01-01T12:34:56.789");
			expect(formatDate(dateWithMilliseconds, "YYYY-MM-DD HH:mm:ss.SSS")).toBe("2023-01-01 12:34:56.789");
		});
	});
});
