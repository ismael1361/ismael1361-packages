import type { SharedValuesState } from "../SharedValue";
import type { EventHandler } from "@ismael1361/utils";

export type EasingFunction = (t: number) => number;

export interface InputGeneratorProps {
	deltaTime: number;
	onClear: (callback: () => void) => void;
}

export type InputGenerator<T = void> = Generator<undefined, T, InputGeneratorProps>;
export type Input = (() => InputGenerator) | InputGenerator;
export type Inputs = Input[];

export type LoopCallback = (i: number) => InputGenerator;

export interface TimingConfig {
	from?: number;
	to: number;
	easing?: EasingFunction;
	delay?: number;
	duration?: number;
}

export type TimingCallback = (i: number) => void | boolean;

export type AnimationState = Record<string, number>;

export type AnimationFn<S> = (state: SharedValuesState<S>) => InputGenerator;

export interface AnimationProps<S> {
	/**
	 * Um objeto contendo os `SharedValue`s reativos do estado da animação.
	 * Você pode usar isso para ler o estado atual da sua animação de fora do gerador.
	 * @example
	 * ```ts
	 * const myAnimation = create(..., { progress: 0 });
	 * // Em um loop de renderização ou efeito:
	 * console.log(myAnimation.state.progress.value);
	 * ```
	 */
	state: SharedValuesState<S>;
	/**
	 * Registra um ouvinte que é acionado sempre que qualquer valor no estado da animação é alterado.
	 * Isso é útil para sincronizar o estado da animação com a UI ou outra lógica externa,
	 * sem a necessidade de usar um hook React para re-renderizar o componente.
	 *
	 * @param callback A função a ser executada a cada mudança. Ela recebe o objeto de estado atual (contendo os `SharedValue`s) como argumento.
	 * @returns {EventHandler} Um objeto manipulador com um método `stop()` para remover o ouvinte e evitar vazamentos de memória.
	 * @example
	 * ```ts
	 * const myAnimation = create(function* (state) {
	 *   yield* timing(state.x, { to: 100, duration: 1000 });
	 * });
	 *
	 * const element = document.getElementById('my-element');
	 *
	 * const eventHandler = myAnimation.onChange((state) => {
	 *   // Este código será executado a cada frame da animação 'timing'.
	 *   element.style.transform = `translateX(${state.x.value}px)`;
	 * });
	 *
	 * myAnimation.start();
	 *
	 * // Para parar de ouvir as mudanças (importante para limpeza):
	 * // eventHandler.stop();
	 * ```
	 */
	onChange: (callback: (state: SharedValuesState<S>) => void) => EventHandler;
	/**
	 * Inicia a animação do começo. Se já estiver em execução, ela será reiniciada.
	 * @example myAnimation.start();
	 */
	start(): void;
	/**
	 * Limpa quaisquer recursos ou listeners criados pela animação (ex: via `onClear`).
	 * @example myAnimation.clear();
	 */
	clear(state?: S): void;
	/**
	 * Pausa a animação em seu estado atual.
	 * @example myAnimation.pause();
	 */
	pause(): void;
	/**
	 * Retoma uma animação que foi pausada.
	 * @example myAnimation.resume();
	 */
	resume(): void;
	/**
	 * Um atalho para `resume()`. Retoma uma animação pausada.
	 * @see {@link resume}
	 * @example myAnimation.play();
	 */
	play(): void;
	/**
	 * Para a animação completamente, limpa seus recursos e redefine seu estado.
	 * @example myAnimation.stop();
	 */
	stop(state?: S): void;
	/**
	 * Um atalho para `stop()` seguido de `start()`. Reinicia a animação.
	 * @see {@link stop}
	 * @see {@link start}
	 * @example myAnimation.restart();
	 */
	restart(state?: S): void;
	/**
	 * Para completamente a animação e libera todos os recursos associados, incluindo
	 * todos os ouvintes de eventos internos (`onChange`, etc.).
	 *
	 * Este método é a etapa final de limpeza e deve ser chamado quando a instância da animação
	 * não for mais necessária, para evitar vazamentos de memória. Após chamar `destroy()`,
	 * a instância da animação não deve ser mais utilizada.
	 *
	 * @see {@link stop}
	 * @example
	 * ```ts
	 * const myAnimation = create(...);
	 * myAnimation.start();
	 *
	 * // Quando o componente que usa a animação é desmontado:
	 * myAnimation.destroy();
	 * ```
	 */
	destroy(): void;
}
