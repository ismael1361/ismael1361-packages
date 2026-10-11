import colorNames from "./colorNames";
import generatePalette from "./generatePalette";
import { ColorPalette, ColorPalettes, colorPalettes } from "./palettes";
import HEX from "./hex";
import RGB from "./rgb";
import RGBA from "./rgba";
import HSL from "./hsl";
import HSLA from "./hsla";

export { colorNames, HEX, RGB, RGBA, HSL, HSLA };

export type ColorValue = string | Color | HEX | RGB | RGBA | HSL | HSLA;

export class Color {
	public value: string;
	/**
	 * Uma classe robusta para manipulação e conversão de cores.
	 * Permite criar, modificar e converter cores entre diferentes formatos como HEX, RGB, HSL, etc.
	 *
	 * @class Color
	 * @param {ColorValue} value - O valor inicial da cor. Pode ser uma string (ex: "#FF0000", "rgb(255,0,0)", "red"),
	 * ou uma instância de outra classe de cor (`Color`, `HEX`, `RGB`, `RGBA`, `HSL`, `HSLA`).
	 *
	 * @example
	 * ```ts
	 * // Criando uma cor a partir de uma string HEX
	 * const red = new Color("#FF0000");
	 *
	 * // Criando uma cor a partir de um nome CSS
	 * const blue = new Color("blue");
	 *
	 * // Criando uma cor a partir de outra instância de Color
	 * const anotherRed = new Color(red);
	 *
	 * // Acessando diferentes formatos
	 * console.log(red.rgb.value);   // "rgb(255, 0, 0)"
	 * console.log(blue.hsl.value);  // "hsl(240, 100%, 50%)"
	 * ```
	 */
	constructor(value: ColorValue) {
		if (typeof value === "string") {
			this.value = value;
		} else if (value instanceof Color) {
			this.value = value.value;
		} else {
			this.value = value.value;
		}
	}

	/**
	 * Converte o valor da cor interna (string) para um objeto RGBA estruturado.
	 * Este getter é o principal ponto de conversão, lidando com vários formatos de cor:
	 * HEX, RGB, RGBA, HSL, HSLA e nomes de cores CSS.
	 * @returns {RGBA} Um objeto RGBA representando a cor.
	 */
	get rgba(): RGBA {
		const color = this.value;

		if (HEX.test(color)) {
			return HEX.parse(color).rgba;
		} else if (RGB.test(color)) {
			return RGB.parse(color).rgba;
		} else if (RGBA.test(color)) {
			return RGBA.parse(color);
		} else if (HSL.test(color)) {
			return HSL.parse(color).rgba;
		} else if (HSLA.test(color)) {
			return HSLA.parse(color).rgba;
		} else if (color in colorNames) {
			return HEX.parse((colorNames as any)[color]).rgba;
		}

		try {
			const ctx = document.createElement("canvas").getContext("2d");
			if (ctx) {
				ctx.fillStyle = color;
				const rgba = ctx.fillStyle;
				return RGBA.parse(rgba);
			}
		} catch {}

		return new RGBA(0, 0, 0, 1);
	}

	/**
	 * Converte a cor para sua representação RGB.
	 * Este getter retorna um objeto `RGB` contendo os componentes
	 * vermelho, verde e azul, descartando o canal alfa.
	 * @returns {RGB} Um novo objeto RGB representando a cor.
	 */
	get rgb(): RGB {
		return this.rgba.rgb;
	}

	/**
	 * Obtém a representação da cor como um vetor numérico no formato RGBA.
	 * O vetor é um array no formato `[vermelho, verde, azul, alfa]`.
	 * - Os componentes RGB variam de 0 a 255.
	 * - O componente alfa (transparência) varia de 0 (transparente) a 1 (opaco).
	 * @returns {[number, number, number, number]} Um array contendo os quatro componentes da cor.
	 */
	get vector(): [number, number, number, number] {
		return this.rgba.vector;
	}

