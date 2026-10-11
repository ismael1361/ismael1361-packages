import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deepClone, deepObservable, EventEmitter, uuidv4 } from "@ismael1361/utils";

const events = new EventEmitter<{
	[k: PropertyKey]: [];
}>();

const cache: Map<string, HistoryData> = new Map();

class HistoryData<T = any> {
	historical: T[];
	currentContext: T;
	currentIndex: number;

	constructor(private initialData: T) {
		this.historical = [deepClone(initialData)];
		this.currentContext = this.createContext(initialData);
		this.currentIndex = 0;
	}

	private createContext(target: T) {
		const data = deepClone(target);
		return deepObservable(data, () => {
			this.push(data);
		});
	}

	push(data: T) {
		if (JSON.stringify(this.historical[this.currentIndex]) === JSON.stringify(data)) {
			return;
		}
		this.historical = this.historical.slice(0, this.currentIndex + 1);
		this.historical.push(deepClone(data));
		this.currentContext = this.createContext(data);
		this.currentIndex++;
	}

	undo() {
		if (this.currentIndex > 0) {
			this.currentIndex--;
			this.currentContext = this.createContext(this.historical[this.currentIndex]);
		}
	}

	redo() {
		if (this.currentIndex < this.historical.length - 1) {
			this.currentIndex++;
			this.currentContext = this.createContext(this.historical[this.currentIndex]);
		}
	}

	get data(): T {
		return this.currentContext;
	}

	set data(data: T) {
		this.push(data);
	}

	get canUndo() {
		return this.currentIndex > 0;
	}

	get canRedo() {
		return this.currentIndex < this.historical.length - 1;
	}

	get length() {
		return this.historical.length;
	}

	clear(initialData?: T) {
		this.historical = [initialData ?? this.initialData];
		this.currentIndex = 0;
	}
}

interface DataProps<T> {
	data: T;
	onChange(callback: (data: T) => void): void;
	undo(): void;
	redo(): void;
	canUndo: boolean;
	canRedo: boolean;
	clear(): void;
}

/**
 * Um hook React para gerenciamento de estado com histórico (undo/redo) e compartilhamento de contexto.
 * Ele retorna um objeto de dados reativo que pode ser mutado diretamente, com as alterações sendo
 * salvas automaticamente no histórico.
 *
 * @template T O tipo do objeto de estado.
 * @param {T} initialData O objeto de estado inicial.
 * @param {string} [context=uuidv4()] Uma chave de string opcional para o contexto. Componentes que usam a mesma chave de contexto compartilharão o mesmo estado e histórico. Se não for fornecido, um ID único é gerado, isolando o estado.
 * @returns {DataProps<T>} Um objeto contendo o estado reativo e as funções de controle de histórico.
 *
 * @example
 * ```jsx
 * import { useData } from '@ismael1361/react-use'; // Ajuste o caminho do import
 *
 * const Counter = ({ contextId }) => {
 *   // Se contextId for fornecido, o estado será compartilhado.
 *   const { data, undo, redo, canUndo, canRedo } = useData({ count: 0 }, contextId);
 *
 *   return (
 *     <div>
 *       <p>Contador: {data.count}</p>
 *       <button onClick={() => data.count++}>Incrementar</button>
 *       <button onClick={undo} disabled={!canUndo}>Desfazer</button>
 *       <button onClick={redo} disabled={!canRedo}>Refazer</button>
 *     </div>
 *   );
 * };
 *
 * const App = () => {
 *   const sharedContext = "my-shared-counter";
 *
 *   return (
 *     <div>
 *       <h1>Contador Compartilhado</h1>
 *       <p>Ambos os contadores abaixo compartilham o mesmo estado.</p>
 *       <Counter contextId={sharedContext} />
 *       <Counter contextId={sharedContext} />
 *     </div>
 *   );
 * }
 * ```
 */
export const useData = <T extends object>(initialData: T, context: string = uuidv4()): DataProps<T> => {
	const [contextId] = useState<string>(context);
	const data = useRef<T>(cache.get(contextId)?.data ?? initialData);
	const [id, setId] = useState<string>(uuidv4());

	useEffect(() => {
		if (cache.has(contextId)) {
			data.current = cache.get(contextId)?.data ?? data.current;
			setId(uuidv4());
		} else {
			cache.set(contextId, new HistoryData(data.current));
		}

		const e = events.on(contextId, () => {
			data.current = cache.get(contextId)?.data ?? data.current;
			setId(uuidv4());
		});

		return () => {
			e.stop();
		};
	}, []);

	const onChange = useCallback((callback: (data: T) => void) => {
		return events.on(contextId, () => {
			callback(cache.get(contextId)?.data ?? data);
		});
	}, []);

	const undo = useCallback(() => {
		cache.get(contextId)?.undo();
		data.current = cache.get(contextId)?.data ?? data.current;
		events.emit(contextId);
	}, []);

	const redo = useCallback(() => {
		cache.get(contextId)?.redo();
		data.current = cache.get(contextId)?.data ?? data.current;
		events.emit(contextId);
	}, []);

	const clear = useCallback(() => {
		cache.get(contextId)?.clear();
		data.current = cache.get(contextId)?.data ?? data.current;
		events.emit(contextId);
	}, []);

	return useMemo(() => {
		return {
			get data() {
				return (cache.get(contextId)?.data ?? data.current) as T;
			},
			onChange,
			undo,
			redo,
			get canUndo() {
				return cache.get(contextId)?.canUndo ?? false;
			},
			get canRedo() {
				return cache.get(contextId)?.canRedo ?? false;
			},
			clear,
		};
	}, [id]);
};
