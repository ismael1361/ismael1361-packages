import HEX from "./hex";
import RGB from "./rgb";
import RGBA from "./rgba";
import HSL from "./hsl";

/**
 * Representa uma cor no formato HSLA (Hue, Saturation, Lightness, Alpha).
 * @class HSLA
 */
export default class HSLA {
	/**
	 * Cria uma instância de HSLA.
	 * @param {number} hue - O matiz da cor (0-360).
	 * @param {number} saturation - A saturação da cor (0-100).
	 * @param {number} lightness - A luminosidade da cor (0-100).
	 * @param {number} [alpha=1] - O canal alfa (0-1).
	 * @example
	 * ```ts
	 * const transparentRed = new HSLA(0, 100, 50, 0.5);
	 * ```
	 */
	constructor(
		public hue: number,
		public saturation: number,
		public lightness: number,
		public alpha: number = 1,
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

	get a(): number {
		return this.alpha;
	}

	toString() {
		return this.value;
	}

	/**
	 * Obtém a representação da cor como um vetor numérico no formato HSLA.
	 * @returns {[number, number, number, number]} Um array no formato `[matiz, saturação, luminosidade, alfa]`.
	 */
	get vector(): [number, number, number, number] {
		return [this.hue, this.saturation, this.lightness, this.alpha];
	}

	/**
	 * Obtém a representação da cor como uma string no formato `hsla(h, s%, l%, a)`.
	 * @returns {string} A string da cor HSLA.
	 * @example
	 * ```ts
	 * const transparentRed = new HSLA(0, 100, 50, 0.5);
	 * console.log(transparentRed.value); // "hsla(0, 100%, 50%, 0.5)"
	 * ```
	 */
	get value(): string {
		return `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`;
	}

	/**
	 * Converte a cor HSLA para sua representação RGBA.
	 * @returns {RGBA} Um novo objeto RGBA.
	 */
	get rgba(): RGBA {
		const hueToRgb = (a: number, b: number, c: number): number => {
			0 > c ? (c += 1) : 1 < c && (c -= 1);
			return 1 > 6 * c ? a + 6 * (b - a) * c : 1 > 2 * c ? b : 2 > 3 * c ? a + (b - a) * (2 / 3 - c) * 6 : a;
		};

		let [a, b, c, alpha] = this.vector;
		let d = 0,
			e = 0,
			f = 0,
			g: number;
		a /= 360;
		b /= 100;
		c /= 100;

		if (0 == b) {
			d = e = f = 255 * c;
		} else {
			g = f = 0;
			g = 0.5 > c ? c * (1 + b) : c + b - b * c;
			f = 2 * c - g;
			d = 255 * hueToRgb(f, g, a + 1 / 3);
			e = 255 * hueToRgb(f, g, a);
			f = 255 * hueToRgb(f, g, a - 1 / 3);
		}

		return new RGBA(Math.round(d), Math.round(e), Math.round(f), alpha);
	}

	/**
	 * Converte a cor HSLA para sua representação RGB.
	 * @returns {RGB} Um novo objeto RGB.
	 */
	get rgb(): RGB {
		return this.rgba.rgb;
	}

	/**
	 * Converte a cor HSLA para sua representação HEX.
	 * @returns {HEX} Um novo objeto HEX.
	 */
	get hex(): HEX {
		return this.rgb.hex;
	}

	/**
	 * Converte a cor HSLA para sua representação HSL, descartando o canal alfa.
	 * @returns {HSL} Um novo objeto HSL.
	 */
	get hsl(): HSL {
		return new HSL(this.hue, this.saturation, this.lightness);
	}

	/**
	 * Testa se uma string corresponde ao formato de cor HSLA.
	 * @param {string} text - A string a ser testada.
	 * @returns {boolean} `true` se a string for uma cor HSLA válida, caso contrário `false`.
	 * @example
	 * ```ts
	 * console.log(HSLA.test("hsla(120, 100%, 50%, 0.5)")); // true
	 * console.log(HSLA.test("hsl(120, 100%, 50%)"));    // false
	 * ```
	 */
	static test(text: string): boolean {
		return /^hsla\s*\(\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)%\s*,\s*([\d\.\-]+)%\s*,\s*([\d\.\-]+)\s*\)$/i.test(text.toLowerCase());
	}

	/**
	 * Analisa uma string HSLA e a converte para uma instância da classe `HSLA`.
	 * @param {string} text - A string da cor no formato HSLA (ex: "hsla(0, 100%, 50%, 0.5)").
	 * @returns {HSLA} Uma nova instância de `HSLA`.
	 * @throws {Error} Lança um erro se o formato da string for inválido.
	 * @example
	 * ```ts
	 * const transparentRed = HSLA.parse("hsla(0, 100%, 50%, 0.5)");
	 * console.log(transparentRed.alpha); // 0.5
	 * ```
	 */
	static parse(text: string) {
		if (!this.test(text)) {
			throw new Error("Formato de cor inválido. As cores devem estar em formato hsl (ex: hsla(255, 0%, 0%, 1))");
		}

		const result = text.toLowerCase().match(/[\d\.\-]+/g)!;

		const [h, s, l, a] = result.map(Number);
		return new HSLA(h, s, l, a);
	}

	/**
	 * Converte uma instância de `HSLA` ou um vetor de valores HSLA em uma string.
	 * @param {HSL | [number, number, number] | [number, number, number, number]} value - A instância ou vetor `[h, s, l, a]` a ser convertido.
	 * @returns {string} A representação da cor em formato de string HSLA.
	 * @example
	 * ```ts
	 * const transparentRed = new HSLA(0, 100, 50, 0.5);
	 * console.log(HSLA.stringify(transparentRed)); // "hsla(0, 100%, 50%, 0.5)"
	 *
	 * // Também funciona com um vetor de valores
	 * console.log(HSLA.stringify([120, 100, 50, 0.8])); // "hsla(120, 100%, 50%, 0.8)"
	 * ```
	 */
	static stringify(value: HSL | [number, number, number] | [number, number, number, number]) {
		const [h, s, l, a = 1] = Array.isArray(value) ? value : value.vector;
		return `hsla(${h}, ${s}%, ${l}%, ${a})`;
	}
}
