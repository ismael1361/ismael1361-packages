import { AnimationFn, AnimationProps, AnimationState, Input, InputGenerator, Inputs, LoopCallback, TimingConfig, TimingCallback } from "./Types";
import { Easing } from "./Easing";
import { SharedValue, sharedValues } from "../SharedValue";

export const requestAnimation = (callback: FrameRequestCallback): number => {
	try {
		return requestAnimationFrame(callback);
	} catch {}

	return setTimeout(callback, 1);
};

export const cancelAnimation = (id: number): void => {
	try {
		cancelAnimationFrame(id);
	} catch {}

	clearTimeout(id);
};

const materializeGenerator = (input: Input) => {
	"worklet";
	return typeof input === "function" ? input() : input;
};

const defaultTimingConfig: Required<TimingConfig> = {
	from: 0,
	to: 1,
	easing: Easing.linear,
	delay: 0,
	duration: 600,
};

/**
 * Obtém o tempo decorrido (em milissegundos) desde o quadro de animação anterior.
 * Usado dentro de um gerador de animação para controlar o fluxo de tempo.
 *
 * @returns {InputGenerator<number>} Um gerador que produz o tempo delta em milissegundos.
 * @example
 * ```ts
 * // Exemplo de uso dentro de uma animação customizada:
 * function* myCustomAnimation() {
 *   const deltaTime = yield* timeSincePreviousFrame();
 *   console.log(`O último quadro demorou ${deltaTime}ms para renderizar.`);
 * }
 * ```
 */
export function* timeSincePreviousFrame(): InputGenerator<number> {
	"worklet";
	const { deltaTime } = yield;
	return deltaTime;
}

/**
 * Anima propriedade de um `SharedValue<number>` ou executa uma função de retorno de chamada com o valor animado.
 *
 * @param {SharedValue<number> | TimingCallback} value `SharedValue<number>` ou uma função de retorno de chamada que recebe o valor atual e retorna `true` para cancelar a animação.
 * @param {TimingConfig} [config] Configurações da animação como `from`, `to`, `duration`, `easing` e `delay`.
 * @returns {InputGenerator} Um gerador que, quando executado, realiza a animação.
 * @example
 * ```ts
 * // Anima a opacidade de 0 para 1 em 500ms.
 * const opacity = new SharedValue(0);
 *
 * // Usando SharedValue diretamente
 * yield* timing(opacity, { to: 1, duration: 500 });
 *
 * // Usando uma função de retorno de chamada
 * yield* timing((val) => {
 *   console.log(`Current value: ${val}`);
 *   opacity.value = val;
 *   return val > 0.8; // Cancela a animação quando o valor ultrapassar 0.8
 * }, { to: 1, duration: 1000 });
 * ```
 */
export function* timing(value: SharedValue<number> | TimingCallback, config: TimingConfig = defaultTimingConfig): InputGenerator {
	"worklet";
	if (value instanceof SharedValue) {
		config.from = value.value;
	}

	const { from = 0, to, easing, delay, duration } = { ...defaultTimingConfig, ...config };

	yield* wait(delay);
	const start: number = (yield).deltaTime;
	const end = start + duration;
	let cancel: boolean = false;

	for (let current = start; current < end;) {
		const progress = easing((current - start) / duration);
		const val = from + (to - from) * progress;

		if (value instanceof SharedValue) value.value = val;
		if (value instanceof Function) cancel = value(val) || cancel;

		if (!cancel) current += yield* timeSincePreviousFrame();
		if (cancel) break;
	}

	if (value instanceof SharedValue) value.value = to;
	if (value instanceof Function) value(to);
}

/**
 * Pausa a execução da animação por uma determinada duração.
 *
 * @param {number} [duration=1000] A duração da pausa em milissegundos.
 * @returns {InputGenerator} Um gerador que, quando executado, realiza a pausa.
 * @example
 * ```ts
 * console.log("Início da pausa.");
 * yield* wait(1000); // Espera por 1 segundo.
 * console.log("Fim da pausa.");
 * ```
 */
export function* wait(duration = 1000): InputGenerator {
	"worklet";
	const from: number = (yield).deltaTime;
	const to = from + duration;
	for (let current = from; current < to;) {
		current += yield* timeSincePreviousFrame();
	}
}