	/**
	 * Obtém o valor alfa (transparência) da cor.
	 * @returns {number} O valor alfa, entre 0 (transparente) e 1 (opaco).
	 */
	get alpha(): number {
		return this.rgba.alpha;
	}

	/**
	 * Define um novo valor alfa (transparência) para a cor.
	 * @param {number} alpha - O novo valor alfa, entre 0 (transparente) e 1 (opaco).
	 */
	set alpha(alpha: number) {
		const [r, g, b] = this.vector;
		this.value = new RGBA(r, g, b, alpha).value;
	}

	/**
	 * Converte a cor para sua representação em formato HEX.
	 * Este getter retorna um objeto `HEX` que encapsula o valor hexadecimal da cor,
	 * incluindo o canal alfa quando aplicável (ex: "#RRGGBB" ou "#RRGGBBAA").
	 * @returns {HEX} Um novo objeto HEX representando a cor.
	 */
	get hex(): HEX {
		return this.rgba.hex;
	}

	/**
	 * Converte a cor para sua representação HSL (Hue, Saturation, Lightness).
	 * Este getter retorna um objeto `HSL` contendo os componentes de matiz,
	 * saturação e luminosidade, descartando o canal alfa.
	 * @returns {HSL} Um novo objeto HSL representando a cor.
	 */
	get hsl(): HSL {
		return this.rgba.hsl;
	}

	/**
	 * Converte a cor para sua representação HSLA (Hue, Saturation, Lightness, Alpha).
	 * Este getter retorna um objeto `HSLA` contendo os componentes de matiz,
	 * saturação, luminosidade e o canal alfa.
	 * @returns {HSLA} Um novo objeto HSLA representando a cor.
	 */
	get hsla(): HSLA {
		return this.rgba.hsla;
	}

	toString(): string {
		return this.rgba.toString();
	}

	/**
	 * Converte a cor para sua equivalente em escala de cinza.
	 * O valor da escala de cinza é calculado como a média dos componentes vermelho, verde e azul.
	 * @returns {RGBA} Um novo objeto RGBA representando a cor em escala de cinza.
	 */
	get grayScale(): RGBA {
		const [r, g, b, a] = this.rgba.vector;
		const gray = Math.round((r + g + b) / 3);
		return new RGBA(gray, gray, gray, a);
	}

	/**
	 * Converte a cor para preto ou branco puro com base em sua luminosidade (limiarização).
	 * Se a média dos componentes RGB for maior ou igual a 127.5, retorna branco; caso contrário, retorna preto.
	 * O canal alfa é preservado.
	 * @returns {RGBA} Um novo objeto RGBA representando a cor como preto ou branco.
	 */
	get watershed(): RGBA {
		const [r, g, b, a] = this.rgba.vector;
		if ((r + g + b) / 3 >= 255 / 2) {
			return new RGBA(255, 255, 255, a);
		} else {
			return new RGBA(0, 0, 0, a);
		}
	}

	/**
	 * Converte a cor para sua versão mais saturada e vibrante.
	 *
	 * Este método preserva o matiz (hue) e o canal alfa originais,
	 * mas define a saturação como 100% e a luminosidade como 50% para
	 * obter a representação mais pura e intensa da cor.
	 *
	 * @returns {RGBA} Um novo objeto RGBA representando a cor saturada.
	 */
	get growing(): RGBA {
		const { hue } = this.hsl;
		const [r, g, b] = new HSL(hue, 100, 50).rgb.vector;
		return new RGBA(r, g, b, this.alpha);
	}

	/**
	 * Calcula a cor negativa (inversa).
	 * Cada componente de cor (vermelho, verde e azul) é subtraído de 255. O canal alfa é preservado.
	 * @returns {RGBA} Um novo objeto RGBA representando a cor negativa.
	 */
	get negative(): RGBA {
		const [a, b, c, d] = this.rgba.vector;
		return new RGBA(Math.round(255 - a), Math.round(255 - b), Math.round(255 - c), d);
	}

