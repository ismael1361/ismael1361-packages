/**
 * Cria uma cópia profunda (deep clone) de um objeto ou valor.
 * Esta função lida com valores primitivos, objetos, arrays e datas,
 * garantindo que objetos aninhados e arrays também sejam clonados.
 *
 * @template T O tipo do objeto a ser clonado.
 * @param {T} obj O objeto ou valor a ser clonado.
 * @returns {T} Retorna uma cópia profunda do objeto ou valor.
 * @example
 * const original = {
 *   a: 1,
 *   b: 'hello',
 *   c: new Date(),
 *   d: {
 *     e: [10, 20],
 *   },
 * };
 *
 * const clone = deepClone(original);
 *
 * // Modificar o clone não afeta o original
 * clone.a = 2;
 * clone.d.e[0] = 99;
 *
 * console.log(original.a); // Saída: 1
 * console.log(original.d.e[0]); // Saída: 10
 */
export function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime()) as unknown as T;
	}

	if (obj instanceof Array) {
		return obj.map((item) => deepClone(item)) as unknown as T;
	}

	if (typeof obj === "object") {
		const cloned = {} as T;
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				cloned[key] = deepClone(obj[key]);
			}
		}
		return cloned;
	}

	return obj;
}
