/**
 * Converte uma string em um "slug" amigável para URLs.
 * A função transforma a string para minúsculas, remove espaços no início e no fim,
 * remove caracteres que não sejam alfanuméricos, espaços ou hífens, e substitui
 * espaços ou múltiplos hífens por um único hífen.
 *
 * @param {string} str A string a ser convertida.
 * @returns {string} A string formatada como slug.
 * @example
 * const title = '  Exemplo de Título com Acentuação & Símbolos!  ';
 * const slug = slugify(title);
 * console.log(slug);
 * // => 'exemplo-de-ttulo-com-acentuao-smbolos'
 */
export function slugify(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
