const _subscriptions = Symbol("subscriptions");
const _oneTimeEvents = Symbol("oneTimeEvents");

/**
 * Tipo para o callback de uma inscrição de evento.
 */
export type SubscriptionCallback<T extends Array<any> = any[]> = ((...arg: T) => void) & {};

/**
 * Interface para o manipulador de eventos retornado pelo método `on`.
 */
export interface EventHandler {
	/** Interrompe e remove o ouvinte de evento. */
	stop: () => void;
	remove: () => void;
}

function runCallback<T extends Array<any> = any[]>(callback: SubscriptionCallback<T>, ...arg: T) {
	callback(...arg);
}

/**
 * Tipo para os parâmetros dos listeners de eventos.
 */
export type EventsListenersParameters<T extends Record<any, (...arg: any[]) => void> = Record<any, (...arg: any[]) => void>> = {
	[key in keyof T]: Parameters<T[key]>;
} & {};

/**
 * Tipo para os listeners de eventos.
 */
export type EventsListeners<T extends Record<any, any[]> = Record<any, any[]>> = {
	[key in keyof T]: T[key];
} & {};

/**
 * Classe EventEmitter para gerenciar e emitir eventos personalizados.
 */
export class EventEmitter<T extends EventsListeners | EventsListenersParameters = any> {
	private [_subscriptions]: {
		event: keyof T;
		callback: SubscriptionCallback;
		once: boolean;
	}[];

	private [_oneTimeEvents]: Map<keyof T, T[keyof T]>;

	private _ready: boolean = false;

	/**
	 * Cria uma nova instância de EventEmitter.
	 */
	constructor() {
		this[_subscriptions] = [];
		this[_oneTimeEvents] = new Map();

		this.on("internal_ready", () => {
			this._ready = true;
		});
	}

	/**
	 * Aguarda o emissor estar pronto para então executar um callback.
	 * @param {() => R | Promise<R>} [callback] - Função a ser executada quando o emissor estiver pronto.
	 * @returns {Promise<R>} Uma Promise que resolve com o resultado do callback.
	 *
	 * @example
	 * const emitter = new EventEmitter();
	 *
	 * emitter.ready(() => {
	 *     console.log("O emissor está pronto!");
	 * });
	 *
	 * emitter.prepared = true;
	 * // Saída: O emissor está pronto!
	 */
	async ready<R = never>(callback?: () => R | Promise<R>): Promise<R> {
		if (this._ready) {
			const response = await callback?.();
			return Promise.resolve(response as any);
		}

		return new Promise((resolve) => {
			this.once("internal_ready", (async () => {
				const response = await callback?.();
				resolve(response as any);
			}) as any);
		});
	}

	/**
	 * Verifica se o emissor está preparado.
	 * @returns {boolean} `true` se o emissor estiver pronto, caso contrário `false`.
	 *
	 * @example
	 * const emitter = new EventEmitter();
	 *
	 * emitter.ready(() => {
	 *      console.log("O emissor está pronto!");
	 * });
	 *
	 * console.log(emitter.prepared);
	 * // Saída: false
	 *
	 * emitter.prepared = true;
	 * console.log(emitter.prepared);
	 * // Saída: true
	 */
	get prepared() {
		return this._ready;
	}

	/**
	 * Property to set the emitter as prepared
	 * @param {boolean} value - Define o estado de preparação do emissor.
	 *
	 * @example
	 * const emitter = new EventEmitter();
	 *
	 * emitter.ready(() => {
	 *      console.log("O emissor está pronto!");
	 * });
	 *
	 * emitter.prepared = true;
	 * // Saída: O emissor está pronto!
	 */
	set prepared(value: boolean) {
		if (value === true) {
			(this.emit as any)("internal_ready");
		}
		this._ready = value;
	}

	/**
	 * Define o emissor como preparado.
	 * @param {boolean} [value=true] - O estado de preparação a ser definido.
	 * @returns {void}
	 *
	 * @example
	 * const emitter = new EventEmitter();
	 *
	 * emitter.ready(() => {
	 *      console.log("O emissor está pronto!");
	 * });
	 *
	 * emitter.prepare();
	 * // Saída: O emissor está pronto!
	 */
	prepare(value: boolean = true) {
		this.prepared = value;
	}

	/**
	 * Limpa todos os ouvintes de eventos.
	 * @returns {void}
	 * @example
	 * const emitter = new EventEmitter();
	 * emitter.clearEvents();
	 * // Todos os eventos foram removidos.
	 */
	clearEvents() {
		this[_subscriptions] = [];
		this[_oneTimeEvents].clear();
	}

