import { useEffect, useRef } from "react";

/**
 * Executa um "effect" após um "debounce" de um determinado tempo. É semelhante ao `useEffect`,
 * mas a função de "effect" só é chamada depois que as dependências (`deps`) param de mudar
 * por um período de tempo especificado (`delay`).
 *
 * Este hook é ideal para cenários onde você precisa executar uma operação (como uma chamada de API)
 * em resposta a mudanças rápidas de estado ou props, mas quer esperar até que o usuário
 * tenha "terminado" de fazer as alterações.
 *
 * @param {React.EffectCallback} effect A função de "effect" a ser executada. Pode retornar uma função de limpeza.
 * @param {number} delay O tempo de espera em milissegundos após a última mudança nas dependências.
 * @param {React.DependencyList} [deps] O array de dependências que aciona o "effect".
 *
 * @example
 * ```tsx
 * import React, { useState } from 'react';
 * import { useDebouncedEffect } from '@ismael1361/react-use';
 *
 * const SearchComponent = () => {
 *   const [inputValue, setInputValue] = useState('');
 *   const [apiQuery, setApiQuery] = useState('');
 *
 *   // O efeito será acionado 500ms depois que o usuário parar de digitar.
 *   useDebouncedEffect(() => {
 *     if (inputValue) {
 *       console.log(`Fazendo chamada de API para: "${inputValue}"`);
 *       setApiQuery(inputValue);
 *     }
 *   }, 500, [inputValue]);
 *
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         value={inputValue}
 *         onChange={(e) => setInputValue(e.target.value)}
 *         placeholder="Digite para buscar..."
 *       />
 *       <p>Buscando por: {apiQuery}</p>
 *     </div>
 *   );
 * };
 * ```
 */
export const useDebouncedEffect = (effect: React.EffectCallback, delay: number, deps: React.DependencyList = []) => {
	const destructor = useRef<(() => void) | null>(null);

	useEffect(() => {
		const timeout = setTimeout(() => {
			destructor.current?.();
			destructor.current = effect() ?? null;
		}, delay);

		return () => {
			clearTimeout(timeout);
			destructor.current?.();
		};
	}, [...deps]);
};
