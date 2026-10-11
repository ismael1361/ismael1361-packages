/**
 * Cria uma cópia embaralhada de um array usando o algoritmo Fisher-Yates (também conhecido como Knuth shuffle).
 * A função não modifica o array original.
 *
 * @template T O tipo dos elementos no array.
 * @param {T[]} array O array a ser embaralhado.
 * @returns {T[]} Retorna um novo array com os elementos em ordem aleatória.
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * const shuffledNumbers = shuffle(numbers);
 *
 * console.log(shuffledNumbers);
 * // Saída possível: [4, 1, 5, 3, 2]
 *
 * console.log(numbers);
 * // Saída: [1, 2, 3, 4, 5] (o array original permanece intacto)
 */
export function shuffle<T>(array: T[]): T[] {
	const result: T[] = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