	/**
	 * Calcula o brilho percebido (luminância) da cor.
	 * A luminância é calculada usando a fórmula padrão (0.2126*R + 0.7152*G + 0.0722*B),
	 * que leva em conta a percepção humana do brilho das cores.
	 * @returns {number} O valor da luminância, de 0 (preto) a 255 (branco).
	 */
	get luminance(): number {
		const [r, g, b] = this.rgba.vector;
		return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
	}

	/**
	 * Gera uma paleta de cores completa com base na cor atual.
	 *
	 * A paleta é um objeto que contém várias tonalidades e sombras da cor base,
	 * geralmente indexadas por chaves numéricas (ex: '50', '100', ..., '900'),
	 * onde a chave '500' costuma representar a cor original.
	 *
	 * A estrutura também pode incluir outros esquemas de cores, como
	 * complementares, análogas, etc.
	 *
	 * @returns {ColorPalette} Um objeto contendo a paleta de cores gerada.
	 *
	 * @example
	 * ```ts
	 * // Acessando um tom específico da paleta (a cor base '500')
	 * const baseColor = new Color("#f44336").palette["500"];
	 * console.log(baseColor.hex.value); // => "#f44336"
	 *
	 * // Acessando um tom mais escuro
	 * const darkRedHex = new Color("#f44336").palette["700"].hex.value;
	 * console.log(darkRedHex); // => (um tom de vermelho mais escuro)
	 * ```
	 */
	get palette(): ColorPalette {
		return generatePalette(this);
	}

	/**
	 * Calcula a distância euclidiana entre esta cor e outra no espaço de cores RGB.
	 * A distância é uma medida de quão diferentes as duas cores são. Um valor de 0 significa que as cores são idênticas.
	 * O canal alfa é ignorado no cálculo.
	 * @param {ColorValue} color - A cor com a qual comparar.
	 * @returns {number} A distância entre as duas cores.
	 *
	 * @example
	 * ```ts
	 * const color1 = new Color("#FF0000"); // Vermelho
	 * const color2 = new Color("#00FF00"); // Verde
	 * console.log(color1.distance(color2)); // Output: 255
	 * ```
	 */
	distance(color: ColorValue): number {
		const [r1, g1, b1, a1] = this.rgba.vector;
		const [r2, g2, b2, a2] = new Color(color).rgba.vector;
		return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
	}

	/**
	 * Mistura a cor atual com outra cor em uma determinada proporção.
	 *
	 * @param {ColorValue} color - A cor com a qual misturar.
	 * @param {number} ratio - A proporção da mistura, onde 0 é a cor original e 1 é a cor de destino. Um valor de 0.5 resulta em uma mistura 50/50.
	 * @returns {Color} Um novo objeto `Color` representando a cor misturada.
	 *
	 * @example
	 * ```ts
	 * const red = new Color("#FF0000");
	 * const blue = new Color("#0000FF");
	 *
	 * // Mistura 50% de vermelho com 50% de azul
	 * const purple = red.blend(blue, 0.5);
	 * console.log(purple.hex.value); // Output: "#800080" (Roxo)
	 * ```
	 */
	blend(color: ColorValue, ratio: number): Color {
		const [r1, g1, b1, a1] = this.rgba.vector;
		const [r2, g2, b2, a2] = new Color(color).rgba.vector;
		const r = Math.round(r1 + (r2 - r1) * ratio);
		const g = Math.round(g1 + (g2 - g1) * ratio);
		const b = Math.round(b1 + (b2 - b1) * ratio);
		const a = a1 + (a2 - a1) * ratio;
		return new Color(new RGBA(r, g, b, a));
	}