/**
 * Pausa a execução da animação até que uma condição em um `SharedValue<boolean>` seja atendida.
 *
 * @param {SharedValue<boolean>} value O valor booleano compartilhado a ser observado.
 * @param {boolean} [invert=false] Se `true`, espera até que o valor se torne `false`. Por padrão, espera até que se torne `true`.
 * @returns {InputGenerator} Um gerador que, quando executado, realiza a espera.
 * @example
 * ```ts
 * const isReady = new SharedValue(false);
 * // Em outro lugar do código, isReady.value será definido como true.
 *
 * // Espera até isReady.value se tornar true
 * yield* waitUntil(isReady);
 * console.log("A condição foi atendida!");
 *
 * // Exemplo com 'invert'
 * const isVisible = new SharedValue(true);
 * // Espera até isVisible.value se tornar false
 * yield* waitUntil(isVisible, true);
 * console.log("O elemento não está mais visível.");
 * ```
 */
export function* waitUntil(value: SharedValue<boolean>, invert = false): InputGenerator {
	"worklet";
	while (invert ? value.value : !value.value) {
		yield;
	}
}

/**
 * Cria uma pausa e, opcionalmente, executa outra animação em seguida.
 * É um atalho para combinar `wait` com outra animação.
 *
 * @param {number} [duration=1000] A duração da pausa em milissegundos.
 * @param {Input} [animation] Uma animação (gerador) opcional para executar após o atraso.
 * @returns {InputGenerator} Um gerador que, quando executado, realiza o atraso e a animação subsequente.
 * @see {@link wait}
 * @example
 * ```ts
 * // Apenas espera por 500ms
 * yield* delay(500);
 *
 * // Espera 1 segundo e depois inicia uma animação de opacidade.
 * const opacity = new SharedValue(0);
 * yield* delay(1000, () => timing(opacity, { to: 1 }));
 * ```
 */
export function* delay(duration: number = 1000, animation?: Input): InputGenerator {
	"worklet";
	yield* wait(duration);
	if (animation) yield* materializeGenerator(animation);
}

/**
 * Executa múltiplas animações (geradores) em paralelo.
 * A execução termina quando todas as animações filhas tiverem sido concluídas.
 *
 * @param {...Input} animations Uma sequência de geradores de animação a serem executados.
 * @returns {InputGenerator} Um gerador que, quando executado, gerencia as animações paralelas.
 * @example
 * ```ts
 * const opacity = new SharedValue(0);
 * const scale = new SharedValue(0.5);
 *
 * yield* parallel(
 *   () => timing(opacity, { to: 1, duration: 1000 }),
 *   () => timing(scale, { to: 1, duration: 1000 })
 * );
 * // Ambas as animações de opacidade e escala ocorrerão simultaneamente.
 * ```
 */
export function* parallel(...animations: Inputs): InputGenerator {
	"worklet";
	const iterators = animations.map((input) => materializeGenerator(input));
	let isDone = false;
	let timeSinceFirstFrame = 0;
	while (!isDone) {
		const done = [];
		for (const iterator of iterators) {
			const val = iterator.next({ ...(yield), deltaTime: timeSinceFirstFrame } as any);
			done.push(val.done);
		}
		isDone = done.every((d) => d);
		if (!isDone) {
			timeSinceFirstFrame = (yield).deltaTime;
		}
	}
}

/**
 * Um alias para `parallel`. Executa múltiplas animações em paralelo.
 * A execução termina quando todas as animações filhas tiverem sido concluídas.
 *
 * @param {...Input} animations Uma sequência de geradores de animação a serem executados.
 * @returns {InputGenerator} Um gerador que, quando executado, gerencia as animações paralelas.
 * @see {@link parallel}
 * @example
 * ```ts
 * const opacity = new SharedValue(0);
 * const scale = new SharedValue(0.5);
 *
 * yield* all(
 *   () => timing(opacity, { to: 1, duration: 1000 }),
 *   () => timing(scale, { to: 1, duration: 1000 })
 * );
 * ```
 */
export function* all(...animations: Inputs): InputGenerator {
	"worklet";
	yield* parallel(...animations);
}

/**
 * Executa múltiplas animações (geradores) em paralelo e termina assim que a primeira delas for concluída.
 * As outras animações são interrompidas.
 *
 * @param {...Input} animations Uma sequência de geradores de animação a serem executados.
 * @returns {InputGenerator} Um gerador que, quando executado, gerencia as animações concorrentes.
 * @example
 * ```ts
 * // Espera por um clique do usuário ou por um timeout de 5 segundos, o que ocorrer primeiro.
 * const hasClicked = new SharedValue(false);
 *
 * yield* any(
 *   () => waitUntil(hasClicked),
 *   () => wait(5000)
 * );
 *
 * if (hasClicked.value) {
 *   console.log("O usuário clicou!");
 * } else {
 *   console.log("O tempo esgotou.");
 * }
 * ```
 */
