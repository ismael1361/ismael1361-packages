import { Color, HEX, HSL, HSLA, RGB, RGBA } from "./index";

describe("Classe Color", () => {
	describe("Construtor", () => {
		it("deve criar uma cor a partir de uma string HEX", () => {
			const color = new Color("#ff0000");
			expect(color.rgb.r).toBe(255);
			expect(color.rgb.g).toBe(0);
			expect(color.rgb.b).toBe(0);
		});

		it("deve criar uma cor a partir de um nome de cor CSS", () => {
			const color = new Color("tomato");
			expect(color.rgb.r).toBe(255);
			expect(color.rgb.g).toBe(99);
			expect(color.rgb.b).toBe(71);
		});

		it("deve criar uma cor a partir de um objeto de classe de cor (ex: RGB)", () => {
			const color = new Color(new RGB(255, 0, 0));
			expect(color.hex.value.toLowerCase()).toBe("#ff0000");
		});

		it("deve criar uma cor a partir de outra instância de Color (clonagem)", () => {
			const originalColor = new Color("#ff0000");
			const clonedColor = new Color(originalColor);
			expect(clonedColor).not.toBe(originalColor);
			expect(clonedColor.hex.value).toBe(originalColor.hex.value);
		});

		it("deve usar o fallback do canvas para nomes de cores", () => {
			const color = new Color("rebeccapurple");
			expect(color.rgb.r).toBe(102);
			expect(color.rgb.g).toBe(51);
			expect(color.rgb.b).toBe(153);
		});
	});

	describe("Getters e Setters", () => {
		const color = new Color(new RGBA(100, 150, 200, 0.8));

		it("deve retornar a cor em RGBA", () => {
			const rgba = color.rgba;
			expect(rgba.r).toBe(100);
			expect(rgba.g).toBe(150);
			expect(rgba.b).toBe(200);
			expect(rgba.a).toBe(0.8);
		});

		it("deve retornar a cor em RGB", () => {
			const rgb = color.rgb;
			expect(rgb.r).toBe(100);
			expect(rgb.g).toBe(150);
			expect(rgb.b).toBe(200);
		});

		it("deve retornar o vetor da cor", () => {
			expect(color.vector).toEqual([100, 150, 200, 0.8]);
		});

		it("deve retornar e definir o canal alfa", () => {
			const newColor = new Color(color);
			expect(newColor.alpha).toBe(0.8);
			newColor.alpha = 0.5;
			expect(newColor.alpha).toBe(0.5);
			expect(newColor.rgba.a).toBe(0.5);
		});

		it("deve retornar a cor em HEX", () => {
			expect(new Color("red").hex.value.toLowerCase()).toBe("#ff0000");
		});

		it("deve retornar a cor em HSL", () => {
			const hsl = new Color("blue").hsl;
			expect(hsl.h).toBe(240);
			expect(hsl.s).toBe(100);
			expect(hsl.l).toBe(50);
		});

		it("deve retornar a cor em HSLA", () => {
			const hsla = new Color("rgba(0, 0, 255, 0.5)").hsla;
			expect(hsla.h).toBe(240);
			expect(hsla.s).toBe(100);
			expect(hsla.l).toBe(50);
			expect(hsla.a).toBe(0.5);
		});

		it("deve converter para escala de cinza (grayScale)", () => {
			const gray = new Color("#ff8800").grayScale;
			// (255 + 136 + 0) / 3 = 130.33 -> 130
			expect(gray.r).toBe(130);
			expect(gray.g).toBe(130);
			expect(gray.b).toBe(130);
		});

		it("deve converter para preto ou branco (watershed)", () => {
			const lightColor = new Color("#cccccc");
			const darkColor = new Color("#333333");
			expect(lightColor.watershed.rgb.value).toBe("rgb(255, 255, 255)");
			expect(darkColor.watershed.rgb.value).toBe("rgb(0, 0, 0)");
		});

		it("deve obter a cor mais saturada (growing)", () => {
			const pastelRed = new Color("hsl(0, 50%, 75%)");
			const growingRed = pastelRed.growing;
			const hsl = growingRed.hsl;
			expect(hsl.h).toBe(0);
			expect(hsl.s).toBe(100);
			expect(hsl.l).toBe(50);
		});

		it("deve obter a cor negativa", () => {
			const original = new Color("rgb(50, 100, 150)");
			const negative = original.negative;
			expect(negative.rgb.value).toBe("rgb(205, 155, 105)");
		});

		it("deve calcular a luminância corretamente", () => {
			expect(new Color("white").luminance).toBe(255);
			expect(new Color("black").luminance).toBe(0);
			// 0.2126 * 255 = 54.213 -> 54
			expect(new Color("red").luminance).toBe(54);
		});
	});

	describe("Métodos de Instância", () => {
		const red = new Color("red");
		const blue = new Color("blue");

		it("deve calcular a distância para outra cor", () => {
			expect(red.distance(blue)).toBeCloseTo(360.62, 2);
			expect(red.distance("red")).toBe(0);
		});

		it("deve misturar com outra cor (blend)", () => {
			const purple = red.blend(blue, 0.5);
			expect(purple.hex.value).toBe("#800080");
		});

		it("deve escurecer a cor (darken)", () => {
			const darkBlue = new Color("blue").darken(0.5);
			expect(darkBlue.hex.value).toBe("#000080");
		});

		it("deve clarear a cor (lighten)", () => {
			const pink = new Color("red").lighten(0.5);
			expect(pink.hex.value.toLowerCase()).toBe("#ff8080");
		});

		it("deve ajustar o brilho (brightness)", () => {
			const lightBlue = new Color("blue").brightness(0.3);
			const darkBlue = new Color("blue").brightness(-0.3);
			expect(lightBlue.hex.value.toLowerCase()).toBe("#4d4dff");
			expect(darkBlue.hex.value.toLowerCase()).toBe("#0000b3");
		});

		it("deve comparar o brilho com outra cor", () => {
			const white = new Color("white");
			const black = new Color("black");
			expect(white.compareBrightness(black)).toBe(0);
			expect(white.compareBrightness(white)).toBe(1);
		});
	});

	describe("Métodos Estáticos", () => {
		it("deve fazer o parse de uma string de cor válida", () => {
			const color = Color.parse("rgb(255, 0, 0)") as RGB;
			expect(color).toBeInstanceOf(RGB);
			expect(color.hex.value.toLowerCase()).toBe("#ff0000");
		});

		it("deve lançar erro ao fazer parse de string inválida", () => {
			expect(() => Color.parse("invalid")).toThrow("Invalid color: invalid");
		});

		it("deve converter um formato de cor para outro", () => {
			const hex = Color.convert("rgb(255, 0, 0)", "hex");
			expect(hex).toBeInstanceOf(HEX);
			expect(hex.value.toLowerCase()).toBe("#ff0000");

			const hsla = Color.convert("blue", "hsla");
			expect(hsla).toBeInstanceOf(HSLA);
			expect(hsla.value.toLowerCase()).toBe("hsla(240, 100%, 50%, 1)");
		});

		it("deve criar uma cor usando fromHex", () => {
			const color = Color.fromHex("#00ff00");
			expect(color.rgb.value).toBe("rgb(0, 255, 0)");
		});

		it("deve criar uma cor usando fromRgb", () => {
			const color = Color.fromRgb(255, 0, 0);
			expect(color.rgb.value).toBe("rgb(255, 0, 0)");
		});

		it("deve criar uma cor usando fromRgba", () => {
			const color = Color.fromRgba(0, 255, 0, 0.5);
			expect(color.rgba.value).toBe("rgba(0, 255, 0, 0.5)");
		});

		it("deve criar uma cor usando fromHsl", () => {
			const color = Color.fromHsl(0, 100, 50);
			expect(color.hex.value.toLowerCase()).toBe("#ff0000");
		});

		it("deve criar uma cor usando fromHsla", () => {
			const color = Color.fromHsla(120, 100, 50, 0.5);
			expect(color.hsla.value).toBe("hsla(120, 100%, 50%, 0.5)");
		});

		it("deve gerar uma cor aleatória", () => {
			const randomColor = Color.random();
			const { r, g, b, a } = randomColor.rgba;
			expect(r).toBeGreaterThanOrEqual(0);
			expect(r).toBeLessThanOrEqual(255);
			expect(g).toBeGreaterThanOrEqual(0);
			expect(g).toBeLessThanOrEqual(255);
			expect(b).toBeGreaterThanOrEqual(0);
			expect(b).toBeLessThanOrEqual(255);
			expect(a).toBe(1);
		});

		it("deve gerar uma cor determinística a partir de um texto", () => {
			const color1 = Color.textToColor("test-string");
			const color2 = Color.textToColor("test-string");
			const color3 = Color.textToColor("another-string");
			expect(color1.hex.value).toBe(color2.hex.value);
			expect(color1.hex.value).not.toBe(color3.hex.value);
		});

		it("deve calcular a distância entre duas cores estaticamente", () => {
			const distance = Color.distance("#ff0000", "#0000ff");
			expect(distance).toBeCloseTo(360.62, 2);
		});

		it("deve calcular a distância entre duas cores", () => {
			const color1 = new Color("#ff0000");
			const color2 = new Color("#0000ff");
			const distance = color1.distance(color2);
			expect(distance).toBeCloseTo(360.62, 2);
		});

		it("palettes", () => {
			const color = Color.palettes.red["500"];
			expect(color).toBeInstanceOf(Color);
			expect(color.hex.value.toLowerCase()).toBe("#f44336");
		});
	});
});
