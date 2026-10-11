import { capitalize, slugify, clsx } from "./index";

describe("String Utils", () => {
	describe("capitalize", () => {
		it("should capitalize string", () => {
			const str = "hello world";
			const capitalized = capitalize(str);
			expect(capitalized).toBe("Hello world");
		});
	});

	describe("slugify", () => {
		it("should slugify string", () => {
			const str = "Hello World!";
			const slugified = slugify(str);
			expect(slugified).toBe("hello-world");
		});
	});

	describe("clsx", () => {
		it("should join classes", () => {
			const isActive = true;
			const hasError = false;

			const classes = clsx(
				"button",
				"p-4",
				isActive && "button-active",
				null,
				{
					"button-primary": isActive,
					"button-error": hasError,
				},
				undefined,
			);

			expect(classes).toBe("button p-4 button-active button-primary");
		});
	});
});
