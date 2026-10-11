import { AnimationState, SharedValues } from "@ismael1361/animation";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Cria e gerencia um objeto de valores compartilhados (`SharedValue`) de forma reativa dentro de um componente React.
 *
 * Este hook pega um objeto de estado inicial e cria um `SharedValue` para cada uma de suas propriedades,
 * agrupando-os sob uma instância de `SharedValues`. Ele se inscreve no evento `change` dessa instância
 * e força uma nova renderização do componente sempre que qualquer um dos valores é alterado.
 * Isso torna os valores compartilhados "reativos" no ecossistema React.
 *
 * @template S O tipo (shape) do objeto de estado.
 * @param {S} values O objeto de estado inicial. Cada propriedade será convertida em um `SharedValue`.
 * @returns {{ [K in keyof S]: SharedValue<S[K]> }} Um objeto onde cada chave corresponde a uma instância de `SharedValue`.
 *   - Para ler um valor, acesse `state.key.value`.
 *   - Para modificar um valor (o que acionará uma nova renderização), atribua a `state.key.value`.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { useSharedValues } from '@ismael1361/react-use';
 *
 * const MyComponent = () => {
 *   // Cria um estado reativo para a posição e opacidade.
 *   // O retorno é um objeto com as instâncias de SharedValue.
 *   const styleState = useSharedValues({ x: 0, opacity: 1 });
 *
 *   const handleAnimate = () => {
 *     // Modificar os valores individuais.
 *     // Isso irá disparar o evento 'change' e causar uma nova renderização.
 *     styleState.x.value = 100;
 *     styleState.opacity.value = 0.5;
 *   };
 *
 *   return (
 *     <div>
 *       <div
 *         style={{
 *           // Acessa o valor atual de cada SharedValue para a renderização.
 *           transform: `translateX(${styleState.x.value}px)`,
 *           opacity: styleState.opacity.value,
 *           width: 50,
 *           height: 50,
 *           backgroundColor: 'tomato',
 *           transition: 'transform 0.5s, opacity 0.5s'
 *         }}
 *       />
 *       <button onClick={handleAnimate}>Animate</button>
 *     </div>
 *   );
 * };
 * ```
 */
export const useSharedValues = <S extends AnimationState>(initialValues: S) => {
	const [render, setRender] = useState({});
	const ref = useRef(new SharedValues<S>(initialValues));

	useEffect(() => {
		const event = ref.current.on("change", () => {
			setRender({});
		});

		return () => event.stop();
	}, []);

	return useMemo(() => ref.current.current, [render]);
};
