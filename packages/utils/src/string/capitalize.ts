/**
 * Converte o primeiro caractere de uma string para maiúsculo e o restante para minúsculo.
 *
 * @param {string} str A string a ser capitalizada.
 * @returns {string} Retorna a string capitalizada. Se a string de entrada for vazia ou nula, retorna uma string vazia.
 * @example
 * capitalize('olá mundo');
 * // => 'Olá mundo'
 *
 * capitalize('JÁ ESTÁ EM MAIÚSCULO');
 * // => 'Já está em maiúsculo'
 */
export function capitalize(str: string): string {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