	/**
	 * Escurece a cor misturando-a com preto.
	 *
	 * @param {number} ratio - A proporção da mistura, onde 0 não altera a cor e 1 a torna preta.
	 * @returns {Color} Um novo objeto `Color` representando a cor escurecida.
	 *
	 * @example
	 * ```ts
	 * const blue = new Color("#0000FF");
	 * const darkBlue = blue.darken(0.5);
	 * console.log(darkBlue.hex.value); // Output: "#000080"
	 * ```
	 */
	darken(ratio: number): Color {
		return this.blend(new RGBA(0, 0, 0, 1), ratio);
	}

	/**
	 * Clareia a cor misturando-a com branco.
	 *
	 * @param {number} ratio - A proporção da mistura, onde 0 não altera a cor e 1 a torna branca.
	 * @returns {Color} Um novo objeto `Color` representando a cor clareada.
	 *
	 * @example
	 * ```ts
	 * const red = new Color("#FF0000");
	 * const pink = red.lighten(0.5);
	 * console.log(pink.hex.value); // Output: "#FF8080"
	 * ```
	 */
	lighten(ratio: number): Color {
		return this.blend(new RGBA(255, 255, 255, 1), ratio);
	}

	/**
	 * Compara o brilho percebido (luminância) com outra cor.
	 *
	 * @param {ColorValue} color - A cor com a qual comparar.
	 * @returns {number} Um valor entre 0 e 1, onde 1 significa brilho idêntico e 0 significa a diferença máxima (preto vs. branco).
	 *
	 * @example
	 * ```ts
	 * const white = new Color("white");
	 * const black = new Color("black");
	 * const gray = new Color("gray");
	 *
	 * console.log(white.compareBrightness(black)); // Output: 0
	 * console.log(white.compareBrightness(white)); // Output: 1
	 * console.log(gray.compareBrightness(white));  // Output: 0.5019...
	 * ```
	 */
	compareBrightness(color: ColorValue): number {
		const lum1 = new Color(this.rgba).luminance;
		const lum2 = new Color(color).luminance;
		return 1 - Math.abs(lum2 - lum1) / 255;
	}

	/**
	 * Ajusta o brilho da cor, clareando-a ou escurecendo-a.
	 *
	 * @param {number} ratio - A proporção do ajuste. Um valor positivo (ex: 0.3) clareia a cor,
	 * e um valor negativo (ex: -0.3) a escurece.
	 * @returns {Color} Um novo objeto `Color` com o brilho ajustado.
	 *
	 * @example
	 * ```ts
	 * const blue = new Color("#0000FF");
	 *
	 * // Clareia o azul em 30%
	 * const lightBlue = blue.brightness(0.3);
	 * console.log(lightBlue.hex.value); // Output: "#4D4DFF"
	 *
	 * // Escurece o azul em 30%
	 * const darkBlue = blue.brightness(-0.3);
	 * console.log(darkBlue.hex.value); // Output: "#0000B3"
	 * ```
	 */
	brightness(ratio: number): Color {
		return ratio > 0 ? this.lighten(Math.abs(ratio)) : this.darken(Math.abs(ratio));
	}

	/**
	 * Analisa uma string de cor e a converte para o objeto de classe correspondente.
	 *
	 * @param {string} str - A string da cor a ser analisada (ex: "#FF0000", "rgb(255,0,0)", "hsl(0, 100%, 50%)").
	 * @returns {HEX | RGB | RGBA | HSL | HSLA} Uma instância da classe de cor correspondente.
	 * @throws {Error} Lança um erro se o formato da string da cor for inválido.
	 *
	 * @example
	 * ```ts
	 * const hexColor = Color.parse("#FF5733");
	 * console.log(hexColor instanceof HEX); // Output: true
	 * console.log(hexColor.value); // Output: "#FF5733"
	 *
	 * const rgbColor = Color.parse("rgb(255, 87, 51)");
	 * console.log(rgbColor instanceof RGB); // Output: true
	 * ```
	 */
	static parse(str: string): HEX | RGB | RGBA | HSL | HSLA {
		str = String(str).trim().toLowerCase();
		if (HEX.test(str)) return HEX.parse(str);
		if (RGB.test(str)) return RGB.parse(str);
		if (RGBA.test(str)) return RGBA.parse(str);
		if (HSL.test(str)) return HSL.parse(str);
		if (HSLA.test(str)) return HSLA.parse(str);
		throw new Error(`Invalid color: ${str}`);
	}

