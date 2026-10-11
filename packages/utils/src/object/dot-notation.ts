/**
 * Define um valor em um objeto aninhado usando notação de ponto.
 * A função modifica o objeto original e retorna uma nova referência do objeto de nível superior.
 * Se os objetos intermediários no caminho não existirem, eles serão criados.
 * Se o `value` fornecido for `undefined`, a propriedade de destino será removida.
 *
 * @param {Record<string, any>} obj O objeto a ser modificado.
 * @param {string} key A chave em notação de ponto (ex: 'user.address.city').
 * @param {any} value O valor a ser definido na propriedade de destino.
 * @returns {Record<string, any>} Uma nova referência do objeto modificado.
 *
 * @example
 * ```ts
 * const user = { name: 'John', address: { street: '123 Main St' } };
 *
 * // Define uma nova propriedade aninhada
 * setKeyValue(user, 'address.city', 'New York');
 * // user agora é { name: 'John', address: { street: '123 Main St', city: 'New York' } }
 *
 * // Atualiza uma propriedade existente
 * setKeyValue(user, 'name', 'John Doe');
 * // user agora é { name: 'John Doe', address: { ... } }
 *
 * // Remove uma propriedade passando undefined
 * setKeyValue(user, 'address.street', undefined);
 * // user agora é { name: 'John Doe', address: { city: 'New York' } }
 * ```
 */
export const setKeyValue = <T extends Record<PropertyKey, any>>(obj: T, key: string, value: any): T => {
	const keys = key.split(".");
	const lastKey = keys.pop()!;
	const currentObj = keys.reduce((acc: any, key) => {
		if (acc[key] === undefined) acc[key] = {};
		return acc[key];
	}, obj);
	if (value !== undefined) currentObj[lastKey] = value;
	else delete currentObj[lastKey];
	return { ...obj };
};

/**
 * Obtém um valor de um objeto aninhado usando notação de ponto.
 *
 * @param {Record<string, any>} obj O objeto do qual obter o valor.
 * @param {string} key A chave em notação de ponto (ex: 'user.address.city').
 * @returns {any | undefined} O valor encontrado no caminho especificado, ou `undefined` se o caminho for inválido.
 *
 * @example
 * ```ts
 * const user = {
 *   name: 'Jane Doe',
 *   address: {
 *     city: 'London',
 *     zip: 'E1 6AN'
 *   }
 * };
 *
 * const city = getKeyValue(user, 'address.city');
 * console.log(city); // => 'London'
 *
 * const country = getKeyValue(user, 'address.country');
 * console.log(country); // => undefined
 * ```
 */
export const getKeyValue = <T extends Record<PropertyKey, any>, R>(obj: T, key: string): R => {
	const keys = key.split(".");
	const lastKey = keys.pop()!;
	const currentObj = keys.reduce((acc, key) => acc?.[key], obj);
	return currentObj?.[lastKey];
};

/**
 * Remove uma lista de chaves de um objeto.
 * Nota: A implementação atual remove de forma confiável apenas chaves de nível superior.
 *
 * @param {Record<string, any>} obj O objeto do qual as chaves serão removidas.
 * @param {string[]} keys Um array de nomes de chaves a serem removidas.
 * @returns {Record<string, any>} Um novo objeto sem as chaves especificadas.
 *
 * @example
 * ```ts
 * const data = { id: 1, name: 'Item', description: 'Details', internal: { valid: true, type: "User" } };
 * const cleanedData = removeKeys(data, ['description', 'internal.valid']);
 * console.log(cleanedData); // => { id: 1, name: 'Item', internal: { type: "User" } }
 * ```
 */
export const removeKeys = <T extends Record<PropertyKey, any>>(obj: T, keys: string[]): T => {
	const newObj: T = { ...obj };
	keys.forEach((key) => {
		if (key.split(".").length > 1) {
			const [current, ...rest] = key.split(".");
			if (typeof newObj[current] === "object") {
				(newObj as any)[current] = removeKeys(newObj[current], [rest.join(".")]);
				if (Object.keys(newObj[current]).length === 0) {
					delete newObj[current];
				}
			} else {
				delete newObj[current];
			}
		} else {
			delete newObj[key];
		}
	});
	return newObj;
};
