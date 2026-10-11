import { PathInfo } from "../PathInfo";

/**
 * Define o formato do objeto de evento passado para o callback de `deepObservable`.
 */
type DeepObservableEvent = {
	/** O tipo de mutação que ocorreu: 'set' para adição/atualização ou 'delete' para remoção. */
	type: "set" | "delete";
	/** O caminho em notação de ponto para a propriedade que foi alterada (ex: 'user.address.city'). */
	path: string;
	/** A chave/propriedade que foi modificada. */
	property: PropertyKey;
	/** O valor da propriedade antes da mutação. */
	oldValue: any;
	/** O novo valor da propriedade após a mutação (será `undefined` para operações de 'delete'). */
	newValue: any;
	/** O objeto alvo (pai direto) onde a mutação ocorreu. */
	target: any;
};

/**
 * A assinatura da função de callback usada por `deepObservable`.
 * @param {DeepObservableEvent} event - Um objeto contendo detalhes sobre a mutação.
 */
type DeepObservableCallback = (event: DeepObservableEvent) => void;

/**
 * Cria um proxy "profundo" (deep proxy) para um objeto, permitindo observar todas as mutações
 * (set e delete) em qualquer nível de aninhamento. Quando uma propriedade é alterada ou removida,
 * uma função de callback opcional é invocada com detalhes sobre a mutação.
 *
 * @template T O tipo do objeto a ser observado.
 * @param {T} obj O objeto ou array a ser tornado profundamente observável.
 * @param {DeepObservableCallback} [callback] A função a ser chamada sempre que uma propriedade for definida ou excluída.
 * @param {PathInfo} [path=new PathInfo([])] - @internal Usado internamente para rastrear o caminho do objeto aninhado.
 * @returns {T} Um proxy do objeto original que intercepta todas as mutações.
 *
 * @example
 * ```ts
 * const state = { user: { name: 'John' }, posts: [{ title: 'Post 1' }] };
 * const mutations = [];
 *
 * const observableState = deepObservable(state, (event) => {
 *   mutations.push({ path: event.path, oldValue: event.oldValue, newValue: event.newValue });
 * });
 *
 * // Realizando mutações
 * observableState.user.name = 'Jane';
 * observableState.posts[0].title = 'First Post';
 * observableState.posts.push({ title: 'Post 2' });
 *
 * console.log(mutations);
 * // [
 * //   { path: 'user.name', oldValue: 'John', newValue: 'Jane' },
 * //   { path: 'posts[0].title', oldValue: 'Post 1', newValue: 'First Post' },
 * //   { path: 'posts[1]', oldValue: undefined, newValue: { title: 'Post 2' } }
 * // ]
 * ```
 */
export const deepObservable = <T>(obj: T, callback?: DeepObservableCallback, path: PathInfo = new PathInfo([])): T => {
	if (typeof obj !== "object" || obj === null) {
		return obj;
	}

	if (obj.constructor && !["Object", "Array"].includes(obj.constructor.name) && obj instanceof Object) {
		return obj;
	}

	const isArray = Array.isArray(obj);

	// Criar proxy para o objeto atual
	const proxy = new Proxy(obj, {
		set(target: any, property: PropertyKey, value: any) {
			const key: string | number = typeof property === "symbol" ? property.toString() : isArray ? Number(property) : property;
			const fullPath = path.child(key);
			const oldValue = target[property];

			// Se o novo valor é um objeto, torná-lo observável também
			const newValue = typeof value === "object" && value !== null ? deepObservable(value, callback, fullPath) : value;

			target[property] = newValue;

			callback?.({
				type: "set",
				path: fullPath.path.replace(/\//gi, "."),
				property: key,
				oldValue: oldValue,
				newValue: newValue,
				target: target,
			});

			return true;
		},

		deleteProperty(target: any, property: PropertyKey) {
			const key: string | number = typeof property === "symbol" ? property.toString() : isArray ? Number(property) : property;
			const fullPath = path.child(key);
			const oldValue = target[property];

			delete target[property];

			callback?.({
				type: "delete",
				path: fullPath.path.replace(/\//gi, "."),
				property: key,
				oldValue: oldValue,
				newValue: undefined,
				target: target,
			});

			return true;
		},
	});

	// Tornar todas as propriedades existentes observáveis
	for (const key in obj) {
		if (obj.hasOwnProperty(key) && typeof obj[key] === "object" && obj[key] !== null) {
			const fullPath = path.child(isArray ? Number(key) : key);
			obj[key] = deepObservable(obj[key], callback, fullPath);
		}
	}

	return proxy;
};