	/**
	 * Converte um valor de cor para um formato de destino específico.
	 *
	 * @param {ColorValue} value - O valor da cor a ser convertida (ex: "#FF0000", "rgb(255,0,0)", etc.).
	 * @param {T} to - O formato de destino desejado ("hex", "rgb", "rgba", "hsl", "hsla").
	 * @returns {HEX | RGB | RGBA | HSL | HSLA} Uma nova instância da classe de cor correspondente ao formato de destino.
	 *
	 * @example
	 * ```ts
	 * const redRgb = Color.convert("#FF0000", "rgb");
	 * console.log(redRgb instanceof RGB); // Output: true
	 * console.log(redRgb.value); // Output: "rgb(255, 0, 0)"
	 *
	 * const blueHsla = Color.convert("blue", "hsla");
	 * console.log(blueHsla instanceof HSLA); // Output: true
	 * console.log(blueHsla.value); // Output: "hsla(240, 100%, 50%, 1)"
	 * ```
	 */
	static convert<T extends "hex" | "rgb" | "rgba" | "hsl" | "hsla">(
		value: ColorValue,
		to: T,
	): T extends "hex" ? HEX : T extends "rgb" ? RGB : T extends "rgba" ? RGBA : T extends "hsl" ? HSL : HSLA {
		const color = new Color(value);
		switch (to) {
			case "hex":
				return color.hex as any;
			case "rgb":
				return color.rgb as any;
			case "rgba":
				return color.rgba as any;
			case "hsl":
				return color.hsl as any;
			case "hsla":
				return color.hsla as any;
			default:
				return color.hsla as any;
		}
	}

	/**
	 * Cria uma nova instância de `Color` a partir de uma string hexadecimal.
	 * @param {string} hex - A string da cor no formato HEX (ex: "#FF0000").
	 * @returns {Color} Uma nova instância de `Color`.
	 * @example
	 * ```ts
	 * const red = Color.fromHex("#FF0000");
	 * ```
	 */
	static fromHex(hex: string): Color {
		return new Color(hex);
	}

	/**
	 * Cria uma nova instância de `Color` a partir de valores RGB.
	 * @param {number} red - O componente vermelho (0-255).
	 * @param {number} green - O componente verde (0-255).
	 * @param {number} blue - O componente azul (0-255).
	 * @returns {Color} Uma nova instância de `Color`.
	 * @example
	 * ```ts
	 * const blue = Color.fromRgb(0, 0, 255);
	 * ```
	 */
	static fromRgb(red: number, green: number, blue: number): Color {
		return new Color(new RGB(red, green, blue).value);
	}

	/**
	 * Cria uma nova instância de `Color` a partir de valores RGBA.
	 * @param {number} red - O componente vermelho (0-255).
	 * @param {number} green - O componente verde (0-255).
	 * @param {number} blue - O componente azul (0-255).
	 * @param {number} alpha - O componente alfa (0-1).
	 * @returns {Color} Uma nova instância de `Color`.
	 * @example
	 * ```ts
	 * const transparentGreen = Color.fromRgba(0, 255, 0, 0.5);
	 * ```
	 */
	static fromRgba(red: number, green: number, blue: number, alpha: number): Color {
		return new Color(new RGBA(red, green, blue, alpha).value);
	}

