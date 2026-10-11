/**
 * Cria uma função "debounced" que atrasa a invocação de `func` até que `wait`
 * milissegundos tenham se passado desde a última vez que a função "debounced" foi invocada.
 * É útil para eventos que disparam rapidamente, como redimensionamento de janela, rolagem ou digitação.
 *
 * @template T O tipo da função que será "debounced".
 * @param {T} func A função para aplicar o "debounce".
 * @param {number} wait O número de milissegundos para atrasar a invocação.
 * @returns {(...args: Parameters<T>) => void} Retorna a nova função "debounced".
 * @example
 * // Evita cálculos custosos enquanto a janela está sendo redimensionada.
 * const handleResize = () => {
 *   // Realiza cálculos de layout
 *   console.log('Janela redimensionada');
 * };
 *
 * const debouncedResize = debounce(handleResize, 200);
 *
 * window.addEventListener('resize', debouncedResize);
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;

	return (...args: Parameters<T>) => {
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => {
			func(...args);
		}, wait);
	};
}