	/**
	 * Adiciona um ouvinte para um evento específico.
	 * @param {K} event - O nome do evento para o qual se inscrever.
	 * @param {SubscriptionCallback<T[K]>} callback - A função a ser executada quando o evento for emitido.
	 * @returns {EventHandler} Um objeto com um método `remove()` para cancelar a inscrição.
	 * @example
	 * const emitter = new EventEmitter<{
	 *      saudacao: [nome: string];
	 *      despedida: [nome: string];
	 * }>();
	 *
	 * emitter.on("saudacao", (nome) => {
	 *      console.log(`Olá, ${nome}!`);
	 * });
	 *
	 * emitter.emit("saudacao", "Alice");
	 * // Saída: Olá, Alice!
	 */
	on<K extends keyof T>(event: K, callback: SubscriptionCallback<T[K]>): EventHandler {
		if (this[_oneTimeEvents].has(event)) {
			runCallback(callback, ...((this[_oneTimeEvents].get(event) ?? []) as T[K]));
		} else {
			this[_subscriptions].push({ event, callback: callback as any, once: false });
		}
		const self = this;
		return {
			stop() {
				self.off(event, callback as any);
			},
			remove() {
				this.stop();
			},
		};
	}

	/**
	 * Remove um ouvinte de um evento específico.
	 * @param {K} event - O nome do evento.
	 * @param {SubscriptionCallback<T[K]>} [callback] - O callback específico a ser removido. Se omitido, remove todos os ouvintes para o evento.
	 * @returns {EventEmitter<T>} A própria instância do EventEmitter.
	 *
	 * @example
	 * const emitter = new EventEmitter<{
	 *      saudacao: [nome: string];
	 * }>();
	 *
	 * const ouvinte = (nome) => {
	 *      console.log(`Olá, ${nome}!`);
	 * }
	 *
	 * emitter.on("saudacao", ouvinte);
	 * emitter.off("saudacao", ouvinte);
	 *
	 * emitter.emit("saudacao", "Alice");
	 * // Nenhuma saída
	 */
	off<K extends keyof T>(event: K, callback?: SubscriptionCallback<T[K]>): EventEmitter<T> {
		this[_subscriptions] = this[_subscriptions].filter((s) => s.event !== event || (callback && s.callback !== callback));
		return this;
	}

	/**
	 * Adiciona um ouvinte que será executado apenas uma vez e depois removido.
	 * @param {K} event - O nome do evento.
	 * @param {(...args: T[K]) => R} [callback] - A função a ser executada.
	 * @returns {Promise<R>} Uma Promise que resolve com o valor de retorno do callback quando o evento é emitido.
	 * @example
	 * const emitter = new EventEmitter<{
	 *      greet: [name: string];
	 *      farewell: [name: string];
	 * }>();
	 *
	 * emitter.once("greet", (name) => {
	 *      console.log(`Hello, ${name}!`);
	 * });
	 *
	 * emitter.emit("greet", "Alice");
	 * // Saída: Hello, Alice!
	 */
	once<K extends keyof T, R = any>(event: K, callback?: (...args: T[K]) => R): Promise<typeof callback extends undefined ? undefined : R> {
		return new Promise<any>((resolve) => {
			const ourCallback = (...arg: T[K]) => {
				const r = callback?.(...arg);
				resolve(r);
			};
			if (this[_oneTimeEvents].has(event)) {
				runCallback(ourCallback, ...((this[_oneTimeEvents].get(event) ?? []) as T[K]));
			} else {
				this[_subscriptions].push({
					event,
					callback: ourCallback as any,
					once: true,
				});
			}
		});
	}

	/**
	 * Remove um ouvinte de uso único (`once`).
	 * @param {K} event - O nome do evento.
	 * @param {(...args: T[K]) => any} [callback] - O callback específico a ser removido.
	 * @returns {EventEmitter<T>} A própria instância do EventEmitter.
	 *
	 * @example
	 * const emitter = new EventEmitter<{
	 *      greet: [name: string];
	 *      farewell: [name: string];
	 * }>();
	 *
	 * const ouvinte = (nome) => {
	 *      console.log(`Olá, ${nome}!`);
	 * }
	 *
	 * emitter.once("greet", ouvinte);
	 * emitter.offOnce("greet", ouvinte);
	 */
	offOnce<K extends keyof T>(event: K, callback?: (...args: T[K]) => any): EventEmitter<T> {
		this[_subscriptions] = this[_subscriptions].filter((s) => s.event !== event || (callback && s.callback !== callback) || !s.once);
		return this;
	}

