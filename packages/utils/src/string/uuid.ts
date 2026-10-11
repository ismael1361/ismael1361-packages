/**
 * Gera um identificador único universal (UUID) versão 4.
 * Esta implementação não é criptograficamente segura e é baseada em `Math.random()`.
 * É adequada para gerar identificadores únicos em cenários onde a segurança não é a principal preocupação.
 *
 * @param {string} [separator=""] - O caractere ou string a ser usado como separador entre os blocos do UUID. O padrão é uma string vazia, resultando em um UUID contínuo. Usar `"-"` resulta no formato padrão de UUID.
 * @returns {string} Uma string UUID v4.
 * @example
 * // Gera um UUID sem separadores
 * const id1 = uuidv4();
 * console.log(id1);
 * // => "a1b2c3d4e5f64a7b8c9d0e1f2a3b4c5d" (exemplo)
 *
 * // Gera um UUID com hífens como separadores (formato padrão)
 * const id2 = uuidv4("-");
 * console.log(id2);
 * // => "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d" (exemplo)
 */
export const uuidv4 = (separator: string = "") => {
	let currentTime = Date.now();
	return `xxxxxxxx${separator}xxxx${separator}4xxx${separator}yxxx${separator}xxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
		const r = ((currentTime + Math.random() * 16) % 16) | 0;
		currentTime = Math.floor(currentTime / 16);
		return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
	});
};
