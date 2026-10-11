import { EventEmitter } from "@ismael1361/utils";

/**
 * Uma classe que encapsula um valor, permitindo que ele seja "observável" e reativo.
 * Emite eventos quando seu valor é alterado, sendo a base para a reatividade nas animações.
 *
 * @template T O tipo do valor encapsulado.
 * @extends {EventEmitter<{ change: [T]; value: [T]; }>}
 *
 * @example
 * ```ts
 * const opacity = new SharedValue(0);
 *
 * opacity.on('change', (newValue) => {
 *   console.log(`A opacidade mudou para: ${newValue}`);
 * });
 *
 * // Define um novo valor, o que dispara o evento 'change'
 * opacity.value = 0.5; // Logs: "A opacidade mudou para: 0.5"
 *
 * // Acessa o valor atual
 * console.log(opacity.value); // Logs: 0.5
 *
 * // Reseta para o valor inicial
 * opacity.clear(); // Logs: "A opacidade mudou para: 0"
 * console.log(opacity.value); // Logs: 0
 * ```
 */
export class SharedValue<T = unknown> extends EventEmitter<{
	change: [value: T];
	value: [value: T];
	destroy: [];
}> {
	private __initialValue__: T;
	private __value__: T;

	/**
	 * @param {T} value O valor inicial a ser encapsulado.
	 */
	constructor(value: T) {
		super();
		this.__initialValue__ = value;
		this.__value__ = value;
	}

	/**
	 * Obtém o valor atual.
	 * @returns {T} O valor atual.
	 */
	get value(): T {
		return this.__value__;
	}

	/**
	 * Define um novo valor. Se o novo valor for diferente do atual,
	 * emite os eventos 'value' e 'change'.
	 * @param {T} value O novo valor.
	 */
	set value(value: T) {
		// if (String(value) === String(this.__value__)) return;
		this.__value__ = value;
		this.emit("value", value);
		this.emit("change", value);
	}

	/**
	 * Obtém o valor atual.
	 * @returns {T} O valor atual.
	 */
	get current(): T {
		return this.value;
	}

	/**
	 * Define um novo valor. Se o novo valor for diferente do atual,
	 * emite os eventos 'value' e 'change'.
	 * @param {T} value O novo valor.
	 */
	set current(value: T) {
		this.value = value;
	}

	/**
	 * Remove todos os listeners de eventos internos para prevenir vazamentos de memória.
	 */
	destroy() {
		this.emit("destroy");
		this.clearEvents();
		this.clear();
	}

	/**
	 * Reseta o valor para o seu estado inicial.
	 */
	clear(value?: T) {
		if (value !== undefined) {
			this.__initialValue__ = value;
			this.__value__ = value;
		}
		this.value = this.__initialValue__;
	}

	toString() {
		return String(this.current);
	}
}

export type SharedValuesState<T> = { [K in keyof T]: SharedValue<T[K]> };

/**
 * Gerencia um grupo de instâncias de `SharedValue` como um único objeto de estado.
 *
 * Esta classe é um contêiner que pega um objeto de estado inicial e cria um `SharedValue`
 * para cada uma de suas propriedades. Ela observa mudanças em qualquer um dos valores
 * internos e emite eventos agregados, tornando mais fácil reagir a mudanças no estado
 * geral da animação.
 *
 * @template S O tipo (shape) do objeto de estado.
 * @extends {EventEmitter<{
 *   change: [S];
 *   value: [keyof S, S[keyof S]];
 *   destroy: [];
 * }>}
 *
 * @example
 * ```ts
 * const stateManager = new SharedValues({ x: 0, y: 100, opacity: 1 });
 *
 * // Ouve por mudanças em qualquer propriedade.
 * // O evento é otimizado com requestAnimationFrame.
 * stateManager.on('change', (newState) => {
 *   console.log('O estado completo mudou:', newState);
 *   // Exemplo de saída: { x: 50, y: 100, opacity: 1 }
 * });
 *
 * // Ouve por mudanças em uma propriedade específica.
 * stateManager.on('value', (key, value) => {
 *    console.log(`A propriedade '${key}' mudou para ${value}`);
 *    // Exemplo de saída: "A propriedade 'x' mudou para 50"
 * });
 *
 * // Modifica um valor individual, o que dispara os eventos.
 * stateManager.current.x.value = 50;
 *
 * // Obtém um snapshot dos valores atuais.
 * console.log(stateManager.values); // { x: 50, y: 100, opacity: 1 }
 *
 * // Reseta todos os valores para o estado inicial.
 * stateManager.clear();
 * console.log(stateManager.values); // { x: 0, y: 100, opacity: 1 }
 * ```
 */
