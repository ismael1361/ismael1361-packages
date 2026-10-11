import React, { DependencyList, useEffect, useRef } from "react";

type EffectCallback = (matches: boolean) => ReturnType<React.EffectCallback>;

/**
 * Executa um efeito colateral em resposta a uma media query do CSS, de forma reativa.
 * O hook observa a media query e executa o callback `effect` sempre que o estado de correspondência (match) muda,
 * além de na montagem inicial do componente.
 *
 * É útil para aplicar lógica ou efeitos secundários que dependem do tamanho da tela, orientação ou outras
 * características do dispositivo, sem precisar gerenciar o estado em um `useState`.
 *
 * @param {string} query - A string da media query a ser observada (ex: `'(max-width: 768px)'`).
 * @param {EffectCallback} effect - A função de callback a ser executada. Recebe um booleano `matches` que é `true` se a query corresponder. Pode retornar uma função de limpeza (destrutor).
 * @param {React.DependencyList} [deps=[]] - Uma lista de dependências para o `useEffect` que gerencia o listener. O efeito será re-registrado se alguma dependência mudar.
 *
 * @example
 * ```tsx
 * import React, { useState } from 'react';
 * import { useMediaQuery } from '@ismael1361/react-use';
 *
 * const MediaQueryEffectComponent = () => {
 *   const [deviceType, setDeviceType] = useState('desktop');
 *
 *   // Efeito para telas de mobile (até 768px)
 *   useMediaQuery('(max-width: 768px)', (matches) => {
 *     const newDeviceType = matches ? 'mobile' : 'desktop';
 *     setDeviceType(newDeviceType);
 *     console.log(`Layout alterado para: ${newDeviceType}`);
 *
 *     // Função de limpeza opcional
 *     return () => console.log(`Limpando efeito para ${newDeviceType}`);
 *   });
 *
 *   return (
 *     <div>
 *       <h1>O dispositivo atual é: {deviceType}</h1>
 *       <p>Redimensione a janela para ver o efeito no console.</p>
 *     </div>
 *   );
 * };
 * ```
 */
export const useMediaQuery = (query: string, effect: EffectCallback, deps: DependencyList = []) => {
	const destructorRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		const mediaQuery = window.matchMedia(query);
		const handleChange = () => {
			destructorRef.current?.();
			destructorRef.current = effect?.(mediaQuery.matches) || null;
		};

		mediaQuery.addEventListener("change", handleChange);
		handleChange();

		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [query, ...deps]);
};
