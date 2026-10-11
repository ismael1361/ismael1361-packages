type PathInfoVariables = { [variable: string]: string | number; readonly length: number };

/**
 * (Internal) Analisa uma string de caminho em um array de chaves de segmento.
 * Normaliza o caminho para lidar com índices de array (ex: `[0]`) e barras extras.
 *
 * @param {string} path A string de caminho a ser analisada (ex: 'users/user1/posts[0]').
 * @returns {Array<string | number>} Um array de chaves, onde os índices do array são números e as chaves de objeto são strings.
 * @internal
 *
 * @example
 * ```ts
 * const keys = getPathKeys('users/user1/posts[0]/title');
 * // => ['', 'users', 'user1', 'posts', 0, 'title']
 *
 * const rootKeys = getPathKeys('');
 * // => ['']
 * ```
 */
const getPathKeys = (path: string): Array<string | number> => {
	path = path.trim().replace(/\\/g, "/").replace(/\[/g, "/[").replace(/^\/+/, "").replace(/\/+$/, "");
	if (path.length === 0) {
		return [""];
	}
	const keys = ["", ...path.split("/")].map((s) => s.trim());
	return keys.map((key) => {
		return key.startsWith("[") ? parseInt(key.slice(1, -1)) : key;
	});
};

/**
 * Uma classe utilitária para analisar, manipular e comparar caminhos hierárquicos.
 * Facilita o trabalho com caminhos que podem conter segmentos de string e índices de array,
 * como 'users/123/posts[0]'.
 *
 * @class PathInfo
 *
 * @example
 * ```ts
 * // Criando uma instância a partir de uma string
 * const path = new PathInfo('users/123/posts[0]');
 *
 * // Acessando propriedades
 * console.log(path.path);      // => "users/123/posts[0]"
 * console.log(path.keys);      // => ['', 'users', '123', 'posts', 0]
 * console.log(path.key);       // => 0
 * console.log(path.parent?.path); // => "users/123/posts"
 *
 * // Criando caminhos filhos
 * const titlePath = path.child('title');
 * console.log(titlePath.path); // => "users/123/posts[0]/title"
 * ```
 */
export class PathInfo {
	/**
	 * A string de caminho normalizada e completa.
	 * @readonly
	 * @example
	 * ```ts
	 * const p = new PathInfo('users/123/posts[0]');
	 * console.log(p.path); // "users/123/posts[0]"
	 * ```
	 */
	readonly path: string;
	/**
	 * Um array dos segmentos (chaves) que compõem o caminho.
	 * Chaves de objeto são strings, e índices de array são números.
	 * O primeiro elemento é uma string vazia para representar a raiz.
	 * @readonly
	 * @example
	 * ```ts
	 * const p = new PathInfo('users/123/posts[0]');
	 * console.log(p.keys); // ['', 'users', '123', 'posts', 0]
	 * ```
	 */
	readonly keys: Array<string | number>;

	/**
	 * Cria uma nova instância de `PathInfo` analisando um caminho.
	 * O caminho pode ser fornecido como uma string (com notação de barra e colchetes)
	 * ou como um array de segmentos de caminho que serão concatenados.
	 *
	 * @param {string | Array<string | number | PathInfo>} path O caminho a ser analisado.
	 *
	 * @example
	 * ```ts
	 * // Criando a partir de uma string
	 * const pathFromString = new PathInfo('users/123/posts[0]');
	 * console.log(pathFromString.path); // => "users/123/posts[0]"
	 * console.log(pathFromString.keys); // => ['', 'users', '123', 'posts', 0]
	 *
	 * // Criando a partir de um array de segmentos
	 * const pathFromArray = new PathInfo(['users', 123, 'posts', 0]);
	 * console.log(pathFromArray.path); // => "users/123/posts[0]"
	 *
	 * // Criando a partir de uma combinação complexa
	 * const part1 = 'users/123';
	 * const part2 = new PathInfo('posts');
	 * const pathFromParts = new PathInfo([part1, part2, 0, 'title']);
	 * console.log(pathFromParts.path); // => "users/123/posts[0]/title"
	 * ```
	 */
	constructor(path: string | Array<string | number | PathInfo>) {
		if (typeof path === "string") {
			this.keys = getPathKeys(path);
		} else if (path instanceof Array) {
			this.keys = Array.prototype.concat.apply(
				[],
				path
					.map((k) => (typeof k === "string" ? getPathKeys(k) : k instanceof PathInfo ? k.keys : [k]))
					.map((k) => {
						k.splice(
							0,
							k.findIndex((k) => String(k).trim() !== ""),
						);
						return k;
					}),
			);
		} else {
			this.keys = [""];
		}

		this.keys.splice(
			0,
			this.keys.findIndex((k) => String(k).trim() !== ""),
		);

		this.path = (this.keys.reduce((path, key, i) => (i === 0 ? `${key}` : typeof key === "string" ? `${path}/${key}` : `${path}[${key}]`), "") as string).replace(/^\//gi, "");
	}

	/**
	 * Obtém o último segmento (chave ou índice) do caminho.
	 * Retorna `null` se o caminho estiver vazio.
	 * @example
	 * ```ts
	 * const p = new PathInfo('users/123/posts[0]');
	 * console.log(p.key); // 0
	 *
	 * const p2 = new PathInfo('users/123');
	 * console.log(p2.key); // "123"
	 * ```
	 */
	get key(): string | number | null {
		return this.keys.length === 0 ? null : this.keys.slice(-1)[0];
	}

	/**
	 * Obtém uma nova instância de `PathInfo` representando o caminho pai.
	 * Retorna `null` se o caminho não tiver um pai (ou seja, for a raiz).
	 * @example
	 * ```ts
	 * const p = new PathInfo('users/123/profile');
	 * const parent = p.parent;
	 * console.log(parent.path); // "users/123"
	 * ```
	 */
	get parent(): PathInfo | null {
		if (this.keys.length == 0) {
			return null;
		}
		const parentKeys = this.keys.slice(0, -1);
		return new PathInfo(parentKeys);
	}

	/**
	 * Obtém a string do caminho pai.
	 * É um atalho conveniente para `this.parent?.path`.
	 * @example
	 * ```ts
	 * const p = new PathInfo('users/123/profile');
	 * console.log(p.parentPath); // "users/123"
	 * ```
	 */
	get parentPath(): string | null {
		return this.keys.length === 0 ? null : (this.parent?.path ?? null);
	}

	/**
	 * Um alias para a propriedade `keys`. Retorna o array de segmentos (chaves) que compõem o caminho.
	 *
	 * @returns {Array<string | number>} Um array de segmentos de caminho.
	 * @see {@link keys}
	 * @example
	 * ```ts
	 * const p = new PathInfo('users/123/posts[0]');
	 * console.log(p.pathKeys); // ['', 'users', '123', 'posts', 0]
	 * ```
	 */
	get pathKeys(): Array<string | number> {
		return this.keys;
	}

	/**
	 * Retorna a representação em string do caminho.
	 * Este método é chamado automaticamente quando a instância de `PathInfo`
	 * é usada em um contexto que espera uma string (como concatenação ou logging).
	 *
	 * @returns {string} A string completa do caminho.
	 *
	 * @example
	 * ```ts
	 * const path = new PathInfo('users/123');
	 *
	 * // Chamada explícita
	 * console.log(path.toString()); // => "users/123"
	 *
	 * // Chamada implícita em template string
	 * const fullUrl = `https://example.com/api/${path}`;
	 * console.log(fullUrl); // => "https://example.com/api/users/123"
	 * ```
	 */
	toString() {
		return this.path;
	}

	/**
	 * Cria uma nova instância de `PathInfo` para um caminho filho.
	 * Este método permite navegar para baixo na hierarquia de caminhos.
	 *
	 * @param {string | number | Array<string | number>} childKey A chave ou índice do filho.
	 * Pode ser uma única chave (`'profile'`), um índice (`0`), ou um caminho completo (`'posts/1/title'`).
	 * @returns {PathInfo} Uma nova instância de `PathInfo` representando o caminho filho.
	 *
	 * @example
	 * ```ts
	 * const userPath = new PathInfo('users/123');
	 *
	 * // Navegando para um filho com uma chave de string
	 * const profilePath = userPath.child('profile');
	 * console.log(profilePath.path); // => "users/123/profile"
	 *
	 * // Navegando para um filho com um caminho composto
	 * const postTitlePath = userPath.child('posts[0]/title');
	 * console.log(postTitlePath.path); // => "users/123/posts[0]/title"
	 * ```
	 */
	child(childKey: string | number | Array<string | number>) {
		if (typeof childKey === "string") {
			if (childKey.length === 0) {
				throw new Error(`child key for path "${this.path}" cannot be empty`);
			}
			// Permitir a expansão de um caminho filho (por exemplo, "user/name") para o equivalente a `child('user').child('name')`
			const keys = getPathKeys(childKey);
			keys.forEach((key, index) => {
				// Verifique as regras de chave do IvipBase aqui para que sejam aplicadas independentemente do destino de armazenamento.
				// Isso impede que chaves específicas sejam permitidas em um ambiente (por exemplo, navegador), mas depois
				// recusadas ao sincronizar com um banco de dados binário IvipBase.
				if (typeof key !== "string") {
					return;
				}
				if (/[\x00-\x08\x0b\x0c\x0e-\x1f/[\]\\]/.test(key)) {
					throw new Error(`Invalid child key "${key}" for path "${this.path}". Keys cannot contain control characters or any of the following characters: \\ / [ ]`);
				}
				if (key.length > 128) {
					throw new Error(`child key "${key}" for path "${this.path}" is too long. Max key length is 128`);
				}
				if (index !== 0 && key.length === 0) {
					throw new Error(`child key for path "${this.path}" cannot be empty`);
				}
			});
			childKey = keys;
		}
		if (Array.isArray(childKey) && childKey[0] === "") childKey.shift();
		return new PathInfo(this.keys.concat(childKey).filter((key, i, l) => (key === "" ? i === 0 : true)));
	}

	/**
	 * Obtém a string de um caminho filho.
	 * É um atalho conveniente para `this.child(childKey).path`.
	 *
	 * @param {string | number | Array<string | number>} childKey A chave ou índice do filho a ser anexado.
	 * @returns {string} A string completa do caminho filho resultante.
	 *
	 * @example
	 * ```ts
	 * const userPath = new PathInfo('users/123');
	 *
	 * const profilePathString = userPath.childPath('profile');
	 * console.log(profilePathString); // => "users/123/profile"
	 * ```
	 */
	childPath(childKey: string | number | Array<string | number>): string {
		return this.child(childKey).path;
	}

	/**
	 * Verifica se este caminho corresponde estruturalmente a outro caminho.
	 *
	 * A comparação é flexível e considera wildcards (`*`) e variáveis nomeadas (`$name`)
	 * como correspondentes a qualquer segmento na mesma posição no outro caminho.
	 *
	 * @param {string | PathInfo} otherPath O outro caminho a ser comparado.
	 * @returns {boolean} Retorna `true` se os caminhos corresponderem, caso contrário `false`.
	 *
	 * @example
	 * ```ts
	 * const templatePath = new PathInfo('users/$uid/posts/*');
	 *
	 * // Corresponde a um caminho concreto
	 * console.log(templatePath.equals('users/ewout/posts/post1')); // => true
	 *
	 * // A correspondência é bidirecional
	 * const concretePath = new PathInfo('users/ewout/posts/post1');
	 * console.log(concretePath.equals(templatePath)); // => true
	 *
	 * // Não corresponde se o número de segmentos for diferente
	 * console.log(templatePath.equals('users/ewout/posts')); // => false
	 * ```
	 */
	equals(otherPath: string | PathInfo): boolean {
		const other = otherPath instanceof PathInfo ? otherPath : new PathInfo(otherPath);
		if (this.path.replace(/\/$/gi, "") === other.path.replace(/\/$/gi, "")) {
			return true;
		} // they are identical
		if (this.keys.length !== other.keys.length) {
			return false;
		}
		return this.keys.every((key, index) => {
			const otherKey = other.keys[index];
			return otherKey === key || (typeof otherKey === "string" && (otherKey === "*" || otherKey[0] === "$")) || (typeof key === "string" && (key === "*" || key[0] === "$"));
		});
	}

	/**
	 * Verifica se o caminho atual é um ancestral do caminho descendente fornecido.
	 *
	 * Um caminho é considerado um ancestral se o caminho descendente começar com todos os
	 * segmentos do caminho atual. A comparação é flexível e lida com wildcards (`*`)
	 * e variáveis (`$name`).
	 *
	 * @param {string | PathInfo} descendantPath O caminho a ser verificado como descendente.
	 * @returns {boolean} Retorna `true` se o caminho atual for um ancestral, caso contrário `false`.
	 *
	 * @example
	 * ```ts
	 * const userPath = new PathInfo('users/123');
	 *
	 * // 'users/123' é um ancestral de 'users/123/posts'
	 * console.log(userPath.isAncestorOf('users/123/posts')); // => true
	 *
	 * // Um caminho não é ancestral de si mesmo
	 * console.log(userPath.isAncestorOf('users/123')); // => false
	 *
	 * // A comparação funciona com wildcards
	 * const templatePath = new PathInfo('users/*');
	 * console.log(templatePath.isAncestorOf('users/abc/profile')); // => true
	 * ```
	 */
	isAncestorOf(descendantPath: string | PathInfo): boolean {
		const descendant = descendantPath instanceof PathInfo ? descendantPath : new PathInfo(descendantPath);
		if (descendant.path === "" || this.path === descendant.path) {
			return false;
		}
		if (this.path === "") {
			return true;
		}
		if (this.keys.length >= descendant.keys.length) {
			return false;
		}
		return this.keys.every((key, index) => {
			const otherKey = descendant.keys[index];
			return otherKey === key || (typeof otherKey === "string" && (otherKey === "*" || otherKey[0] === "$")) || (typeof key === "string" && (key === "*" || key[0] === "$"));
		});
	}

	/**
	 * Verifica se o caminho atual é um descendente do caminho ancestral fornecido.
	 *
	 * Um caminho é considerado um descendente se começar com todos os segmentos do caminho
	 * ancestral. A comparação é flexível e lida com wildcards (`*`) e variáveis (`$name`).
	 *
	 * @param {string | PathInfo} ancestorPath O caminho a ser verificado como ancestral.
	 * @returns {boolean} Retorna `true` se o caminho atual for um descendente, caso contrário `false`.
	 *
	 * @example
	 * ```ts
	 * const postPath = new PathInfo('users/123/posts/post1');
	 *
	 * // 'users/123/posts/post1' é um descendente de 'users/123'
	 * console.log(postPath.isDescendantOf('users/123')); // => true
	 *
	 * // Um caminho não é descendente de si mesmo
	 * console.log(postPath.isDescendantOf('users/123/posts/post1')); // => false
	 *
	 * // A comparação funciona com wildcards
	 * console.log(postPath.isDescendantOf('users/*\/posts')); // => true
	 * ```
	 */
	isDescendantOf(ancestorPath: string | PathInfo): boolean {
		const ancestor = ancestorPath instanceof PathInfo ? ancestorPath : new PathInfo(ancestorPath);
		if (this.path === "" || this.path === ancestor.path) {
			return false;
		}
		if (ancestorPath === "") {
			return true;
		}
		if (ancestor.keys.length >= this.keys.length) {
			return false;
		}
		return ancestor.keys.every((key, index) => {
			const otherKey = this.keys[index];
			return otherKey === key || (typeof otherKey === "string" && (otherKey === "*" || otherKey[0] === "$")) || (typeof key === "string" && (key === "*" || key[0] === "$"));
		});
	}

	/**
	 * Verifica se o caminho atual e outro caminho estão na mesma "trilha".
	 *
	 * Dois caminhos estão na mesma trilha se um for ancestral do outro, ou se forem idênticos.
	 * Essencialmente, isso verifica se um caminho é um prefixo do outro.
	 * A comparação é flexível e lida com wildcards (`*`) e variáveis (`$name`).
	 *
	 * @param {string | PathInfo} otherPath O outro caminho a ser verificado.
	 * @returns {boolean} Retorna `true` se os caminhos estiverem na mesma trilha, caso contrário `false`.
	 *
	 * @example
	 * ```ts
	 * const userPath = new PathInfo('users/123');
	 * const userPostsPath = new PathInfo('users/123/posts');
	 *
	 * // Um ancestral está na trilha de seu descendente
	 * console.log(userPath.isOnTrailOf(userPostsPath)); // => true
	 *
	 * // Um descendente está na trilha de seu ancestral
	 * console.log(userPostsPath.isOnTrailOf(userPath)); // => true
	 *
	 * // Um caminho está na trilha de si mesmo
	 * console.log(userPath.isOnTrailOf('users/123')); // => true
	 *
	 * // Caminhos não relacionados não estão na mesma trilha
	 * console.log(userPath.isOnTrailOf('products/456')); // => false
	 * ```
	 */
	isOnTrailOf(otherPath: string | PathInfo): boolean {
		const other = otherPath instanceof PathInfo ? otherPath : new PathInfo(otherPath);
		if (this.path.length === 0 || other.path.length === 0) {
			return true;
		}
		if (this.path === other.path) {
			return true;
		}
		return this.pathKeys.every((key, index) => {
			if (index >= other.keys.length) {
				return true;
			}
			const otherKey = other.keys[index];
			return otherKey === key || (typeof otherKey === "string" && (otherKey === "*" || otherKey[0] === "$")) || (typeof key === "string" && (key === "*" || key[0] === "$"));
		});
	}

	/**
	 * Verifica se o caminho atual é um filho direto do caminho pai fornecido.
	 *
	 * @param {string | PathInfo} otherPath O caminho a ser verificado como pai.
	 * @returns {boolean} Retorna `true` se o caminho atual for um filho direto, caso contrário `false`.
	 *
	 * @example
	 * ```ts
	 * const childPath = new PathInfo('users/123/posts');
	 *
	 * // 'users/123/posts' é um filho direto de 'users/123'
	 * console.log(childPath.isChildOf('users/123')); // => true
	 *
	 * // Não é um filho direto de 'users'
	 * console.log(childPath.isChildOf('users')); // => false
	 * ```
	 */
	isChildOf(otherPath: string | PathInfo): boolean {
		const other = otherPath instanceof PathInfo ? otherPath : new PathInfo(otherPath);
		if (this.path === "") {
			return false;
		} // Se nosso caminho for a raiz, ele não é filho de ninguém...
		return this.parent?.equals(other) ?? false;
	}

	/**
	 * Verifica se o caminho atual é o pai direto do caminho filho fornecido.
	 *
	 * @param {string | PathInfo} otherPath O caminho a ser verificado como filho.
	 * @returns {boolean} Retorna `true` se o caminho atual for o pai direto, caso contrário `false`.
	 *
	 * @example
	 * ```ts
	 * const parentPath = new PathInfo('users/123');
	 *
	 * console.log(parentPath.isParentOf('users/123/posts')); // => true
	 * console.log(parentPath.isParentOf('users/123/posts/post1')); // => false
	 * ```
	 */
	isParentOf(otherPath: string | PathInfo): boolean {
		const other = otherPath instanceof PathInfo ? otherPath : new PathInfo(otherPath);
		if (other.path === "" || !other.parent) {
			return false;
		} // Verifica se um determinado caminho é seu pai, por exemplo, "posts/1234" é o pai de "posts/1234/title"
		return this.equals(other.parent);
	}

	/**
	 * Um método de fábrica estático para criar uma nova instância de `PathInfo`.
	 * É uma alternativa conveniente ao uso direto do construtor.
	 *
	 * @param {string | Array<string | number | PathInfo>} path O caminho a ser analisado. Pode ser uma string (ex: 'users/123') ou um array de segmentos de caminho.
	 * @returns {PathInfo} Uma nova instância de `PathInfo`.
	 *
	 * @example
	 * ```ts
	 * const pathInfo = PathInfo.get('users/123/profile');
	 * console.log(pathInfo.path); // => "users/123/profile"
	 * console.log(pathInfo.key);  // => "profile"
	 * ```
	 */
	static get(path: string | Array<string | number | PathInfo>): PathInfo {
		return new PathInfo(path);
	}

	/**
	 * Um método utilitário estático para construir a string de um caminho filho.
	 *
	 * @param {string} path O caminho pai.
	 * @param {string | number} childKey A chave ou índice do filho a ser anexado.
	 * @returns {string} A string completa do caminho filho resultante.
	 *
	 * @example
	 * ```ts
	 * const userProfilePath = PathInfo.getChildPath('users/123', 'profile');
	 * console.log(userProfilePath); // => "users/123/profile"
	 *
	 * const firstPostPath = PathInfo.getChildPath('users/123/posts', 0);
	 * console.log(firstPostPath); // => "users/123/posts[0]"
	 * ```
	 */
	static getChildPath(path: string, childKey: string | number): string {
		// return getChildPath(path, childKey);
		return PathInfo.get(path).child(childKey).path;
	}

	/**
	 * Analisa uma string de caminho e a converte em um array de seus segmentos (chaves).
	 *
	 * Este método estático fornece uma maneira pública de obter os segmentos de um caminho,
	 * como chaves de objeto (string) ou índices de array (number).
	 *
	 * @param {string} path A string de caminho a ser analisada (ex: 'users/123/posts[0]').
	 * @returns {Array<string | number>} Um array contendo os segmentos do caminho.
	 *
	 * @example
	 * ```ts
	 * const segments = PathInfo.getPathKeys('users/123/posts[0]/title');
	 * console.log(segments);
	 * // => ['users', '123', 'posts', 0, 'title']
	 *
	 * const userSegments = PathInfo.getPathKeys('users/ewout');
	 * console.log(userSegments);
	 * // => ['users', 'ewout']
	 * ```
	 */
	static getPathKeys(path: string): Array<string | number> {
		return getPathKeys(path).filter((key, i) => !(key === "" && i === 0));
	}

	/**
	 * (Internal) Analisa um caminho de template e extrai uma lista de suas chaves de variáveis.
	 * Este método identifica wildcards (`*`) e variáveis nomeadas (`$name`) e retorna
	 * um array com informações sobre elas, incluindo seus índices e nomes.
	 *
	 * @param {string} varPath O caminho do template contendo as variáveis (ex: 'users/$uid/posts/*').
	 * @returns {(string | number)[]} Um array contendo os descritores das variáveis.
	 *   - Para cada `*` ou `$name`, um índice numérico é adicionado.
	 *   - Para cada `$name`, o nome completo (ex: '$uid') e o nome curto (ex: 'uid') também são adicionados.
	 * @internal
	 *
	 * @example
	 * ```ts
	 * const keys = PathInfo.variablesKeys('users/$uid/posts/*');
	 * // => [0, '$uid', 'uid', 1]
	 *
	 * const keys2 = PathInfo.variablesKeys('items/*');
	 * // => [0]
	 * ```
	 */
	static variablesKeys(varPath: string): (string | number)[] {
		let count = 0;
		const variables: (string | number)[] = [];
		if (!varPath.includes("*") && !varPath.includes("$")) {
			return variables;
		}
		getPathKeys(varPath).forEach((key) => {
			if (key === "*") {
				variables.push(count++);
			} else if (typeof key === "string" && key[0] === "$") {
				variables.push(count++);
				variables.push(key);
				variables.push(key.slice(1));
			}
		});
		return variables;
	}

	/**
	 * Extrai valores de um caminho completo (`fullPath`) que correspondem a variáveis
	 * em um caminho de template (`varPath`).
	 *
	 * Este método compara a estrutura de um caminho de template, que pode conter wildcards (`*`)
	 * e variáveis nomeadas (`$name`), com um caminho real. Se as estruturas corresponderem,
	 * ele retorna um objeto contendo os valores extraídos.
	 *
	 * @param {string} varPath O caminho do template contendo as variáveis (ex: 'users/$uid/posts/*').
	 * @param {string} fullPath O caminho completo e real do qual os valores serão extraídos.
	 * @returns {PathInfoVariables}
	 * Um objeto semelhante a um array com os valores extraídos.
	 * - Os valores são acessíveis por índice numérico (ex: `vars[0]`).
	 * - Variáveis nomeadas também são acessíveis pelo nome (ex: `vars.uid` e `vars.$uid`).
	 * - Retorna um objeto com `length: 0` se os caminhos não corresponderem.
	 *
	 * @example
	 * ```ts
	 * const vars1 = PathInfo.extractVariables('users/$uid/posts/$postid', 'users/ewout/posts/post1');
	 * // vars1 é: { 0: 'ewout', 1: 'post1', $uid: 'ewout', uid: 'ewout', $postid: 'post1', postid: 'post1', length: 2 }
	 *
	 * const vars2 = PathInfo.extractVariables('users/*\/posts/*\/$property', 'users/ewout/posts/post1/title');
	 * // vars2 é: { 0: 'ewout', 1: 'post1', 2: 'title', $property: 'title', property: 'title', length: 3 }
	 *
	 * const vars3 = PathInfo.extractVariables('users/$user/friends[*]/$friend', 'users/dora/friends[4]/diego');
	 * // vars3 é: { 0: 'dora', 1: 4, 2: 'diego', $user: 'dora', user: 'dora', $friend: 'diego', friend: 'diego', length: 3 }
	 * ```
	 */
	static extractVariables(varPath: string, fullPath: string): PathInfoVariables {
		let count = 0;
		const variables = {
			get length() {
				return count;
			},
		} as PathInfoVariables;
		if (!varPath.includes("*") && !varPath.includes("$")) {
			return variables;
		}
		if (!this.get(varPath).equals(this.fillVariables(varPath, fullPath))) {
			return variables;
		}
		const keys = getPathKeys(varPath);
		const pathKeys = getPathKeys(fullPath);
		keys.forEach((key, index) => {
			const pathKey = pathKeys[index];
			if (key === "*") {
				variables[count++] = pathKey;
			} else if (typeof key === "string" && key[0] === "$") {
				variables[count++] = pathKey;
				// Set the $variable property
				variables[key] = pathKey;
				// Set friendly property name (without $)
				const varName = key.slice(1);
				if (typeof variables[varName] === "undefined") {
					variables[varName] = pathKey;
				}
			}
		});
		return variables;
	}

	/**
	 * Preenche as variáveis em um caminho de template (`varPath`) com os valores
	 * correspondentes de um caminho completo (`fullPath`).
	 *
	 * Este método cria um novo caminho substituindo wildcards (`*`) e variáveis nomeadas (`$name`)
	 * no template pelos segmentos do caminho completo. Ele lança um erro se as estruturas
	 * dos caminhos não forem compatíveis.
	 *
	 * @param {string} varPath O caminho do template contendo as variáveis (ex: 'users/$uid/posts/*').
	 * @param {string} fullPath O caminho completo e real que fornecerá os valores para as variáveis.
	 * @returns {string} Uma nova string de caminho com as variáveis preenchidas.
	 *
	 * @example
	 * ```ts
	 * const template = 'users/$uid/posts/*';
	 * const concretePath = 'users/ewout/posts/post1/title';
	 *
	 * // O caminho resultante terá o mesmo comprimento que o template.
	 * const filledPath = PathInfo.fillVariables(template, concretePath);
	 * console.log(filledPath);
	 * // => "users/ewout/posts/post1"
	 * ```
	 */
	static fillVariables(varPath: string, fullPath: string): string {
		if (varPath.indexOf("*") < 0 && varPath.indexOf("$") < 0) {
			return varPath;
		}
		const keys = getPathKeys(varPath);
		const pathKeys = getPathKeys(fullPath);
		const merged = keys.map((key, index) => {
			if (key === pathKeys[index] || index >= pathKeys.length) {
				return key;
			} else if (typeof key === "string" && (key === "*" || key[0] === "$")) {
				return pathKeys[index];
			} else {
				throw new Error(`Path "${fullPath}" cannot be used to fill variables of path "${varPath}" because they do not match`);
			}
		});
		let mergedPath = "";
		merged.forEach((key) => {
			if (typeof key === "number") {
				mergedPath += `[${key}]`;
			} else {
				if (mergedPath.length > 0) {
					mergedPath += "/";
				}
				mergedPath += key;
			}
		});
		return mergedPath;
	}

	/**
	 * Preenche as variáveis em um caminho de template com valores de um objeto ou array.
	 *
	 * Este método substitui wildcards (`*`) e variáveis nomeadas (`$name`) em um caminho
	 * de template pelos valores fornecidos em um objeto `vars`. A substituição é feita
	 * com base na ordem das variáveis no caminho e nos índices numéricos do objeto `vars`.
	 *
	 * @param {string} varPath O caminho do template contendo as variáveis (ex: 'users/$uid/posts/*').
	 * @param {any} vars Um objeto ou array-like contendo os valores para as variáveis.
	 *   Deve ser compatível com o objeto retornado por `PathInfo.extractVariables`.
	 * @returns {string} Uma nova string de caminho com as variáveis preenchidas.
	 *
	 * @example
	 * ```ts
	 * const template = 'users/$uid/posts/*';
	 * const variables = { 0: 'ewout', 1: 'post123', uid: 'ewout' };
	 *
	 * const finalPath = PathInfo.fillVariables2(template, variables);
	 * console.log(finalPath); // => "users/ewout/posts/post123"
	 * ```
	 */
	static fillVariables2(varPath: string, vars: Omit<PathInfoVariables, "length">): string {
		if (typeof vars !== "object" || Object.keys(vars).length === 0) {
			return varPath; // Nothing to fill
		}
		const pathKeys = getPathKeys(varPath);
		let n = 0;
		const targetPath = pathKeys.reduce<string>((path, key) => {
			if (typeof key === "string" && (key === "*" || key.startsWith("$"))) {
				return PathInfo.getChildPath(path, vars[n++]);
			} else {
				return PathInfo.getChildPath(path, key);
			}
		}, "");
		return targetPath;
	}
}
