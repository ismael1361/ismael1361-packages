import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { useCallbackRef } from "../useCallbackRef";

type EffectCallback<T> = (value: T) => ReturnType<React.EffectCallback>;

/**
 * Cria um objeto de referência (ref) que executa um efeito colateral sempre que seu valor `.current` é modificado.
 *
 * Este hook é uma combinação de `useRef` e `useEffect`, permitindo reagir a mudanças em um valor
 * sem causar re-renderizações no componente. O efeito também é executado na montagem inicial e
 * sempre que as dependências (`deps`) mudam.
 *
 * @template T - O tipo do valor a ser armazenado na ref.
 * @param {T} initialValue - O valor inicial da ref.
 * @param {EffectCallback<T>} effect - A função de efeito a ser executada. Recebe o valor atual da ref e pode retornar uma função de limpeza (destrutor).
 * @param {React.DependencyList} [deps=[]] - Uma lista de dependências que, quando alterada, re-executará o efeito com o valor atual da ref.
 * @returns {MutableRefObject<T>} Um objeto de ref. A atribuição a sua propriedade `.current` acionará o efeito.
 *
 * @example
 * ```tsx
 * import React, { useState } from 'react';
 * import { useRefObserver } from '@ismael1361/react-use';
 *
 * const LoggerComponent = () => {
 *   const [inputValue, setInputValue] = useState('');
 *
 *   // Cria um observador para o valor do input.
 *   // O efeito será logar o novo valor no console.
 *   const observedValueRef = useRefObserver<string>('', (value) => {
 *     console.log(`O valor observado agora é: "${value}"`);
 *
 *     // Retorna uma função de limpeza que é chamada antes do próximo efeito.
 *     return () => {
 *       console.log(`Limpando efeito para o valor anterior.`);
 *     };
 *   });
 *
 *   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const newValue = e.target.value;
 *     setInputValue(newValue);
 *     // Atribuir a .current aciona o efeito do useRefObserver.
 *     observedValueRef.current = newValue;
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         value={inputValue}
 *         onChange={handleChange}
 *         placeholder="Digite algo para observar..."
 *       />
 *       <p>Verifique o console enquanto digita.</p>
 *     </div>
 *   );
 * };
 * ```
 */
export const useRefObserver = <T>(initialValue: T, effect: EffectCallback<T>, deps: React.DependencyList = []): MutableRefObject<T> => {
	const ref = useRef<T>(initialValue);
	const destructor = useRef<ReturnType<React.EffectCallback> | null>(null);

	const change = useCallbackRef((value: T) => {
		destructor.current?.();
		ref.current = value;
		destructor.current = effect(ref.current) || null;
	});

	useEffect(() => change(ref.current), [...deps]);

	return useMemo(() => {
		return {
			...ref,
			get current() {
				return ref.current;
			},
			set current(value) {
				change(value);
			},
		};
	}, []);
};
