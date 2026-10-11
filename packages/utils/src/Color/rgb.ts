import HEX from "./hex";
import RGBA from "./rgba";
import HSL from "./hsl";
import HSLA from "./hsla";

/**
 * Representa uma cor no formato RGB (Red, Green, Blue).
 * @class RGB
 */
export default class RGB {
	/**
	 * Cria uma instância de RGB.
	 * @param {number} red - O componente vermelho da cor (0-255).
	 * @param {number} green - O componente verde da cor (0-255).
	 * @param {number} blue - O componente azul da cor (0-255).
	 * @example
	 * ```ts
	 * const blue = new RGB(0, 0, 255);
	 * ```
	 */
	constructor(
		public red: number,
		public green: number,
		public blue: number,
	) {}

	get r(): number {
		return this.red;
	}

	get g(): number {
		return this.green;
	}

	get b(): number {
		return this.blue;
	}

	toString() {
		return this.value;
	}

	/**
	 * Obtém a representação da cor como um vetor numérico no formato RGB.
	 * @returns {[number, number, number]} Um array no formato `[vermelho, verde, azul]`.
	 */
	get vector(): [number, number, number] {
		return [this.red, this.green, this.blue];
	}

	/**
	 * Obtém a representação da cor como uma string no formato `rgb(r, g, b)`.
	 * @returns {string} A string da cor RGB.
	 * @example
	 * ```ts
	 * const blue = new RGB(0, 0, 255);
	 * console.log(blue.value); // "rgb(0, 0, 255)"
	 * ```
	 */
	get value(): string {
		return RGB.stringify(this);
	}

	/**
	 * Converte a cor RGB para sua representação HEX.
	 * @returns {HEX} Um novo objeto HEX.
	 */
	get hex(): HEX {
		const [r, g, b] = this.vector;
		return HEX.parse(`#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`);
	}

	/**
	 * Converte a cor RGB para sua representação RGBA, adicionando um canal alfa de 1 (opaco).
	 * @returns {RGBA} Um novo objeto RGBA.
	 */
	get rgba(): RGBA {
		const [r, g, b] = this.vector;
		return new RGBA(r, g, b);
	}

	/**
	 * Converte a cor RGB para sua representação HSL.
	 * @returns {HSL} Um novo objeto HSL.
	 */
	get hsl(): HSL {
		return this.rgba.hsl;
	}

	/**
	 * Converte a cor RGB para sua representação HSLA.
	 * @returns {HSLA} Um novo objeto HSLA.
	 */
	get hsla(): HSLA {
		return this.rgba.hsla;
	}

	/**
	 * Testa se uma string corresponde ao formato de cor RGB.
	 * @param {string} text - A string a ser testada.
	 * @returns {boolean} `true` se a string for uma cor RGB válida, caso contrário `false`.
	 * @example
	 * ```ts
	 * console.log(RGB.test("rgb(255, 0, 0)")); // true
	 * console.log(RGB.test("hsl(0, 100%, 50%)")); // false
	 * ```
	 */
	static test(text: string): boolean {
		return /^rgb\s*\(\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\)$/i.test(text.toLowerCase());
	}

	/**
	 * Analisa uma string RGB e a converte para uma instância da classe `RGB`.
	 * @param {string} text - A string da cor no formato RGB (ex: "rgb(255, 0, 0)").
	 * @returns {RGB} Uma nova instância de `RGB`.
	 * @throws {Error} Lança um erro se o formato da string for inválido.
	 * @example
	 * ```ts
	 * const red = RGB.parse("rgb(255, 0, 0)");
	 * console.log(red.red); // 255
	 * ```
	 */
	static parse(text: string) {
		if (!this.test(text)) {
			throw new Error("Formato de cor inválido. As cores devem estar em formato rgb (ex: rgb(255, 0, 0))");
		}

		const result = text.toLowerCase().match(/[\d\.\-]+/g)!;

		const [r, g, b] = result.map(Number);
		return new RGB(r, g, b);
	}

	/**
	 * Converte uma instância de `RGB` ou um vetor de valores RGB em uma string.
	 * @param {RGB | [number, number, number]} value - A instância ou vetor `[r, g, b]` a ser convertido.
	 * @returns {string} A representação da cor em formato de string RGB.
	 * @example
	 * ```ts
	 * const blue = new RGB(0, 0, 255);
	 * console.log(RGB.stringify(blue)); // "rgb(0, 0, 255)"
	 *
	 * console.log(RGB.stringify([0, 255, 0])); // "rgb(0, 255, 0)"
	 * ```
	 */
	static stringify(value: RGB | [number, number, number]) {
		const [r, g, b] = Array.isArray(value) ? value : value.vector;
		return `rgb(${r}, ${g}, ${b})`;
	}
}
