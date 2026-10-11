import { PathInfo } from "@ismael1361/utils";
import { useEffect, useMemo, useState } from "react";
import queryString from "query-string";
import { createBrowserHistory } from "history";
import type { History as _History, Listener, Location } from "history";

export type { Location } from "history";

export interface History extends _History {
	readonly index: number;
}

interface HistoryProps {
	push(path: string | PathInfo, state?: any): void;
	replace(path: string | PathInfo, state?: any): void;
	go(delta: number): void;
	back(): void;
	forward(): void;
	pathname: string;
	query: Record<PropertyKey, any>;
	pathinfo: PathInfo;
}

let currentIndex = 0,
	unlisten: (() => void) | null = null;

const listeners: Array<Listener> = [];

const createMemoryHistory = (): History => {
	unlisten?.();

	const history = createBrowserHistory();

	let l: Location = history.location;

	unlisten = history.listen(({ action, location }) => {
		l = location;

		switch (action) {
			case "PUSH":
				currentIndex++;
				break;
			case "POP":
				currentIndex--;
				break;
		}

		for (const listener of listeners) {
			listener({ action, location });
		}
	});

	return {
		...history,
		// back(...args){
		//     currentIndex--;
		//     return history.back(...args);
		// },
		// forward(...args){
		//     currentIndex++;
		//     return history.forward(...args);
		// },
		listen(listener) {
			listeners.push(listener);
			return () => {
				listeners.splice(listeners.indexOf(listener), 1);
			};
		},
		get index() {
			return currentIndex;
		},
		get location() {
			return l;
		},
	};
};

export const history = createMemoryHistory();

const normalizePath = (path: string) => {
	path = typeof path === "string" ? path.replace(/\/+/g, "/").replace(/\/+$/g, "") : path;
	const partes = path.split("/");
	const pilha = [];
	for (const parte of partes) {
		if (parte === "..") {
			pilha.pop();
		} else if (parte !== ".") {
			pilha.push(parte);
		}
	}
	return pilha.map((s) => (/(https?\:)/.test(s) ? s + "/" : s)).join("/");
};

/**
 * Um hook React que fornece uma interface reativa para o objeto de histórico do navegador.
 * Ele permite que os componentes acessem e manipulem facilmente a URL, o estado e os parâmetros de consulta.
 * O hook garante que o componente seja re-renderizado sempre que a localização do histórico mudar.
 *
 * @returns {HistoryProps} Um objeto memoizado contendo métodos de navegação e informações sobre a localização atual.
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { useHistory, history } from '@ismael1361/react-use'; // Supondo que o hook esteja neste pacote
 * // Para que o roteamento funcione, o componente principal da aplicação
 * // deve usar um Router que utilize a instância de 'history' exportada.
 * // Exemplo com React Router v5:
 * // import { Router } from 'react-router-dom';
 * //
 * // const App = () => (
 * //   <Router history={history}>
 * //     <NavigationComponent />
 * //   </Router>
 * // );
 *
 * const NavigationComponent = () => {
 *   const { push, replace, back, pathname, query, pathinfo } = useHistory();
 *
 *   const goToUserPage = () => {
 *     // Navega para uma nova página, passando estado
 *     push('/users/123', { from: 'home' });
 *   };
 *
 *   const addQueryParam = () => {
 *     // Substitui a entrada atual, adicionando um parâmetro de consulta
 *     replace(`${pathname}?sort=asc`);
 *   };
 *
 *   return (
 *     <div>
 *       <p>Caminho Atual: {pathname}</p>
 *       <p>Query Params & State: {JSON.stringify(query)}</p>
 *       <button onClick={goToUserPage}>Ir para /users/123</button>
 *       <button onClick={addQueryParam}>Adicionar '?sort=asc'</button>
 *       <button onClick={back}>Voltar</button>
 *     </div>
 *   );
 * };
 * ```
 */
export const useHistory = (): HistoryProps => {
	const [time, setTime] = useState<number>(0);

	useEffect(() => {
		const unlisten = history.listen(({ location }) => {
			setTime(() => Date.now());
		});

		return () => {
			unlisten();
		};
	}, []);

	return useMemo(() => {
		return {
			push(path, state) {
				history.push(path instanceof PathInfo ? path.toString() : path, state);
			},
			replace(path, state) {
				history.replace(path instanceof PathInfo ? path.toString() : path, state);
			},
			go(delta) {
				history.go(delta);
			},
			back() {
				history.back();
			},
			forward() {
				history.forward();
			},
			get pathname() {
				return normalizePath(history.location.pathname);
			},
			get query() {
				return {
					...queryString.parse(history.location.search), // Convert string to object
					...(history.location.state as any), // Convert object to object
				} as Record<PropertyKey, any>;
			},
			get pathinfo() {
				return new PathInfo(history.location.pathname);
			},
		};
	}, [time]);
};
