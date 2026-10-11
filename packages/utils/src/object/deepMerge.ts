/**
 * Mescla recursivamente as propriedades de dois objetos em um novo objeto.
 * As propriedades do objeto `source` sobrescrevem as do `target` se as chaves forem as mesmas.
 * Objetos aninhados são mesclados recursivamente, e a função não modifica os objetos originais.
 *
 * @template T O tipo do objeto de destino.
 * @template U O tipo do objeto de origem.
 * @param {T} target O objeto de destino.
 * @param {U} source O objeto de origem, cujas propriedades serão mescladas.
 * @returns {T & U} Um novo objeto contendo a combinação das propriedades de `target` e `source`.
 * @example
 * const target = {
 *   a: 1,
 *   b: {
 *     c: 2,
 *     d: 3
 *   }
 * };
 *
 * const source = {
 *   b: {
 *     c: 4, // Sobrescreve a propriedade 'c'
 *     e: 5  // Adiciona a propriedade 'e'
 *   },
 *   f: 6 // Adiciona a propriedade 'f'
 * };
 *
 * const result = deepMerge(target, source);
 * // result é { a: 1, b: { c: 4, d: 3, e: 5 }, f: 6 }
 */
export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
	const result = { ...target } as T & U;

	for (const key in source) {
		if (source.hasOwnProperty(key)) {
			const sourceValue = source[key];
			const targetValue = target[key as unknown as keyof T];

			if (typeof sourceValue === "object" && sourceValue !== null && typeof targetValue === "object" && targetValue !== null) {
				result[key as unknown as keyof T] = deepMerge(targetValue, sourceValue) as any;
			} else {
				result[key as unknown as keyof T] = sourceValue as any;
			}
		}
	}

	return result;
}
