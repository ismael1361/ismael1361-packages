import { EventEmitter } from "@ismael1361/utils";
import { useEffect, useState } from "react";

export class PromiseResult<T = any> extends EventEmitter<{
	change: [result: T | undefined, state: "pending" | "rejected" | "fulfilled", error: any];
}> {
	private _result: T | undefined;
	private _state: "pending" | "rejected" | "fulfilled" = "pending";
	private _error: any;

	constructor(promise: Promise<T>) {
		super();

		const initialize = async () => {
			this._result = undefined;
			this._error = undefined;
			this._state = "pending";

			this.emit("change", this._result, this._state, this._error);

			try {
				await promise
					.then((i) => {
						if (i instanceof Error) {
							this._state = "rejected";
							this._error = i;
							return;
						}

						this._state = "fulfilled";
						this._result = i;
					})
					.catch((e) => {
						this._state = "rejected";
						this._error = e;
					});
			} catch (e) {
				this._state = "rejected";
				this._error = e;
			}

			this.emit("change", this._result, this._state, this._error);
		};

		initialize();
	}

	get result() {
		return this._result;
	}

	get state() {
		return this._state;
	}

	get error() {
		return this._error;
	}
}

/**
 * Um hook React para gerenciar operações assíncronas (Promises) de forma declarativa.
 * Ele executa uma função que retorna uma Promise e fornece o estado atual da operação
 * (pendente, resolvida ou rejeitada), o resultado ou o erro.
 *
 * A Promise é re-executada sempre que as dependências (`deps`) mudam.
 *
 * @template T - O tipo do valor que a Promise resolverá.
 * @param {() => Promise<T>} callback - A função que retorna a Promise a ser executada.
 * @param {React.DependencyList} [deps=[]] - Uma lista de dependências que, quando alterada, re-executará a Promise.
 * @param {boolean} [loading=false] - Se `true`, o hook permanecerá no estado 'pending' e não executará o callback. Útil para controle manual.
 * @returns {[T | undefined, "pending" | "rejected" | "fulfilled", any]} Uma tupla contendo:
 * - `result`: O valor resolvido da Promise, ou `undefined` se estiver pendente ou rejeitada.
 * - `state`: O estado atual da Promise ('pending', 'fulfilled', 'rejected').
 * - `error`: O erro capturado, se a Promise for rejeitada.
 *
 * @example
 * ```tsx
 * import React, { useState } from 'react';
 * import { usePromise } from '@ismael1361/react-use';
 *
 * const fetchUserData = async (userId: number) => {
 *   const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
 *   if (!response.ok) {
 *     throw new Error('Falha ao buscar usuário');
 *   }
 *   return response.json();
 * };
 *
 * const UserProfile = ({ userId }) => {
 *   const [result, state, error] = usePromise(() => fetchUserData(userId), [userId]);
 *
 *   if (state === 'pending') {
 *     return <div>Carregando perfil...</div>;
 *   }
 *
 *   if (state === 'rejected') {
 *     return <div>Erro: {error.message}</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>{result.name}</h1>
 *       <p>Email: {result.email}</p>
 *       <p>Telefone: {result.phone}</p>
 *     </div>
 *   );
 * };
 * ```
 */
export const usePromise = <T = any>(callback: () => Promise<T>, deps: React.DependencyList = [], loading: boolean = false) => {
	const [state, setState] = useState<[result: T | undefined, state: "pending" | "rejected" | "fulfilled", error: any]>([undefined, "pending", undefined]);

	useEffect(() => {
		setState([undefined, "pending", undefined]);

		if (loading) return;

		const event = new PromiseResult(callback()).on("change", (...args) => setState(args as any));

		return () => event.stop();
	}, [...deps, loading]);

	return state;
};
