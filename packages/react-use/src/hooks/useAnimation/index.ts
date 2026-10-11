import { InputGenerator, create, SharedValues, AnimationState, AnimationProps } from "@ismael1361/animation";
import { useEffect, useMemo, useRef, useState } from "react";
import AnimationScope from "./AnimationScope";
import DOMAnimationHelpers from "./DOMAnimationHelpers";
import { DOMElement } from "./Types";

const ProcessProps = {
	...AnimationScope,

	/**
	 * Cria um conjunto de helpers de animação para um elemento DOM específico.
	 * Isso permite encadear animações diretamente em um elemento ou ref do React.
	 *
	 * @param {E | React.RefObject<E>} element O elemento DOM a ser animado, ou uma ref do React que aponta para ele.
	 * @returns {DOMAnimationHelpers<E>} Um objeto com métodos de animação específicos para o DOM (`opacity`, `width`, `height`, `margin`, etc...).
	 * @example
	 * ```tsx
	 * const myDiv = useRef(null);
	 *
	 * useAnimation(function*() {
	 *   // Anima a opacidade do div de 0 para 1
	 *   yield* this.dom(myDiv).opacity({ from: 0, to: 1, duration: 1000 });
	 *
	 *   // Em paralelo, anima a largura
	 *   yield* this.dom(myDiv).width({ from: 100, to: 200, unit: 'px', duration: 1000 });
	 * });
	 *
	 * return <div ref={myDiv} style={{ width: 100, height: 100, backgroundColor: 'blue' }} />;
	 * ```
	 */
	dom<E extends DOMElement>(element: E | React.RefObject<E>): DOMAnimationHelpers<E> {
		return new DOMAnimationHelpers(element);
	},
} as const;

type AnimationFnProps = typeof ProcessProps;

type AnimationFn<S extends AnimationState> = (this: AnimationFnProps, state: SharedValues<S>["current"]) => InputGenerator;

/**
 * Um hook do React para criar e gerenciar animações complexas de forma declarativa.
 *
 * Este hook integra a biblioteca `@ismael1361/animation` ao ciclo de vida de um componente React,
 * permitindo a criação de animações baseadas em geradores que podem ser controladas facilmente.
 * Ele gerencia o estado da animação, garante que o componente seja re-renderizado quando os valores
 * da animação mudam e lida com a limpeza de recursos.
 *
 * @template S O tipo (shape) do objeto de estado da animação.
 * @param {AnimationFn<S>} animation Uma função geradora que define a lógica da animação.
 *   Dentro desta função, `this` é vinculado a um conjunto de utilitários de animação (como `timing`, `parallel`, `sequence`, etc.)
 *   e o primeiro argumento (`state`) fornece acesso aos `SharedValue`s individuais do estado.
 * @param {S} [state={}] O objeto de estado inicial para a animação. Cada propriedade se tornará um `SharedValue`.
 * @param {React.DependencyList} [deps=[]] Uma lista de dependências. Se qualquer uma dessas dependências mudar,
 *   a animação será recriada. Semelhante ao `useMemo`.
 * @returns {AnimationProps<S>} A instância do controlador de animação. Use seus métodos (`.start()`, `.stop()`, etc.)
 *   para controlar a animação e acesse `.state[key].value` para obter os valores atuais para renderização.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { useAnimation } from '@ismael1361/react-use';
 *
 * const FadingBox = () => {
 *   const animation = useAnimation(
 *     function* (state) {
 *       // Anima a opacidade de 0 a 1 e de volta para 0, em um loop infinito.
 *       yield* this.loop(() =>
 *         this.sequence(500,
 *           () => this.timing(state.opacity, { to: 1, duration: 1000 }),
 *           () => this.timing(state.opacity, { to: 0, duration: 1000 })
 *         )
 *       );
 *     },
 *     { opacity: 0 } // Estado inicial
 *   );
 *
 *   const style = {
 *     width: 100,
 *     height: 100,
 *     backgroundColor: 'tomato',
 *     // Acessa o valor atual da animação para aplicar ao estilo
 *     opacity: animation.state.opacity.value,
 *   };
 *
 *   return <div style={style} />;
 * };
 * ```
 */
export const useAnimation = <S extends AnimationState>(animation: AnimationFn<S>, state: S = {} as S, deps: React.DependencyList = []) => {
	const [render, setRender] = useState({});

	const gen = useMemo(() => {
		return create(animation.bind(ProcessProps) as any, state);
	}, []);

	useEffect(() => {
		const event = gen.onChange(() => {
			setRender({});
		});

		gen.restart(state);
		// setRender({});

		return () => {
			event.stop();
			gen.stop(state);
		};
	}, [gen, ...deps]);

	return useMemo(() => gen, [gen, render]);
};
