import { useCallback, useEffect, useId, useState } from "react";
import { EventEmitter } from "@ismael1361/utils";

const event = new EventEmitter<{
	set: [id: string, key: PropertyKey, value: any];
}>();

const cache = new Map<PropertyKey, any>();

/**
 * Um hook customizado do React que gerencia um estado em um cache global na memória.
 * Ele se comporta como o `useState`, mas o valor é compartilhado entre todos os componentes
 * que usam o mesmo `key`. O estado não é persistente e será perdido ao recarregar a página.
 *
 * Útil para compartilhar estado entre componentes distantes na árvore de componentes sem
 * recorrer a prop drilling ou contextos complexos, quando a persistência não é necessária.
 *
 * @template T O tipo do valor a ser armazenado no cache.
 * @param {PropertyKey} key A chave única sob a qual o valor é armazenado no cache.
 * @param {T} initialValue O valor inicial a ser usado se nenhum valor for encontrado no cache para a chave fornecida.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} Uma tupla contendo o valor em cache e uma função para atualizá-lo, espelhando a API do `useState`.
 *
 * @example
 * ```jsx
 * import { useCache } from "@ismael1361/react-use";
 *
 * // Componente 1: Exibe e atualiza um contador
 * function CounterDisplay() {
 *   const [count, setCount] = useCache('sharedCounter', 0);
 *
 *   return (
 *     <div>
 *       <p>Contador: {count}</p>
 *       <button onClick={() => setCount(c => c + 1)}>Incrementar</button>
 *     </div>
 *   );
 * }
 *
 * // Componente 2: Apenas exibe o mesmo contador
 * function CounterViewer() {
 *   const [count] = useCache('sharedCounter', 0);
 *   return <p>Valor atual do contador (em outro componente): {count}</p>;
 * }
 * ```
 */
export const useCache = <T>(key: PropertyKey, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const id = useId();

	const [storedValue, setStoredValue] = useState<T>(() => {
		const item = cache.get(key);
		return item ? item : initialValue;
	});

	useEffect(() => {
		const handle = event.on("set", (_id, key, value) => {
			if (key === key && _id !== id) {
				setStoredValue(value);
			}
		});

		return () => {
			handle.stop();
		};
	}, [id, key]);

	const setValue = useCallback(
		(value: T | ((val: T) => T)) => {
			const valueToStore = value instanceof Function ? value(storedValue) : value;
			setStoredValue(valueToStore);
			cache.set(key, valueToStore);
			event.emit("set", id, key, storedValue);
		},
		[id, key],
	);

	return [storedValue, setValue];
};
