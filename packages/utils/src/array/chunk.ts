/**
 * Cria um array de elementos divididos em grupos com o tamanho (`size`) especificado.
 * Se o array não puder ser dividido igualmente, o último grupo conterá os elementos restantes.
 *
 * @template T O tipo dos elementos no array.
 * @param {T[]} array O array a ser processado.
 * @param {number} size O tamanho de cada grupo. Deve ser um número maior que 0.
 * @returns {T[][]} Retorna um novo array contendo os grupos (chunks).
 * @throws {Error} Lança um erro se o `size` for menor ou igual a 0.
 * @example
 * const letters = ['a', 'b', 'c', 'd', 'e'];
 *
 * const chunks = chunk(letters, 2);
 * console.log(chunks);
 * // Saída: [['a', 'b'], ['c', 'd'], ['e']]
 */
export function chunk<T>(array: T[], size: number): T[][] {
	if (size <= 0) {
		throw new Error("Size must be greater than 0");
	}

	const result: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}
	return result;
}
