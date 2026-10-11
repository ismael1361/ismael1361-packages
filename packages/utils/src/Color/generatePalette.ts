import { ColorValue, Color } from "./index";
import type { ColorPalette } from "./palettes";

const generatePalette = (value: ColorValue): ColorPalette => {
	const color = new Color(value);
	const { h, s, l } = color.hsl;

	// Definir os ajustes de lightness e saturation para cada variante
	const mainVariants = [
		{ name: "50" as const, lightness: 96, saturation: Math.min(s + 13, 100) },
		{ name: "100" as const, lightness: 90, saturation: Math.min(s + 13, 100) },
		{ name: "200" as const, lightness: 80, saturation: Math.min(s, 100) },
		{ name: "300" as const, lightness: 70, saturation: Math.min(s - 10, 100) },
		{ name: "400" as const, lightness: 62, saturation: Math.min(s - 6, 100) },
		{ name: "500" as const, lightness: l, saturation: s },
		{ name: "600" as const, lightness: Math.max(l - 4, 0), saturation: Math.min(s - 7, 100) },
		{ name: "700" as const, lightness: Math.max(l - 11, 0), saturation: Math.min(s - 13, 100) },
		{ name: "800" as const, lightness: Math.max(l - 16, 0), saturation: Math.min(s - 13, 100) },
		{ name: "900" as const, lightness: Math.max(l - 19, 0), saturation: Math.min(s - 18, 100) },
	];

	const accentVariants = [
		{ name: "A100" as const, lightness: 75, saturation: 100 },
		{ name: "A200" as const, lightness: 65, saturation: 100 },
		{ name: "A400" as const, lightness: 54, saturation: 100 },
		{ name: "A700" as const, lightness: 42, saturation: 100 },
	];

	const palette: Partial<ColorPalette> = {};

	// Gerar cores principais
	mainVariants.forEach((variant) => {
		palette[variant.name] = Color.fromHsl(h, variant.saturation, variant.lightness);
	});

	// Gerar cores de acento
	accentVariants.forEach((variant) => {
		palette[variant.name] = Color.fromHsl(h, variant.saturation, variant.lightness);
	});

	return palette as ColorPalette;
};

export default generatePalette;