export function* any(...animations: Inputs): InputGenerator {
	"worklet";
	const iterators = animations.map((input) => materializeGenerator(input));
	let isDone = false;
	let timeSinceFirstFrame = 0;
	while (!isDone) {
		for (const iterator of iterators) {
			const val = iterator.next({ ...(yield), deltaTime: timeSinceFirstFrame } as any);
			isDone = val.done || isDone;
			if (isDone) break;
		}
		if (!isDone) {
			timeSinceFirstFrame = (yield).deltaTime;
		}
	}
}

/**
 * Executa múltiplas animações (geradores) em sequência, uma após a outra.
 *
 * @param {...Input} animations Uma sequência de geradores de animação a serem executados.
 * @returns {InputGenerator} Um gerador que, quando executado, gerencia a cadeia de animações.
 * @example
 * ```ts
 * const opacity = new SharedValue(0);
 * const scale = new SharedValue(0.5);
 *
 * // Primeiro, anima a opacidade. Quando terminar, anima a escala.
 * yield* chain(
 *   () => timing(opacity, { to: 1, duration: 500 }),
 *   () => timing(scale, { to: 1, duration: 500 })
 * );
 * ```
 */
export function* chain(...animations: Inputs): InputGenerator {
	"worklet";
	const iterators = animations.map((input) => materializeGenerator(input));
	for (const iterator of iterators) {
		yield* iterator;
	}
}

/**
 * Executa múltiplas animações em paralelo, mas com um atraso escalonado entre o início de cada uma.
 *
 * @param {number} delayMs O atraso em milissegundos entre o início de cada animação.
 * @param {...Input} animations Uma sequência de geradores de animação a serem executados.
 * @returns {InputGenerator} Um gerador que, quando executado, gerencia as animações escalonadas.
 * @example
 * ```ts
 * const opacity1 = new SharedValue(0);
 * const opacity2 = new SharedValue(0);
 *
 * // A segunda animação começará 200ms após o início da primeira.
 * yield* stagger(200,
 *   () => timing(opacity1, { to: 1, duration: 500 }),
 *   () => timing(opacity2, { to: 1, duration: 500 })
 * );
 * ```
 */
export function* stagger(delayMs: number, ...animations: Inputs): InputGenerator {
	"worklet";
	const iterators = animations.map<InputGenerator>((input, index) => {
		return (function* () {
			yield* wait(delayMs * index);
			yield* materializeGenerator(input);
		})();
	});

	yield* parallel(...iterators);
}

/**
 * Executa múltiplas animações em sequência, com um atraso definido entre o fim de uma e o início da próxima.
 *
 * @param {number} delayMs O atraso em milissegundos entre cada animação na sequência.
 * @param {...Input} animations Uma sequência de geradores de animação a serem executados.
 * @returns {InputGenerator} Um gerador que, quando executado, gerencia a sequência de animações.
 * @see {@link chain}
 * @example
 * ```ts
 * const value = new SharedValue(0);
 *
 * // Anima para 1, espera 200ms, depois anima de volta para 0.
 * yield* sequence(200,
 *   () => timing(value, { to: 1, duration: 500 }),
 *   () => timing(value, { to: 0, duration: 500 })
 * );
 * ```
 */
export function* sequence(delayMs: number, ...animations: Inputs): InputGenerator {
	"worklet";
	const iterators = animations.map((input) => materializeGenerator(input));
	for (let i = 0; i < iterators.length; i++) {
		yield* iterators[i];
		if (i < iterators.length - 1) yield* wait(delayMs);
	}
}

/**
 * Executa uma animação (gerador) repetidamente.
 *
 * @overload
 * @param {LoopCallback} factory Uma função que retorna o gerador da animação para um loop infinito.
 * @returns {InputGenerator}
 *
 * @overload
 * @param {number} iterations O número de vezes que a animação deve repetir.
 * @param {LoopCallback} factory Uma função que retorna o gerador da animação a ser executada em cada iteração.
 * @returns {InputGenerator}
 *
 * @example
 * ```ts
 * const rotation = new SharedValue(0);
 *
 * // Gira um elemento 3 vezes
 * yield* loop(3, () => timing(rotation, { to: 360, duration: 1000 }));
 *
 * // Anima a opacidade para cima e para baixo infinitamente
 * const opacity = new SharedValue(0);
 * yield* loop(() => chain(
 *   () => timing(opacity, { to: 1, duration: 500 }),
 *   () => timing(opacity, { to: 0, duration: 500 })
 * ));
 * ```
 */
