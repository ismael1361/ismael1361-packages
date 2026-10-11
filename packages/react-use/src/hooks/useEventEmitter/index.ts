import { useCallback, useEffect, useRef } from "react";
import { EventEmitter } from "@ismael1361/utils";

const cacheEvents = new EventEmitter();

type Destructor = () => void;

type EventCallback<T extends Array<any>> = (...props: T) => void | Destructor;

/**
 * Cria um sistema de eventos que permite a comunicação entre componentes React de forma desacoplada.
 * Um componente pode 'ouvir' um evento e outro componente pode 'emitir' esse evento, passando dados
 * entre eles sem a necessidade de prop drilling ou context.
 *
 * @template T - Um array que representa os tipos dos argumentos que o evento irá carregar.
 * @param {string} name - O nome único do evento a ser ouvido.
 * @param {EventCallback<T>} [callback] - A função a ser executada quando o evento é emitido. Pode opcionalmente retornar uma função de limpeza (destrutor) que será chamada antes da próxima execução ou quando o componente for desmontado.
 * @param {React.DependencyList} [deps=[]] - Uma lista de dependências para o `useEffect` que gerencia o listener. O listener será re-registrado se alguma dependência mudar.
 * @returns {(...args: T) => void} - Uma função `emit` que, quando chamada, dispara o evento com os argumentos fornecidos para todos os listeners registrados.
 *
 * @example
 * ```tsx
 * import React, { useState } from 'react';
 * import { useEventEmitter } from '@ismael1361/react-use';
 *
 * // Componente que ouve o evento e exibe uma notificação
 * const Notifier = () => {
 *   const [message, setMessage] = useState('');
 *
 *   useEventEmitter<[string]>('show-notification', (newMessage) => {
 *     setMessage(newMessage);
 *
 *     // Retorna um destrutor para limpar a mensagem após 3 segundos
 *     const timer = setTimeout(() => setMessage(''), 3000);
 *     return () => clearTimeout(timer);
 *   });
 *
 *   if (!message) return null;
 *
 *   return (
 *     <div style={{ position: 'fixed', top: 20, right: 20, background: 'lightgreen', padding: '10px' }}>
 *       {message}
 *     </div>
 *   );
 * };
 *
 * // Componente que emite o evento
 * const Trigger = () => {
 *   const emitNotification = useEventEmitter<[string]>('show-notification');
 *
 *   return (
 *     <button onClick={() => emitNotification('Evento disparado com sucesso!')}>
 *       Mostrar Notificação
 *     </button>
 *   );
 * };
 * ```
 */
export const useEventEmitter = <T extends Array<any>>(name: string, callback?: EventCallback<T>, deps: React.DependencyList = []) => {
	const destructor = useRef<Destructor | null>(null);

	useEffect(() => {
		if (!callback) {
			return;
		}

		const event = cacheEvents.on(name, (...args: any[]) => {
			destructor.current?.();
			destructor.current = callback(...(args as any)) ?? null;
		});

		return () => {
			event.stop();
		};
	}, [...deps]);

	const emit = useCallback((...args: T) => {
		cacheEvents.emit(name, ...args);
	}, []);

	return emit;
};
