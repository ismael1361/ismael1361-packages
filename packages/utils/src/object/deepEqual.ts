/**
 * Compara recursivamente dois objetos ou valores para determinar se são profundamente iguais.
 *
 * Esta função verifica a igualdade de valores primitivos, objetos, arrays e datas.
 * Para objetos e arrays, a comparação é feita elemento por elemento e propriedade por propriedade.
 *
 * @template T O tipo dos objetos a serem comparados.
 * @param {T} obj1 O primeiro objeto ou valor para comparação.
 * @param {T} obj2 O segundo objeto ou valor para comparação.
 * @param {boolean} [ignoreConstructor=true] Se `true`, a propriedade `constructor` será ignorada durante a comparação de objetos.
 * @returns {boolean} Retorna `true` se os objetos forem profundamente iguais, caso contrário, `false`.
 *
 * @example
 * ```ts
 * const objA = {
 *   a: 1,
 *   b: {
 *     c: [10, 20],
 *     d: new Date('2023-01-01')
 *   }
 * };
 *
 * const objB = {
 *   a: 1,
 *   b: {
 *     c: [10, 20],
 *     d: new Date('2023-01-01')
 *   }
 * };
 *
 * const objC = { a: 1, b: { c: [10, 99] } }; // Valor diferente no array aninhado
 *
 * console.log(deepEqual(objA, objB)); // => true
 * console.log(deepEqual(objA, objC)); // => false
 * ```
 */
export const deepEqual = <T>(obj1: T, obj2: T, ignoreConstructor = true): boolean => {
	// Caso base: comparação de primitivos ou referências iguais
	if (obj1 === obj2) return true;

	// Se um dos objetos for null/undefined (e o outro não)
	if (obj1 == null || obj2 == null) return false;

	// Verifica tipos diferentes
	if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

	// Compara Dates (via timestamp)
	if (obj1 instanceof Date && obj2 instanceof Date) {
		return obj1.getTime() === obj2.getTime();
	}

	// Compara arrays
	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		if (obj1.length !== obj2.length) return false;
		return obj1.every((item, index) => deepEqual(item, obj2[index], ignoreConstructor));
	}

	// Compara objetos genéricos
	const keys1 = Object.keys(obj1).filter((key) => !ignoreConstructor || key !== "constructor");
	const keys2 = Object.keys(obj2).filter((key) => !ignoreConstructor || key !== "constructor");

	// Verifica quantidade de chaves
	if (keys1.length !== keys2.length) return false;

	// Verifica cada chave recursivamente
	return keys1.every((key) => {
		return keys2.includes(key) && deepEqual((obj1 as any)[key], (obj2 as any)[key], ignoreConstructor);
	});
};