export function* loop(...args: [factory: LoopCallback] | [iterations: number, factory: LoopCallback]): InputGenerator {
	"worklet";
	const [iterations, factory] = args.length === 1 ? [Infinity, args[0]] : args;
	for (let i = 0; i < iterations; i++) {
		yield* factory(i);
	}
}

/**
 * Cria e gerencia um loop de animação baseado em um gerador, fornecendo controles como play, pause e stop.
 *
 * Esta função é o coração do sistema de animação. Ela recebe a lógica da animação (um gerador)
 * e um estado inicial. O estado é convertido em `SharedValue`s reativos que podem ser manipulados
 * pelas funções de animação (`timing`, `wait`, etc.) dentro do gerador. O objeto retornado permite
 * iniciar, pausar, parar e reiniciar a animação.
 *
 * @template S O tipo do objeto de estado da animação.
 * @param {AnimationFn<S>} animation A função geradora que define a sequência da animação. Ela recebe um objeto contendo os `SharedValue`s do estado.
 * @param {S} [state={}] Um objeto opcional com o estado inicial da animação. Cada propriedade será convertida em um `SharedValue`.
 * @returns {AnimationProps<S>} Um objeto controlador com métodos para gerenciar o ciclo de vida da animação.
 *
 * @example
 * ```ts
 * // 1. Defina o estado inicial que sua animação irá manipular.
 * const initialState = {
 *   progress: 0,
 * };
 *
 * // 2. Crie a animação usando a função `create`.
 * // A função geradora recebe o estado como `SharedValue`s.
 * const { state, start, pause } = create(function* (state) {
 *   console.log("Animação iniciada!");
 *
 *   // Anima o valor 'progress' de 0 para 1 em 1 segundo.
 *   yield* timing(state.progress, { to: 1, duration: 1000 });
 *
 *   yield* wait(500); // Pausa por 500ms.
 *
 *   // Anima de volta para 0.
 *   yield* timing(state.progress, { to: 0, duration: 1000 });
 *
 *   console.log("Animação concluída!");
 * });
 *
 * state.progress.on("change", (value)=>{
 *   console.log(`Progresso: ${value}`);
 * });
 *
 * // 3. Inicie a animação.
 * start();
 *
 * // Você pode controlar a animação a qualquer momento.
 * // setTimeout(() => pause(), 1200);
 * ```
 */
export const create = <S extends AnimationState = {}>(animation: AnimationFn<S>, state: S = {} as S): AnimationProps<S> => {
	let gen: null | InputGenerator = null;
	const values = sharedValues<S>(state);

	let lastTime: number = Date.now();
	let raf: number | null = null;

	let clearFunctions: Array<() => void> = [];

	let isPaused: boolean = false;

	function loop() {
		if (!gen) {
			gen = animation.call(null, values.current);
		}

		const delta = Date.now() - lastTime;
		lastTime = Date.now();

		if (!isPaused) {
			try {
				const res = gen!.next({
					deltaTime: delta,
					onClear(callback) {
						clearFunctions.unshift(callback);
					},
				});

				if (res && (res as IteratorResult<any, any>).done) {
					// animação terminou: limpa para permitir reiniciar
					gen = null;
				}
			} catch (err) {
				console.error("Animation generator threw", err);
				gen = null;
			}

			if (gen) {
				raf = requestAnimation(loop);
			} else {
				isPaused = true;
			}
		}
	}

	function paused(paused: boolean) {
		isPaused = paused;
		if (!paused) {
			lastTime = Date.now();
			raf = requestAnimation(loop);
		} else if (raf) {
			cancelAnimation(raf);
		}
	}

	return {
		get state() {
			return values.current;
		},

		onChange(callback) {
			return values.on("change", () => {
				callback(values.current);
			});
		},

		start() {
			if (raf) cancelAnimation(raf);
			gen = null;
			lastTime = Date.now();

			values.clear();
			gen = null;
			lastTime = Date.now();

			raf = requestAnimation(loop);
		},

		clear(state) {
			values.clear(state);
			clearFunctions.forEach((f) => f());
			clearFunctions = [];
		},

		pause() {
			paused(true);
		},

		resume() {
			paused(false);
		},

		play() {
			this.resume();
		},

		stop(state) {
			this.clear(state);
			gen = null;
			lastTime = Date.now();
			this.pause();
		},

		restart(state) {
			this.stop(state);
			this.resume();
		},

		destroy() {
			this.stop();
			this.clear();
			values.destroy();
		},
	};
};

export default create;
