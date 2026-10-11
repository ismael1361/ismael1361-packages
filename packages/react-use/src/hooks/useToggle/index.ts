import { useState, useCallback } from "react";

/**
 * Um hook customizado do React para gerenciar um estado booleano (toggle).
 *
 * Fornece o estado atual e funções para alternar o estado (`toggle`),
 * defini-lo explicitamente como `true` (`setTrue`) ou `false` (`setFalse`).
 *
 * @param {boolean} [initialState=false] O estado booleano inicial. O padrão é `false`.
 * @returns {[boolean, () => void, () => void, () => void]} Uma tupla contendo:
 * - `state`: O valor booleano atual.
 * - `toggle`: Uma função para inverter o estado atual (de `true` para `false` e vice-versa).
 * - `setTrue`: Uma função para definir o estado como `true`.
 * - `setFalse`: Uma função para definir o estado como `false`.
 *
 * @example
 * ```jsx
 * import { useToggle } from "@ismael1361/react-use";
 *
 * function ToggleComponent() {
 *   const [isVisible, toggleVisibility, show, hide] = useToggle(false);
 *
 *   return (
 *     <div>
 *       <button onClick={toggleVisibility}>{isVisible ? 'Esconder' : 'Mostrar'}</button>
 *       <button onClick={show}>Forçar Mostrar</button>
 *       <button onClick={hide}>Forçar Esconder</button>
 *       {isVisible && <p>Agora você me vê!</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useToggle(initialState = false): [state: boolean, toggle: () => void, setTrue: () => void, setFalse: () => void] {
	const [state, setState] = useState(initialState);

	const toggle = useCallback(() => setState((prevState) => !prevState), []);
	const setTrue = useCallback(() => setState(true), []);
	const setFalse = useCallback(() => setState(false), []);

	return [state, toggle, setTrue, setFalse];
}
