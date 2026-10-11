import { useCallback, useEffect, useState } from "react";
import { EventEmitter } from "@ismael1361/utils";
import { useId } from "../useId";

const event = new EventEmitter<{
	set: [id: string, key: string, value: any];
}>();

const cache = new Map<string, string>();

/**
 * Um hook customizado do React que persiste o estado no `localStorage` do navegador.
 * Ele se comporta como o `useState`, mas o valor é automaticamente salvo no `localStorage`
 * sempre que muda e é recuperado na montagem do componente.
 *
 * @template T O tipo do valor a ser armazenado.
 * @param {string} key A chave sob a qual o valor é armazenado no `localStorage`.
 * @param {T} initialValue O valor inicial a ser usado se nenhum valor for encontrado no `localStorage`.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} Uma tupla contendo o valor armazenado e uma função para atualizá-lo, espelhando a API do `useState`.
 *
 * @example
 * ```jsx
 * import { useLocalStorage } from "@ismael1361/react-use";
 *
 * function UserSettings() {
 *   const [name, setName] = useLocalStorage('userName', 'Visitante');
 *
 *   return (
 *     <div>
 *       <h1>Olá, {name}!</h1>
 *       <input
 *         type="text"
 *         placeholder="Digite seu nome"
 *         value={name}
 *         onChange={(e) => setName(e.target.value)}
 *       />
 *       <p>Este nome será lembrado na próxima vez que você visitar.</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useLocalStorage = <T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const id = useId();

	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			const item = cache.get(key);
			return item ? JSON.parse(item) : initialValue;
		}
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

			try {
				window.localStorage.setItem(key, JSON.stringify(valueToStore));
			} catch (error) {
				cache.set(key, JSON.stringify(valueToStore));
			}

			setStoredValue(valueToStore);
			event.emit("set", id, key, storedValue);
		},
		[id, key],
	);

	return [storedValue, setValue];
};
