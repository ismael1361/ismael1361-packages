import React, { useEffect } from "react";
import { EventEmitter } from "@ismael1361/utils";
import { useCallbackRef } from "../useCallbackRef";

interface SubscribeEvent<E extends Record<string | symbol, any[]>> {
	on: <K extends keyof E>(event: K, callback: E[K]) => { stop: () => void };
	off: <K extends keyof E>(event: K, callback?: E[K]) => void;
	once: <K extends keyof E>(event: K, callback: E[K]) => { stop: () => void };
	offOnce: <K extends keyof E>(event: K, callback: E[K]) => void;
	emit: <K extends keyof E>(event: K, ...args: E[K]) => void;
	emitOnce: <K extends keyof E>(event: K, ...args: E[K]) => void;
}

type EmitEvent<P extends Array<any> | never = never> = (...parameters: P) => void;

/**
 * Cria uma instância de um "event bus" tipado e com escopo, permitindo a comunicação desacoplada entre componentes.
 *
 * Esta função é uma fábrica que gera um objeto com métodos para emitir e ouvir eventos (`on`, `emit`, etc.),
 * garantindo segurança de tipos para os nomes dos eventos e seus parâmetros.
 *
 * É uma boa prática criar o event bus em um módulo separado e exportá-lo para ser usado
 * em diferentes partes da sua aplicação.
 *
 * @template E - Um objeto que define o mapa de eventos, onde as chaves são os nomes dos eventos e os valores são as assinaturas das funções de callback.
 * @returns {SubscribeEvent<E>} Uma nova instância do event bus com escopo.
 *
 * @example
 * // 1. Defina e exporte seu event bus em um arquivo compartilhado (ex: src/events.ts)
 *
 * import { createSubscribeEvent } from '@ismael1361/react-use';
 *
 * type AppEvents = {
 *   'show-notification': [message: string, type: 'success' | 'error'];
 *   'user-logout': [];
 * };
 *
 * export const appEvents = createSubscribeEvent<AppEvents>();
 *
 *
 * // 2. Em um componente, ouça um evento usando o hook `useSubscribeEvent`.
 *
 * import React, { useState } from 'react';
 * import { useSubscribeEvent } from '@ismael1361/react-use';
 * import { appEvents } from '../events';
 *
 * const NotificationBar = () => {
 *   const [notification, setNotification] = useState(null);
 *
 *   useSubscribeEvent(appEvents, 'show-notification', (message, type) => {
 *     setNotification({ message, type });
 *     const timer = setTimeout(() => setNotification(null), 3000);
 *     return () => clearTimeout(timer); // Retorna uma função de limpeza
 *   });
 *
 *   if (!notification) return null;
 *
 *   return <div className={`notification ${notification.type}`}>{notification.message}</div>;
 * };
 *
 *
 * // 3. Em outro componente, emita o evento.
 *
 * import React from 'react';
 * import { appEvents } from '../events';
 *
 * const UserProfile = () => {
 *   const handleSave = () => {
 *     // ...lógica para salvar
 *     appEvents.emit('show-notification', 'Perfil salvo com sucesso!', 'success');
 *   };
 *
 *   return <button onClick={handleSave}>Salvar Perfil</button>;
 * };
 */
export const createSubscribeEvent = <E extends Record<string | symbol, any[]>>(): SubscribeEvent<E> => {
	const globalEventEmitter = new EventEmitter();

	const scope: SubscribeEvent<E> = {
		on(event, callback) {
			globalEventEmitter.on(event as any, callback as any);

			return {
				stop() {
					globalEventEmitter.off(event as any, callback as any);
				},
			};
		},
		off(event, callback) {
			globalEventEmitter.off(event as any, callback as any);
		},
		once(event, callback) {
			globalEventEmitter.once(event as any, callback as any);

			return {
				stop() {
					globalEventEmitter.off(event as any, callback as any);
				},
			};
		},
		offOnce(event, callback) {
			globalEventEmitter.offOnce(event as any, callback as any);
		},
		emit(event, ...args) {
			globalEventEmitter.emit(event as any, ...args);
		},
		emitOnce(event, ...args) {
			globalEventEmitter.emitOnce(event as any, ...args);
		},
	};

	return scope;
};

