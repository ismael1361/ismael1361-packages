import { useEffect, useRef, MutableRefObject } from "react";
import { useCallbackRef } from "../useCallbackRef";
import { useRefObserver } from "../useRefObserver";

type Elements = Window | Document | HTMLElement;

type EventListenerNames<T extends Elements> = T extends Window ? keyof WindowEventMap : T extends Document ? keyof DocumentEventMap : T extends HTMLElement ? keyof HTMLElementEventMap : never;

type EventListener<T extends Elements, K extends EventListenerNames<T>> = T extends Window
	? K extends keyof WindowEventMap
		? (this: Window, ev: WindowEventMap[K]) => any
		: never
	: T extends Document
		? K extends keyof DocumentEventMap
			? (this: Document, ev: DocumentEventMap[K]) => any
			: never
		: T extends HTMLElement
			? K extends keyof HTMLElementEventMap
				? (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
				: never
			: never;

/**
 * Anexa um ouvinte de eventos a um elemento do DOM, `document` ou `window` de forma declarativa e segura em componentes React.
 *
 * Este hook garante que o ouvinte de eventos seja sempre a versão mais recente da função de callback, sem a necessidade
 * de remover e readicionar o ouvinte a cada renderização, graças ao uso interno de `useCallbackRef`.
 *
 * @template E - O nome do evento a ser ouvido (ex: 'click', 'scroll').
 * @template T - O tipo do elemento alvo (`Window`, `Document`, `HTMLElement`).
 * @param {E} event - O nome do evento a ser ouvido.
 * @param {EventListener<T, E>} listener - A função de callback a ser executada quando o evento é acionado.
 * @param {MutableRefObject<T>} [element] - Uma ref opcional para o elemento alvo. Se não for fornecida, o ouvinte será anexado ao objeto `window`.
 * @returns {MutableRefObject<T>} Uma ref que pode ser usada para alterar dinamicamente o elemento alvo. Atribuir um novo elemento a `ref.current` moverá o ouvinte de eventos.
 *
 * @example
 * ```tsx
 * import React, { useState, useRef } from 'react';
 * import { useEventListener } from '@ismael1361/react-use';
 *
 * const EventListenerComponent = () => {
 *   const [coords, setCoords] = useState({ x: 0, y: 0 });
 *   const [clickCount, setClickCount] = useState(0);
 *   const divRef = useRef<HTMLDivElement>(null);
 *
 *   // Exemplo 1: Ouvindo o evento 'click' na window.
 *   useEventListener('click', () => {
 *     setClickCount((count) => count + 1);
 *   });
 *
 *   // Exemplo 2: Ouvindo o evento 'mousemove' em uma div específica.
 *   useEventListener(
 *     'mousemove',
 *     (event) => {
 *       setCoords({ x: event.clientX, y: event.clientY });
 *     },
 *     divRef
 *   );
 *
 *   return (
 *     <div>
 *       <p>Cliques na janela: {clickCount}</p>
 *       <div
 *         ref={divRef}
 *         style={{
 *           width: '300px',
 *           height: '200px',
 *           border: '1px solid black',
 *           backgroundColor: '#f0f0f0',
 *           marginTop: '10px',
 *           display: 'flex',
 *           justifyContent: 'center',
 *           alignItems: 'center'
 *         }}
 *       >
 *         <p>Passe o mouse aqui!</p>
 *         <p>Coordenadas: X: {coords.x}, Y: {coords.y}</p>
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 */
export const useEventListener = <E extends EventListenerNames<T>, T extends Elements = Window>(event: E, listener: EventListener<T, E>, element?: MutableRefObject<T>): MutableRefObject<T> => {
	const elementRef = useRef<T>(element?.current ?? (window as any));
	const handleListener = useCallbackRef(listener);

	const updateEvent = useCallbackRef((after: T) => {
		elementRef.current?.removeEventListener(event, handleListener as any);
		after?.addEventListener(event, handleListener as any);
		(elementRef as any).current = after;
	});

	useEffect(() => {
		const targetElement = element?.current ?? (window as any);
		updateEvent(targetElement);
		return () => {
			// Limpeza final quando o componente é desmontado
			targetElement?.removeEventListener(event, handleListener as any);
		};
	}, [element?.current, updateEvent]);

	return useRefObserver<T>(
		elementRef.current,
		(element) => {
			updateEvent(element);
		},
		[updateEvent],
	);
};
