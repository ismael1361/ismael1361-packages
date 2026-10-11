import { useEffect, useRef } from "react";

/**
 * Um hook do React para lidar com o evento `beforeunload`, permitindo exibir um
 * prompt de confirmação ao usuário antes que ele saia da página.
 *
 * É ideal para prevenir a perda acidental de dados em formulários, editores de texto
 * ou qualquer aplicação onde o usuário possa ter alterações não salvas.
 *
 * @param handler Uma função que é executada quando o evento `beforeunload` é disparado.
 *   - Para exibir um prompt de confirmação, a função deve retornar uma `string`.
 *     Navegadores modernos podem ignorar o conteúdo da string e exibir uma mensagem genérica por segurança.
 *   - Se a função retornar `undefined` (ou nada), a navegação prosseguirá sem nenhum prompt.
 *   - O hook só é ativado se o `handler` fornecido for uma função.
 *
 * @example
 * ```tsx
 * import React, { useState } from 'react';
 * import { useBeforeunload } from '@ismael1361/react-use';
 *
 * const TextEditor = () => {
 *   const [text, setText] = useState('');
 *   const hasUnsavedChanges = text !== '';
 *
 *   useBeforeunload((event) => {
 *     // A condição é verificada apenas quando o usuário tenta sair.
 *     if (hasUnsavedChanges) {
 *       // Retornar qualquer string ativa o prompt de confirmação do navegador.
 *       return 'Você tem alterações não salvas!';
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       <h3>Editor de Texto</h3>
 *       <textarea
 *         value={text}
 *         onChange={(e) => setText(e.target.value)}
 *         placeholder="Escreva algo e tente sair da página."
 *       />
 *     </div>
 *   );
 * };
 * ```
 */
export const useBeforeunload = (handler: (event: BeforeUnloadEvent) => string | void) => {
	const enabled = typeof handler === "function";

	// Persist handler in ref
	const handlerRef = useRef(handler);
	useEffect(() => {
		handlerRef.current = handler;
	});

	useEffect(() => {
		if (enabled) {
			const listener = (event: BeforeUnloadEvent) => {
				const returnValue = handlerRef.current(event);

				if (typeof returnValue === "string") {
					event.preventDefault();
					return (event.returnValue = returnValue);
				}

				if (event.defaultPrevented) {
					return (event.returnValue = "");
				}
			};

			window.addEventListener("beforeunload", listener);
			return () => {
				window.removeEventListener("beforeunload", listener);
			};
		}
	}, [enabled]);
};
