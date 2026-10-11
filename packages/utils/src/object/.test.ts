import { deepClone, deepEqual, deepObservable, deepMerge, setKeyValue, getKeyValue, removeKeys } from "./index";

describe("Object Utils", () => {
	describe("deepClone", () => {
		it("should clone object", () => {
			const obj = { a: 1, b: { c: 2 } };
			const cloned = deepClone(obj);
			expect(cloned).toEqual(obj);
			expect(cloned).not.toBe(obj);
			expect(cloned.b).not.toBe(obj.b);
		});
	});

	describe("deepEqual", () => {
		it("should compare objects", () => {
			const obj1 = { a: 1, b: { c: 2 } };
			const obj2 = { a: 1, b: { c: 2 } };
			const obj3 = { a: 1, b: { c: 3 } };
			expect(deepEqual(obj1, obj2)).toBe(true);
			expect(deepEqual(obj1, obj3)).toBe(false);
		});
	});

	describe("deepObservable", () => {
		it("should create observable object", () => {
			const obj = { a: 1, b: { c: 2 }, d: { e: [{ f: 1 }, { f: 5 }] } };
			const event = jest.fn();
			const observable = deepObservable(obj, event);
			observable.a = 10;
			observable.b.c = 20;
			observable.d.e[1].f = 50;
			observable.d.e.push({ f: 30 });
			observable.d.e[2] = { f: 100 };

			expect(event).toHaveBeenCalledTimes(6);

			expect(event).toHaveBeenCalledWith({ type: "set", path: "a", property: "a", oldValue: 1, newValue: 10, target: obj });
			expect(event).toHaveBeenCalledWith({ type: "set", path: "b.c", property: "c", oldValue: 2, newValue: 20, target: obj.b });
			expect(event).toHaveBeenCalledWith({ type: "set", path: "d.e[1].f", property: "f", oldValue: 5, newValue: 50, target: obj.d.e[1] });
			expect(event).toHaveBeenCalledWith({ type: "set", path: "d.e[2]", property: 2, oldValue: undefined, newValue: { f: 30 }, target: obj.d.e });
			expect(event).toHaveBeenCalledWith({ type: "set", path: "d.e[2]", property: 2, oldValue: { f: 30 }, newValue: { f: 100 }, target: obj.d.e });
		});
	});

	describe("deepMerge", () => {
		it("should merge objects", () => {
			const obj1 = { a: 1, b: 2 };
			const obj2 = { b: 3, c: 4 };
			const merged = deepMerge(obj1, obj2);
			expect(merged).toEqual({ a: 1, b: 3, c: 4 });
		});
	});

	describe("dot-notation", () => {
		it("should set and get value using dot-notation", () => {
			const obj = { a: 1, b: { c: 2 } };
			const key = "b.c";
			const value = 3;
			setKeyValue(obj, key, value);
			expect(getKeyValue(obj, key)).toBe(value);
		});

		it("should remove keys", () => {
			const obj = { a: 1, b: { c: 2 } };
			const keys = ["b.c", "a"];
			const expected = {};
			const result = removeKeys(obj, keys);
			expect(result).toEqual(expected);
		});
	});
});