type SubscribeEventCallback<P extends Array<any> | never = never> = (...parameters: P) => ReturnType<React.EffectCallback>;

/**
 * Assina um componente a um evento de um "event bus" e retorna uma função para emitir esse mesmo evento.
 *
 * Este hook gerencia o ciclo de vida da inscrição, garantindo que o callback seja assinado quando o componente
 * é montado e removido quando é desmontado. O callback fornecido é sempre a versão mais recente,
 * evitando problemas com closures obsoletas.
 *
 * @template E - O mapa de eventos do event bus, criado com `createSubscribeEvent`.
 * @template K - A chave (nome) do evento específico a ser ouvido.
 * @param {SubscribeEvent<E>} scope - A instância do event bus à qual se inscrever.
 * @param {K} event - O nome do evento a ser ouvido.
 * @param {SubscribeEventCallback<E[K]>} callback - A função a ser executada quando o evento é emitido. Pode retornar uma função de limpeza.
 * @param {boolean} [isOnce=false] - Se `true`, o callback será executado apenas uma vez e depois removido.
 * @returns {EmitEvent<E[K]>} Uma função `emit` memoizada que pode ser usada para disparar o evento.
 *
 * @example
 * // 1. Crie o event bus em um arquivo compartilhado (ex: src/events.ts)
 * import { createSubscribeEvent } from '@ismael1361/react-use';
 * export const appEvents = createSubscribeEvent<{
 *   'toggle-sidebar': [];
 * }>();
 *
 * // 2. Em um componente, ouça o evento para alterar seu estado.
 * // src/components/Sidebar.tsx
 * import React, { useState } from 'react';
 * import { useSubscribeEvent } from '@ismael1361/react-use';
 * import { appEvents } from '../events';
 *
 * const Sidebar = () => {
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   // Ouve o evento 'toggle-sidebar' e atualiza o estado.
 *   useSubscribeEvent(appEvents, 'toggle-sidebar', () => {
 *     setIsOpen(prev => !prev);
 *   });
 *
 *   return <aside className={isOpen ? 'open' : 'closed'}>Sidebar</aside>;
 * };
 *
 * // 3. Em outro componente, use o hook para obter a função de emissão.
 * // src/components/Header.tsx
 * import React from 'react';
 * import { useSubscribeEvent } from '@ismael1361/react-use';
 * import { appEvents } from '../events';
 *
 * const Header = () => {
 *   // Passa um callback vazio para apenas obter a função de emissão.
 *   const emitToggle = useSubscribeEvent(appEvents, 'toggle-sidebar', () => {});
 *
 *   return <button onClick={emitToggle}>Toggle Sidebar</button>;
 * };
 */
export const useSubscribeEvent = <E extends Record<string | symbol, any[]>, K extends keyof E>(
	scope: SubscribeEvent<E>,
	event: K,
	callback: SubscribeEventCallback<E[K]>,
	isOnce: boolean = false,
): EmitEvent<E[K]> => {
	const callbackRef = useCallbackRef(callback);

	useEffect(() => {
		let stop: ReturnType<React.EffectCallback> | null = null;

		const handler = (...args: E[K]) => {
			if (typeof stop === "function") stop();
			stop = callbackRef(...args) ?? null;
		};

		if (isOnce) scope.once(event, handler as any);
		else scope.on(event, handler as any);

		return () => {
			if (typeof stop === "function") stop();
			scope.off(event, handler as any);
			scope.offOnce(event, handler as any);
		};
	}, [event, isOnce]);

	return useCallbackRef((...args: E[K]) => {
		if (isOnce) scope.emitOnce(event as any, ...args);
		else scope.emit(event as any, ...args);
	});
};
