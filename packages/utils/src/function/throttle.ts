/**
 * Cria uma função "throttled" que invoca `func` no máximo uma vez a cada `limit` milissegundos.
 * A função "throttled" virá com um método `.cancel()` para cancelar as invocações atrasadas e um
 * método `.flush()` para invocá-las imediatamente.
 * É útil para controlar a taxa de execução de eventos que disparam com frequência, como rolagem de página ou movimento do mouse.
 *
 * @template T O tipo da função que será "throttled".
 * @param {T} func A função para aplicar o "throttle".
 * @param {number} limit O intervalo de tempo em milissegundos para aguardar antes de permitir a próxima invocação.
 * @returns {(...args: Parameters<T>) => void} Retorna a nova função "throttled".
 * @example
 * // Limita o número de vezes que a função de rolagem é chamada.
 * const handleScroll = () => {
 *   console.log('Rolagem detectada!');
 * };
 *
 * const throttledScroll = throttle(handleScroll, 1000); // Executa no máximo uma vez por segundo
 *
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
	let inThrottle: boolean = false;

	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
		}
	};
}
