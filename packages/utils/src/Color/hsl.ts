import HEX from "./hex";
import RGB from "./rgb";
import RGBA from "./rgba";
import HSLA from "./hsla";

/**
 * Representa uma cor no formato HSL (Hue, Saturation, Lightness).
 * @class HSL
 */
export default class HSL {
	/**
	 * Cria uma instância de HSL.
	 * @param {number} hue - O matiz da cor (0-360).
	 * @param {number} saturation - A saturação da cor (0-100).
	 * @param {number} lightness - A luminosidade da cor (0-100).
	 * @example
	 * ```ts
	 * const red = new HSL(0, 100, 50);
	 * ```
	 */
	constructor(
		public hue: number,
		public saturation: number,
		public lightness: number,
	) {}

	get h(): number {
		return this.hue;
	}

	get s(): number {
		return this.saturation;
	}

	get l(): number {
		return this.lightness;
	}

	toString() {
		return this.value;
	}

	/**
	 * Obtém a representação da cor como um vetor numérico no formato HSL.
	 * @returns {[number, number, number]} Um array no formato `[matiz, saturação, luminosidade]`.
	 */
	get vector(): [number, number, number] {
		return [this.hue, this.saturation, this.lightness];
	}

	/**
	 * Obtém a representação da cor como uma string no formato `hsl(h, s%, l%)`.
	 * @returns {string} A string da cor HSL.
	 * @example
	 * ```ts
	 * const red = new HSL(0, 100, 50);
	 * console.log(red.value); // "hsl(0, 100%, 50%)"
	 * ```
	 */
	get value(): string {
		return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
	}

	/**
	 * Converte a cor HSL para sua representação HSLA, adicionando um canal alfa de 1 (opaco).
	 * @returns {HSLA} Um novo objeto HSLA.
	 */
	get hsla(): HSLA {
		return new HSLA(this.hue, this.saturation, this.lightness, 1);
	}

	/**
	 * Converte a cor HSL para sua representação HEX.
	 * @returns {HEX} Um novo objeto HEX.
	 */
	get hex(): HEX {
		return this.hsla.hex;
	}

	/**
	 * Converte a cor HSL para sua representação RGBA.
	 * @returns {RGBA} Um novo objeto RGBA.
	 */
	get rgba(): RGBA {
		return this.hsla.rgba;
	}

	/**
	 * Converte a cor HSL para sua representação RGB.
	 * @returns {RGB} Um novo objeto RGB.
	 */
	get rgb(): RGB {
		return this.hsla.rgb;
	}

	/**
	 * Testa se uma string corresponde ao formato de cor HSL.
	 * @param {string} text - A string a ser testada.
	 * @returns {boolean} `true` se a string for uma cor HSL válida, caso contrário `false`.
	 * @example
	 * ```ts
	 * console.log(HSL.test("hsl(120, 100%, 50%)")); // true
	 * console.log(HSL.test("rgb(255, 0, 0)"));    // false
	 * ```
	 */
	static test(text: string): boolean {
		return /^hsl\s*\(\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)%\s*,\s*([\d\.\-]+)%\s*\)$/i.test(text.trim().toLowerCase());
	}

	/**
	 * Analisa uma string HSL e a converte para uma instância da classe `HSL`.
	 * @param {string} text - A string da cor no formato HSL (ex: "hsl(0, 100%, 50%)").
	 * @returns {HSL} Uma nova instância de `HSL`.
	 * @throws {Error} Lança um erro se o formato da string for inválido.
	 * @example
	 * ```ts
	 * const red = HSL.parse("hsl(0, 100%, 50%)");
	 * console.log(red.hue); // 0
	 * ```
	 */
	static parse(text: string) {
		if (!this.test(text)) {
			throw new Error("Formato de cor inválido. As cores devem estar em formato hsl (ex: hsl(255, 0%, 0%))");
		}

		const result = text
			.trim()
			.toLowerCase()
			.match(/[\d\.\-]+/g)!;

		const [h, s, l] = result.map(Number);
		return new HSL(h, s, l);
	}

	/**
	 * Converte uma instância de `HSL` ou um vetor de valores HSL em uma string.
	 * @param {HSL | [number, number, number]} value - A instância ou vetor `[h, s, l]` a ser convertido.
	 * @returns {string} A representação da cor em formato de string HSL.
	 * @example
	 * ```ts
	 * const red = new HSL(0, 100, 50);
	 * console.log(HSL.stringify(red)); // "hsl(0, 100%, 50%)"
	 *
	 * console.log(HSL.stringify([120, 100, 50])); // "hsl(120, 100%, 50%)"
	 * ```
	 */
	static stringify(value: HSL | [number, number, number]) {
		const [h, s, l] = Array.isArray(value) ? value : value.vector;
		return `hsl(${h}, ${s}%, ${l}%)`;
	}
}
