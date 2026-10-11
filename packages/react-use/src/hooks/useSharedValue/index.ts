import { SharedValue } from "@ismael1361/animation";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Cria e gerencia uma instância de `SharedValue` de forma reativa dentro de um componente React.
 *
 * Este hook encapsula um valor inicial em uma instância de `SharedValue`. Ele se inscreve
 * no evento 'change' do `SharedValue` e força uma nova renderização do componente
 * sempre que o valor é alterado, tornando-o "reativo" no ecossistema React.
 *
 * É ideal para valores que precisam ser compartilhados entre diferentes lógicas (como animações)
 * e a UI do React, garantindo que a interface sempre reflita o estado atual do valor.
 *
 * @template T O tipo do valor encapsulado.
 * @param {T} initialValue O valor inicial a ser encapsulado.
 * @returns {SharedValue<T>} Uma instância reativa de `SharedValue`.
 *   - Para ler o valor, acesse a propriedade `.value`.
 *   - Para modificar o valor (o que acionará uma nova renderização), atribua um novo valor à propriedade `.value`.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { useSharedValue } from '@ismael1361/react-use';
 *
 * const FadingComponent = () => {
 *   // Cria um valor reativo para a opacidade.
 *   const opacity = useSharedValue(1);
 *
 *   const toggleVisibility = () => {
 *     // Modificar o valor. Isso irá disparar o evento 'change'
 *     // e causar uma nova renderização do componente.
 *     opacity.value = opacity.value === 1 ? 0 : 1;
 *   };
 *
 *   return (
 *     <div>
 *       <div style={{ opacity: opacity.value, transition: 'opacity 0.5s' }}>
 *         Olá, Mundo!
 *       </div>
 *       <button onClick={toggleVisibility}>Toggle Visibilidade</button>
 *     </div>
 *   );
 * };
 * ```
 */
export const useSharedValue = <T = unknown>(initialValue: T) => {
	const [render, setRender] = useState({});
	const ref = useRef(new SharedValue<T>(initialValue));

	useEffect(() => {
		const event = ref.current.on("change", () => {
			setRender({});
		});

		return () => event.stop();
	}, []);

	return useMemo(() => ref.current, [render]);
};