export class SharedValues<S> extends EventEmitter<{
	change: [values: S];
	value: [key: keyof S, value: S[keyof S]];
	destroy: [];
}> {
	/** Um objeto contendo as instâncias individuais de `SharedValue` para cada propriedade do estado. */
	private readonly __current__: SharedValuesState<S>;

	constructor(values: S) {
		super();
		this.__current__ = {} as any;

		for (const key in values) {
			this.__current__[key] = new SharedValue(values[key]);
		}

		this.ready(() => {
			const events: Function[] = [];

			for (const key in values) {
				events.push(
					this.__current__[key].on("value", () => {
						this.emit("value", key, this.__current__[key].value);
						this.emit("change", this.values);
					}).stop,
				);
			}

			this.once("destroy", () => {
				for (const stop of events) {
					stop();
				}
				this.prepare(false);
			});
		});

		this.initialize();
	}

	/**
	 * Retorna um snapshot do estado atual como um objeto JavaScript simples.
	 * @returns {S} O objeto de estado atual.
	 */
	get values(): S {
		const value: any = {};
		for (const key in this.__current__) {
			value[key] = this.__current__[key].value;
		}
		const self = this;
		return new Proxy(value, {
			get(target, key) {
				Reflect.set(target, key, self.__current__[key as keyof S].value);
				return Reflect.get(target, key);
			},
			set(target, key, value: any) {
				self.__current__[key as keyof S].value = value;
				return Reflect.set(target, key, value);
			},
		});
	}

	/**
	 * Obtém o objeto de estado reativo, onde cada propriedade é uma instância de `SharedValue`.
	 * Use isso para acessar e manipular os valores individuais da animação diretamente.
	 *
	 * @returns {SharedValuesState<S>} O objeto de estado com `SharedValue`s.
	 * @example
	 * ```ts
	 * const stateManager = new SharedValues({ x: 0, y: 0 });
	 *
	 * // Acessa o SharedValue para 'x' e define um novo valor.
	 * stateManager.current.x.value = 50;
	 *
	 * // Ouve por mudanças no SharedValue de 'y'.
	 * stateManager.current.y.on('change', (newY) => {
	 *   console.log(`Y mudou para ${newY}`);
	 * });
	 * ```
	 */
	get current(): SharedValuesState<S> {
		return this.__current__;
	}

	/**
	 * (Uso interno) Prepara os listeners de eventos.
	 */
	initialize() {
		this.prepare(true);
	}

	/**
	 * Remove todos os listeners de eventos internos para prevenir vazamentos de memória.
	 */
	destroy() {
		this.emit("destroy");
		this.clearEvents();
		this.clear();
	}

	/** Reseta todos os `SharedValue`s internos para seus valores iniciais. */
	clear(values?: S) {
		for (const key in this.__current__) {
			this.__current__[key].clear(values ? values[key] : undefined);
		}
	}

	toString() {
		const value: any = {};
		for (const key in this.__current__) {
			value[key] = this.__current__[key].value;
		}
		return JSON.stringify(value);
	}
}

/**
 * Função de fábrica para criar e retornar uma nova instância de `SharedValues`.
 *
 * É um atalho conveniente para `new SharedValues(state)`.
 *
 * @template S O tipo (shape) do objeto de estado.
 * @param {S} state O objeto de estado inicial.
 * @returns {SharedValues<S>} Uma nova instância de `SharedValues`.
 *
 * @example
 * ```ts
 * const initialState = {
 *   x: 0,
 *   y: 0,
 * };
 *
 * const position = sharedValues(initialState);
 *
 * position.on('change', (newPosition) => {
 *   console.log('Nova posição:', newPosition);
 *   // => Nova posição: { x: 10, y: 0 }
 * });
 *
 * // Modifica um valor individual
 * position.current.x.value = 10;
 * ```
 */
export const sharedValues = <S>(state: S) => {
	return new SharedValues<S>(state);
};
