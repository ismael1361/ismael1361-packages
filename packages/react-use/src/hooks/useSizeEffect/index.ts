import React, { useRef, useEffect } from "react";
import { useRefObserver } from "../useRefObserver";
import { useCallbackRef } from "../useCallbackRef";

type SizeEffect<T extends HTMLElement = any> = (size: { width: number; height: number }, element: T) => void;

/**
 * Observa as mudanças de tamanho de um elemento do DOM e executa um callback sempre que suas dimensões mudam.
 * Utiliza a `ResizeObserver` API para uma monitoração de performance.
 *
 * O callback é executado na montagem inicial e sempre que o tamanho do elemento observado é alterado.
 *
 * @template T - O tipo do elemento HTMLElement a ser observado.
 * @param {SizeEffect<T>} callback - A função a ser executada quando o tamanho do elemento muda. Recebe o objeto de tamanho (`{ width, height }`) e o próprio elemento como argumentos.
 * @param {React.DependencyList} [deps=[]] - Uma lista de dependências que, quando alterada, re-executará o callback com as dimensões atuais do elemento.
 * @returns {MutableRefObject<T | null>} Uma ref que deve ser anexada ao elemento do DOM que você deseja observar. Esta ref também pode ser atualizada imperativamente.
 *
 * @example
 * ```tsx
 * import React, { useState } from 'react';
 * import { useSizeEffect } from '@ismael1361/react-use';
 *
 * const ResizableComponent = () => {
 *   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
 *
 *   const elementRef = useSizeEffect<HTMLDivElement>((size) => {
 *     console.log('O tamanho mudou:', size);
 *     setDimensions(size);
 *   });
 *
 *   return (
 *     <div
 *       ref={elementRef}
 *       style={{
 *         border: '2px solid steelblue',
 *         padding: '20px',
 *         resize: 'both', // Permite que o usuário redimensione o div
 *         overflow: 'auto',
 *       }}
 *     >
 *       <p>Redimensione esta caixa!</p>
 *       <p>Largura: {Math.round(dimensions.width)}px</p>
 *       <p>Altura: {Math.round(dimensions.height)}px</p>
 *     </div>
 *   );
 * };
 * ```
 */
export const useSizeEffect = <T extends HTMLElement = any>(callback: SizeEffect<T>, deps: React.DependencyList = []) => {
	const elementRef = useRef<T | null>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	const ref = useCallbackRef((element: T | null) => {
		elementRef.current = element ?? null;

		if (resizeObserverRef.current) {
			resizeObserverRef.current.disconnect();
			resizeObserverRef.current = null;
		}

		if (!element) {
			return;
		}

		const { width, height } = element.getBoundingClientRect();
		callback({ width, height }, element);

		const resizeObserver = (resizeObserverRef.current = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				callback({ width, height }, element);
			}
		}));

		resizeObserver.observe(element);
	});

	useEffect(() => {
		if (!elementRef.current) return;
		const { width, height } = elementRef.current.getBoundingClientRect();
		callback({ width, height }, elementRef.current);
	}, [...deps]);

	useEffect(() => {
		ref(elementRef.current);

		return () => {
			if (resizeObserverRef.current) {
				resizeObserverRef.current.disconnect();
				resizeObserverRef.current = null;
			}
		};
	}, []);

	return useRefObserver<T | null>(
		null,
		(element) => {
			ref(element);
		},
		[ref],
	);
};