	/**
	 * Cria uma nova instância de `Color` a partir de valores HSL.
	 * @param {number} hue - O matiz (0-360).
	 * @param {number} saturation - A saturação (0-100).
	 * @param {number} lightness - A luminosidade (0-100).
	 * @returns {Color} Uma nova instância de `Color`.
	 * @example
	 * ```ts
	 * const cyan = Color.fromHsl(180, 100, 50);
	 * ```
	 */
	static fromHsl(hue: number, saturation: number, lightness: number): Color {
		return new Color(new HSL(hue, saturation, lightness).value);
	}

	/**
	 * Cria uma nova instância de `Color` a partir de valores HSLA.
	 * @param {number} hue - O matiz (0-360).
	 * @param {number} saturation - A saturação (0-100).
	 * @param {number} lightness - A luminosidade (0-100).
	 * @param {number} alpha - O componente alfa (0-1).
	 * @returns {Color} Uma nova instância de `Color`.
	 * @example
	 * const transparentMagenta = Color.fromHsla(300, 100, 50, 0.5);
	 */
	static fromHsla(hue: number, saturation: number, lightness: number, alpha: number): Color {
		return new Color(new HSLA(hue, saturation, lightness, alpha).value);
	}

	/**
	 * Gera uma cor aleatória.
	 * @returns {Color} Uma nova instância de `Color` com uma cor aleatória.
	 * @example
	 * ```ts
	 * const randomColor = Color.random();
	 * console.log(randomColor.hex.value); // ex: "#A4F2B9"
	 * ```
	 */
	static random(): Color {
		return this.fromRgb(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
	}

	/**
	 * Gera uma cor determinística a partir de uma string de texto.
	 * Útil para atribuir cores consistentes a nomes de usuário, tags, etc.
	 * @param {string} text - O texto a ser convertido em cor.
	 * @returns {Color} Uma nova instância de `Color` baseada no texto.
	 * @example
	 * ```ts
	 * const userColor = Color.textToColor("username123");
	 * console.log(userColor.hex.value); // Sempre retornará a mesma cor para "username123"
	 * ```
	 */
	static textToColor(text: string): Color {
		const hash = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
		return this.fromHsl(hash % 360, 100, 50);
	}

	/**
	 * Calcula a distância euclidiana entre duas cores no espaço de cores RGB.
	 * @param {ColorValue} color1 - A primeira cor.
	 * @param {ColorValue} color2 - A segunda cor.
	 * @returns {number} A distância entre as duas cores (0 para idênticas).
	 * @example
	 * const distance = Color.distance("red", "blue");
	 * console.log(distance); // Output: 255
	 */
	static distance(color1: ColorValue, color2: ColorValue): number {
		return new Color(color1).distance(color2);
	}

	/**
	 * Acessa uma coleção de paletas de cores predefinidas (ex: Material Design).
	 *
	 * Este getter estático retorna um objeto onde cada chave é o nome de uma cor
	 * (ex: 'red', 'blue') e o valor é a paleta de tons correspondente.
	 * Cada paleta é um objeto com chaves numéricas ('50', '100', ..., '900')
	 * que representam as diferentes tonalidades da cor.
	 *
	 * @static
	 * @returns {ColorPalettes} Um objeto contendo as paletas de cores.
	 *
	 * @example
	 * ```ts
	 * // Obtendo a paleta de cor 'red'
	 * const redPalette = Color.palettes.red;
	 *
	 * // Acessando o tom '500' (base) da paleta 'red'
	 * const red500 = redPalette["500"];
	 * console.log(red500.hex.value); // ex: "#f44336"
	 *
	 * // Acessando diretamente o valor hexadecimal de um tom mais claro
	 * const red100Hex = Color.palettes.red["100"].hex.value;
	 * console.log(red100Hex); // ex: "#ffcdd2"
	 *
	 * // Acessando um tom mais escuro de outra paleta
	 * const blue700 = Color.palettes.blue["700"];
	 * console.log(blue700.rgb.value); // ex: "rgb(25, 118, 210)"
	 * ```
	 */
	static get palettes(): ColorPalettes {
		return colorPalettes;
	}
}
