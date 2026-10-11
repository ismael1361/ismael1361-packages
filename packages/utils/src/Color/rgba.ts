import HEX from "./hex";
import RGB from "./rgb";
import HSL from "./hsl";
import HSLA from "./hsla";

/**
 * Representa uma cor no formato RGBA (Red, Green, Blue, Alpha).
 * @class RGBA
 */
export default class RGBA {
	/**
	 * Cria uma instância de RGBA.
	 * @param {number} red - O componente vermelho da cor (0-255).
	 * @param {number} green - O componente verde da cor (0-255).
	 * @param {number} blue - O componente azul da cor (0-255).
	 * @param {number} [alpha=1] - O canal alfa (0-1).
	 * @example
	 * ```ts
	 * const transparentRed = new RGBA(255, 0, 0, 0.5);
	 * ```
	 */
	constructor(
		public red: number,
		public green: number,
		public blue: number,
		public alpha: number = 1,
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

	get a(): number {
		return this.alpha;
	}

	toString() {
		return this.value;
	}

	/**
	 * Obtém a representação da cor como um vetor numérico no formato RGBA.
	 * @returns {[number, number, number, number]} Um array no formato `[vermelho, verde, azul, alfa]`.
	 */
	get vector(): [number, number, number, number] {
		return [this.red, this.green, this.blue, this.alpha];
	}

	/**
	 * Obtém a representação da cor como uma string no formato `rgba(r, g, b, a)`.
	 * @returns {string} A string da cor RGBA.
	 * @example
	 * ```ts
	 * const transparentRed = new RGBA(255, 0, 0, 0.5);
	 * console.log(transparentRed.value); // "rgba(255, 0, 0, 0.5)"
	 * ```
	 */
	get value(): string {
		return RGBA.stringify(this);
	}

	/**
	 * Converte a cor RGBA para sua representação HEX.
	 * @returns {HEX} Um novo objeto HEX.
	 */
	get hex(): HEX {
		const [r, g, b, a] = this.vector;
		const alpha = Math.round(a * 255);
		return HEX.parse(`#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}${alpha < 255 ? alpha.toString(16).slice(1) : ""}`);
	}

	/**
	 * Converte a cor RGBA para sua representação RGB, descartando o canal alfa.
	 * @returns {RGB} Um novo objeto RGB.
	 */
	get rgb(): RGB {
		const [r, g, b, a] = this.vector;
		return new RGB(r, g, b);
	}

	/**
	 * Converte a cor RGBA para sua representação HSLA.
	 * @returns {HSLA} Um novo objeto HSLA.
	 */
	get hsla(): HSLA {
		let [a, b, c, alpha] = this.vector;

		a /= 255;
		b /= 255;
		c /= 255;

		let d = Math.max(a, b, c),
			e = Math.min(a, b, c),
			f = 0,
			g = 0,
			h = 0.5 * (d + e);

		if (d != e) {
			if (d == a) {
				f = (60 * (b - c)) / (d - e);
			} else if (d == b) {
				f = (60 * (c - a)) / (d - e) + 120;
			} else if (d == c) {
				f = (60 * (a - b)) / (d - e) + 240;
			}
		}

		g = 0 < h && 0.5 >= h ? (d - e) / (2 * h) : (d - e) / (2 - 2 * h);
		return new HSLA(Math.round(f + 360) % 360, Math.round(g * 100), Math.round(h * 100), alpha);
	}

	/**
	 * Converte a cor RGBA para sua representação HSL.
	 * @returns {HSL} Um novo objeto HSL.
	 */
	get hsl(): HSL {
		return this.hsla.hsl;
	}

	/**
	 * Testa se uma string corresponde ao formato de cor RGBA.
	 * @param {string} text - A string a ser testada.
	 * @returns {boolean} `true` se a string for uma cor RGBA válida, caso contrário `false`.
	 * @example
	 * ```ts
	 * console.log(RGBA.test("rgba(255, 0, 0, 0.5)")); // true
	 * console.log(RGBA.test("rgb(255, 0, 0)"));      // false
	 * ```
	 */
	static test(text: string): boolean {
		return /^rgba\s*\(\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\)$/i.test(text.toLowerCase());
	}

	/**
	 * Analisa uma string RGBA e a converte para uma instância da classe `RGBA`.
	 * @param {string} text - A string da cor no formato RGBA (ex: "rgba(255, 0, 0, 0.5)").
	 * @returns {RGBA} Uma nova instância de `RGBA`.
	 * @throws {Error} Lança um erro se o formato da string for inválido.
	 * @example
	 * ```ts
	 * const transparentRed = RGBA.parse("rgba(255, 0, 0, 0.5)");
	 * console.log(transparentRed.alpha); // 0.5
	 * ```
	 */
	static parse(text: string) {
		if (!this.test(text)) {
			throw new Error("Formato de cor inválido. As cores devem estar em formato rgba (ex: rgba(255, 0, 0, 1))");
		}

		const result = text.toLowerCase().match(/[\d\.\-]+/g)!;

		let [r, g, b, a] = result.map(parseFloat);
		a = a >= 0 && a <= 1 ? parseFloat(a.toFixed(4)) : Math.floor(a) / 255;
		return new RGBA(r, g, b, a);
	}

	/**
	 * Converte uma instância de `RGBA` ou um vetor de valores RGBA em uma string.
	 * @param {RGBA | [number, number, number, number]} value - A instância ou vetor `[r, g, b, a]` a ser convertido.
	 * @returns {string} A representação da cor em formato de string RGBA.
	 * @example
	 * ```ts
	 * const transparentRed = new RGBA(255, 0, 0, 0.5);
	 * console.log(RGBA.stringify(transparentRed)); // "rgba(255, 0, 0, 0.5)"
	 *
	 * console.log(RGBA.stringify([0, 255, 0, 0.8])); // "rgba(0, 255, 0, 0.8)"
	 * ```
	 */
	static stringify(value: RGBA | [number, number, number, number]) {
		const [r, g, b, a] = Array.isArray(value) ? value : value.vector;
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}
}
