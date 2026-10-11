import { chunk, shuffle } from "./index";

describe("Array Utils", () => {
	describe("chunk", () => {
		it("should split array into chunks", () => {
			expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
		});

		it("should throw error for invalid size", () => {
			expect(() => chunk([1, 2, 3], 0)).toThrow();
		});
	});

	describe("shuffle", () => {
		it("should return array with same length", () => {
			const array = [1, 2, 3, 4, 5];
			expect(shuffle(array)).toHaveLength(5);
		});
	});
});
