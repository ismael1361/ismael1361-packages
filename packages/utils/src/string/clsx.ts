type clsxType = undefined | null | boolean;

/**
 * Uma função utilitária para construir strings de `className` de forma condicional.
 *
 * Inspirada na popular biblioteca `clsx`, esta função permite juntar nomes de classes
 * de maneira flexível, aceitando strings, objetos com condições booleanas e valores
 * falsy que são ignorados.
 *
 * @param {...(string | clsxType | Record<string, clsxType>)} classes Uma lista de argumentos a serem processados.
 *   - **string**: Será incluída na string final.
 *   - **null | undefined | boolean**: Serão ignorados.
 *   - **Objeto**: As chaves do objeto serão incluídas se seus valores forem "truthy".
 * @returns {string} Uma única string contendo todos os nomes de classe válidos, separados por espaços.
 *
 * @example
 * ```ts
 * const isActive = true;
 * const hasError = false;
 *
 * const classNames = clsx(
 *   'button', // Sempre inclui a classe 'button'
 *   'p-4',
 *   isActive && 'button-active', // Inclui 'button-active' se isActive for true
 *   null, // Ignorado
 *   {
 *     'button-primary': isActive, // Inclui 'button-primary' porque isActive é true
 *     'button-error': hasError,   // Não inclui 'button-error' porque hasError é false
 *   },
 *   undefined // Ignorado
 * );
 *
 * console.log(classNames);
 * // => "button p-4 button-active button-primary"
 * ```
 */
export const clsx = (...classes: Array<string | clsxType | Record<string, clsxType>>): string => {
	return classes
		.filter((c): c is string | Record<string, clsxType> => typeof c === "string" || (typeof c === "object" && c !== null))
		.map((c) => {
			if (typeof c === "string") return c;
			return Object.keys(c as Record<string, clsxType>)
				.filter((key) => Boolean(c?.[key]))
				.join(" ");
		})
		.join(" ")
		.trim();
};