	/**
	 * Emite um evento, acionando todos os seus ouvintes.
	 * @param {K} event - O nome do evento a ser emitido.
	 * @param {T[K]} arg - Argumentos para passar aos ouvintes do evento.
	 * @returns {EventEmitter<T>} A própria instância do EventEmitter.
	 * @example
	 * const emitter = new EventEmitter<{
	 *      saudacao: [nome: string];
	 * }>();
	 *
	 * emitter.on("saudacao", (nome) => {
	 *      console.log(`Olá, ${nome}!`);
	 * });
	 *
	 * emitter.emit("saudacao", "Alice");
	 * // Saída: Olá, Alice!
	 */
	emit<K extends keyof T>(event: K, ...arg: T[K]): EventEmitter<T> {
		if (this[_oneTimeEvents].has(event)) {
			throw new Error(`Event "${String(event)}" was supposed to be emitted only once`);
		}
		for (let i = 0; i < this[_subscriptions].length; i++) {
			const s = this[_subscriptions][i];
			if (s.event !== event) {
				continue;
			}
			runCallback(s.callback, ...arg);
			if (s.once) {
				this[_subscriptions].splice(i, 1);
				i--;
			}
		}
		return this;
	}

	/**
	 * Emite um evento que só pode ser disparado uma única vez.
	 * Qualquer ouvinte adicionado posteriormente para este evento será executado imediatamente.
	 * @param {K} event - O nome do evento a ser emitido.
	 * @param {T[K]} arg - Argumentos para passar aos ouvintes.
	 * @returns {EventEmitter<T>} A própria instância do EventEmitter.
	 * @example
	 * const emitter = new EventEmitter<{
	 *      configuracao: [config: object];
	 * }>();
	 *
	 * emitter.emitOnce("configuracao", { tema: "dark" });
	 *
	 * // Este ouvinte será chamado imediatamente porque 'configuracao' já foi emitido.
	 * emitter.on("configuracao", (config) => {
	 *      console.log(`Configuração recebida:`, config);
	 * });
	 * // Saída: Configuração recebida: { tema: 'dark' }
	 */
	emitOnce<K extends keyof T>(event: K, ...arg: T[K]): EventEmitter<T> {
		if (this[_oneTimeEvents].has(event)) {
			throw new Error(`Event "${String(event)}" was supposed to be emitted only once`);
		}
		this.emit(event, ...arg);
		this[_oneTimeEvents].set(event, arg); // Mark event as being emitted once for future subscribers
		this.offOnce(event); // Remove all listeners for this event, they won't fire again
		return this;
	}

	/**
	 * Redireciona eventos de um emissor para outro.
	 * @param {K} event - O evento a ser redirecionado.
	 * @param {EventEmitter<T>} eventEmitter - O emissor de destino.
	 * @returns {EventHandler} Um objeto com um método `remove()` para parar o redirecionamento.
	 * @example
	 * const emitter = new EventEmitter<{
	 *      mensagem: [texto: string];
	 * }>();
	 *
	 * const anotherEmitter = new EventEmitter<{
	 *      mensagem: [texto: string];
	 * }>();
	 *
	 * emitter.pipe("mensagem", anotherEmitter);
	 *
	 * anotherEmitter.on("mensagem", (texto) => {
	 *      console.log(`Outro emissor recebeu: ${texto}`);
	 * });
	 *
	 * emitter.emit("mensagem", "Olá mundo!");
	 * // Saída: Outro emissor recebeu: Olá mundo!
	 */
	pipe<K extends keyof T>(event: K, eventEmitter: EventEmitter<T>) {
		return this.on(event, (...arg: T[K]) => {
			eventEmitter.emit(event, ...arg);
		});
	}

	/**
	 * Redireciona um evento de um emissor para outro, apenas uma vez.
	 * @param {K} event - O evento a ser redirecionado.
	 * @param {EventEmitter<T>} eventEmitter - O emissor de destino.
	 * @returns {Promise<void>} Uma Promise que resolve quando o evento é redirecionado.
	 * @example
	 * const emitter = new EventEmitter<{
	 *      login: [usuario: string];
	 * }>();
	 *
	 * const anotherEmitter = new EventEmitter<{
	 *      login: [usuario: string];
	 * }>();
	 *
	 * emitter.pipeOnce("login", anotherEmitter);
	 *
	 * anotherEmitter.on("login", (usuario) => {
	 *      console.log(`${usuario} logado no outro emissor.`);
	 * });
	 *
	 * emitter.emit("login", "Alice");
	 * // Saída: Alice logado no outro emissor.
	 */
	pipeOnce<K extends keyof T>(event: K, eventEmitter: EventEmitter<T>) {
		return this.once(event, (...arg: T[K]) => {
			eventEmitter.emitOnce(event, ...arg);
		});
	}
}
