import { useEffect, useMemo, useRef } from "react";

/**
 * Um hook do React que cria uma referência de função estável (memoizada) para um callback
 * que pode mudar ao longo do tempo.
 *
 * Este hook retorna uma função com uma identidade estável que não muda entre as renderizações.
 * No entanto, ao ser chamada, ela sempre executará a versão mais recente da função de `callback`
 * que foi passada para o hook.
 *
 * É útil para otimizações de performance, especialmente ao passar callbacks para componentes
 * filhos memoizados (`React.memo`) ou para hooks como `useEffect`, `useCallback`, e `useMemo`,
 * evitando re-renderizações ou re-execuções desnecessárias quando apenas a implementação do
 * callback muda.
 *
 * @template T O tipo da função de callback.
 * @param {T | undefined} callback A função de callback que pode mudar a cada renderização.
 * @returns {T} Uma versão memoizada e estável do callback que sempre invoca a versão mais recente.
 *
 * @example
 * ```tsx
 * import React, { useState, useCallback } from 'react';
 * import { useCallbackRef } from '@ismael1361/react-use';
 *
 * // Componente filho memoizado que só re-renderiza se suas props mudarem.
 * const MemoizedButton = React.memo(({ onClick }) => {
 *   console.log('Filho re-renderizou');
 *   return <button onClick={onClick}>Clique em mim</button>;
 * });
 *
 * const ParentComponent = () => {
 *   const [count, setCount] = useState(0);
 *
 *   // Este callback é recriado a cada renderização do ParentComponent.
 *   const handleClick = () => {
 *     console.log(`O contador atual é: ${count}`);
 *   };
 *
 *   // Usamos useCallbackRef para criar uma referência estável para o handleClick.
 *   const stableHandleClick = useCallbackRef(handleClick);
 *
 *   return (
 *     <div>
 *       <p>Contador: {count}</p>
 *       <button onClick={() => setCount(c => c + 1)}>Incrementar</button>
 *       <MemoizedButton onClick={stableHandleClick} />
 *     </div>
 *   );
 * };
 * ```
 */
export const useCallbackRef = <T extends (...args: any[]) => any>(callback: T | undefined): T => {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	});

	return useMemo(() => ((...args) => callbackRef.current?.(...args)) as T, []);
};
