import { useCallback, useEffect, useRef } from "react";
import { useCallbackRef } from "../useCallbackRef";

/**
 * Cria uma versão "debounced" de um callback que atrasa sua execução até que um
 * determinado tempo (`delay`) tenha passado sem que a função seja chamada novamente.
 *
 * Este hook é útil para otimizar o desempenho em cenários onde uma função é
 * chamada com muita frequência, como em eventos de `onChange` de inputs,
 * redimensionamento de janela ou rolagem de página. Ele garante que a lógica
 * custosa (ex: uma chamada de API) só seja executada quando o usuário "pausa".
 *
 * Utiliza `useCallbackRef` internamente para garantir que a versão mais recente do
 * `callback` seja sempre usada, sem quebrar a memoização da função retornada.
 *
 * @template T O tipo da função de callback.
 * @param {T} callback A função a ser "debounced".
 * @param {number} delay O tempo de espera em milissegundos antes de executar o callback.
 * @returns {T} Uma nova função "debounced" que pode ser chamada no lugar da original.
 *
 * @example
 * ```tsx
 * import React, { useState } from 'react';
 * import { useDebouncedCallback } from '@ismael1361/react-use';
 *
 * const SearchComponent = () => {
 *   const [inputValue, setInputValue] = useState('');
 *   const [searchTerm, setSearchTerm] = useState('');
 *
 *   // A função debounced só será chamada 500ms após o usuário parar de digitar.
 *   const debouncedSetSearchTerm = useDebouncedCallback((value) => {
 *     console.log(`Buscando por: ${value}`);
 *     setSearchTerm(value);
 *   }, 500);
 *
 *   const handleChange = (e) => {
 *     const value = e.target.value;
 *     setInputValue(value);
 *     debouncedSetSearchTerm(value);
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         value={inputValue}
 *         onChange={handleChange}
 *         placeholder="Digite para buscar..."
 *       />
 *       <p>Termo de busca atual: {searchTerm}</p>
 *     </div>
 *   );
 * };
 * ```
 */
export const useDebouncedCallback = <T extends (...args: any[]) => void>(callback: T, delay: number): T => {
	const handleCallback = useCallbackRef(callback);
	const debounceTimerRef = useRef(0);
	useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);

	return useCallback(
		(...args: any[]): void => {
			window.clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = window.setTimeout(() => handleCallback(...args), delay);
		},
		[handleCallback, delay],
	) as T;
};
