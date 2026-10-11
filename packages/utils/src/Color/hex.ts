import RGB from "./rgb";
import RGBA from "./rgba";
import HSL from "./hsl";
import HSLA from "./hsla";

/**
 * Representa uma cor no formato HEX (Hexadecimal).
 * @class HEX
 */
export default class HEX {
	/**
	 * Cria uma instância de HEX.
	 * @param {string} hex - A string da cor no formato hexadecimal (ex: "#FF0000" ou "#F00").
	 * @throws {Error} Lança um erro se o formato da string for inválido.
	 * @example
	 * ```ts
	 * const red = new HEX("#FF0000");
	 * const blue = new HEX("#00F");
	 * ```
	 */
	constructor(public hex: string) {
		if (!HEX.test(hex)) {
			throw new Error("Formato de cor inválido. As cores devem estar em formato hexadecimal (ex: #ff0000) ou hexadecimal com alfa (ex: #ff0000ff)");
		}
	}

	toString() {
		return this.value;
	}

	/**
	 * Converte a cor HEX para um vetor numérico no formato RGBA.
	 * @returns {[number, number, number, number]} Um array no formato `[vermelho, verde, azul, alfa]`.
	 */
	get vector(): [number, number, number, number] {
		let r = 0,
			g = 0,
			b = 0,
			a = 1;

		if (!HEX.test(this.hex)) {
			throw new Error("Formato de cor inválido. As cores devem estar em formato hexadecimal (ex: #ff0000) ou hexadecimal com alfa (ex: #ff0000ff)");
		}

		let [single, double] = this.hex
			.match(/^#(([0-9A-F]{3}([0-9A-F])?)|([0-9A-F]{6}([0-9A-F]{2})?))$/i)!
			.slice(2)
			.filter((v, i) => i % 2 == 0) as [string | undefined, string | undefined];

		double = single
			? single
					.split("")
					.map((char) => char + char)
					.join("")
			: double;

		const hex = this.hex.match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})?$/i)!.slice(1) as [string, string, string, string | undefined];

		r = parseInt(hex[0], 16);
		g = parseInt(hex[1], 16);
		b = parseInt(hex[2], 16);

		if (hex[3]) {
			a = parseInt(hex[3], 16) / 255;
		}

		return [r, g, b, a];
	}

	/**
	 * Obtém a representação da cor como uma string no formato hexadecimal.
	 * @returns {string} A string da cor HEX.
	 * @example
	 * ```ts
	 * const red = new HEX("#FF0000");
	 * console.log(red.value); // "#FF0000"
	 * ```
	 */
	get value(): string {
		return this.hex;
	}

	/**
	 * Converte a cor HEX para sua representação RGBA.
	 * @returns {RGBA} Um novo objeto RGBA.
	 */
	get rgba(): RGBA {
		const [r, g, b, a] = this.vector;
		return new RGBA(r, g, b, a);
	}

	/**
	 * Converte a cor HEX para sua representação RGB.
	 * @returns {RGB} Um novo objeto RGB.
	 */
	get rgb(): RGB {
		const [r, g, b] = this.vector;
		return new RGB(r, g, b);
	}

	/**
	 * Converte a cor HEX para sua representação HSL.
	 * @returns {HSL} Um novo objeto HSL.
	 */
	get hsl(): HSL {
		return this.rgba.hsl;
	}

	/**
	 * Converte a cor HEX para sua representação HSLA.
	 * @returns {HSLA} Um novo objeto HSLA.
	 */
	get hsla(): HSLA {
		return this.rgba.hsla;
	}

	/**
	 * Testa se uma string corresponde ao formato de cor HEX.
	 * @param {string} text - A string a ser testada.
	 * @returns {boolean} `true` se a string for uma cor HEX válida, caso contrário `false`.
	 * @example
	 * ```ts
	 * console.log(HEX.test("#FF0000")); // true
	 * console.log(HEX.test("#F00"));    // true
	 * console.log(HEX.test("rgb(255,0,0)")); // false
	 * ```
	 */
	static test(text: string): boolean {
		return /^#(([0-9A-F]{3}([0-9A-F])?)|([0-9A-F]{6}([0-9A-F]{2})?))$/i.test(text.toUpperCase());
	}

	/**
	 * Analisa uma string HEX e a converte para uma instância da classe `HEX`.
	 * @param {string} text - A string da cor no formato HEX (ex: "#FF0000").
	 * @returns {HEX} Uma nova instância de `HEX`.
	 * @throws {Error} Lança um erro se o formato da string for inválido.
	 * @example
	 * ```ts
	 * const red = HEX.parse("#FF0000");
	 * console.log(red.hex); // "#FF0000"
	 * ```
	 */
	static parse(text: string) {
		if (!this.test(text)) {
			throw new Error("Formato de cor inválido. As cores devem estar em formato hexadecimal (ex: #ff0000) ou hexadecimal com alfa (ex: #ff0000ff)");
		}
		return new HEX(text.toUpperCase());
	}

	/**
	 * Converte uma instância de `HEX` ou um vetor de valores RGBA em uma string hexadecimal.
	 * @param {HEX | [number, number, number] | [number, number, number, number]} value - A instância ou vetor a ser convertido.
	 * @returns {string} A representação da cor em formato de string HEX.
	 * @example
	 * ```ts
	 * const red = new HEX("#FF0000");
	 * console.log(HEX.stringify(red)); // "#FF0000"
	 *
	 * console.log(HEX.stringify([0, 255, 0, 1])); // "#00FF00"
	 * ```
	 */
	static stringify(hex: HEX | [number, number, number] | [number, number, number, number]): string {
		if (Array.isArray(hex)) {
			const [r, g, b, a] = hex;
			return hex.length > 3 ? new RGBA(r, g, b, a).hex.value : new RGB(r, g, b).hex.value;
		}

		return hex.value;
	}
}
