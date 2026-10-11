import { Color } from "./index";

export interface ColorPaletteMain {
	"50": Color;
	"100": Color;
	"200": Color;
	"300": Color;
	"400": Color;
	"500": Color;
	"600": Color;
	"700": Color;
	"800": Color;
	"900": Color;
}

export interface ColorPalette extends ColorPaletteMain {
	A100: Color;
	A200: Color;
	A400: Color;
	A700: Color;
}

export type ColorPaletteName = keyof ColorPalette;

export interface ColorPalettes {
	red: ColorPalette;
	pink: ColorPalette;
	purple: ColorPalette;
	deepPurple: ColorPalette;
	indigo: ColorPalette;
	blue: ColorPalette;
	lightBlue: ColorPalette;
	cyan: ColorPalette;
	teal: ColorPalette;
	green: ColorPalette;
	lightGreen: ColorPalette;
	lime: ColorPalette;
	yellow: ColorPalette;
	amber: ColorPalette;
	orange: ColorPalette;
	deepOrange: ColorPalette;
	brown: ColorPaletteMain;
	grey: ColorPaletteMain;
	blueGrey: ColorPaletteMain;
}

export const colorPalettes: ColorPalettes = {
	get red(): ColorPalette {
		return {
			"50": Color.fromHex("#ffebee"),
			"100": Color.fromHex("#ffcdd2"),
			"200": Color.fromHex("#ef9a9a"),
			"300": Color.fromHex("#e57373"),
			"400": Color.fromHex("#ef5350"),
			"500": Color.fromHex("#f44336"),
			"600": Color.fromHex("#e53935"),
			"700": Color.fromHex("#d32f2f"),
			"800": Color.fromHex("#c62828"),
			"900": Color.fromHex("#b71c1c"),
			"A100": Color.fromHex("#ff8a80"),
			"A200": Color.fromHex("#ff5252"),
			"A400": Color.fromHex("#ff1744"),
			"A700": Color.fromHex("#d50000"),
		};
	},

	get pink(): ColorPalette {
		return {
			"50": Color.fromHex("#fce4ec"),
			"100": Color.fromHex("#f8bbd0"),
			"200": Color.fromHex("#f48fb1"),
			"300": Color.fromHex("#f06292"),
			"400": Color.fromHex("#ec407a"),
			"500": Color.fromHex("#e91e63"),
			"600": Color.fromHex("#d81b60"),
			"700": Color.fromHex("#c2185b"),
			"800": Color.fromHex("#ad1457"),
			"900": Color.fromHex("#880e4f"),
			"A100": Color.fromHex("#ff80ab"),
			"A200": Color.fromHex("#ff4081"),
			"A400": Color.fromHex("#f50057"),
			"A700": Color.fromHex("#c51162"),
		};
	},

	get purple(): ColorPalette {
		return {
			"50": Color.fromHex("#f3e5f5"),
			"100": Color.fromHex("#e1bee7"),
			"200": Color.fromHex("#ce93d8"),
			"300": Color.fromHex("#ba68c8"),
			"400": Color.fromHex("#ab47bc"),
			"500": Color.fromHex("#9c27b0"),
			"600": Color.fromHex("#8e24aa"),
			"700": Color.fromHex("#7b1fa2"),
			"800": Color.fromHex("#6a1b9a"),
			"900": Color.fromHex("#4a148c"),
			"A100": Color.fromHex("#ea80fc"),
			"A200": Color.fromHex("#e040fb"),
			"A400": Color.fromHex("#d500f9"),
			"A700": Color.fromHex("#aa00ff"),
		};
	},

	get deepPurple(): ColorPalette {
		return {
			"50": Color.fromHex("#ede7f6"),
			"100": Color.fromHex("#d1c4e9"),
			"200": Color.fromHex("#b39ddb"),
			"300": Color.fromHex("#9575cd"),
			"400": Color.fromHex("#7e57c2"),
			"500": Color.fromHex("#673ab7"),
			"600": Color.fromHex("#5e35b1"),
			"700": Color.fromHex("#512da8"),
			"800": Color.fromHex("#4527a0"),
			"900": Color.fromHex("#311b92"),
			"A100": Color.fromHex("#b388ff"),
			"A200": Color.fromHex("#7c4dff"),
			"A400": Color.fromHex("#651fff"),
			"A700": Color.fromHex("#6200ea"),
		};
	},

	get indigo(): ColorPalette {
		return {
			"50": Color.fromHex("#e8eaf6"),
			"100": Color.fromHex("#c5cae9"),
			"200": Color.fromHex("#9fa8da"),
			"300": Color.fromHex("#7986cb"),
			"400": Color.fromHex("#5c6bc0"),
			"500": Color.fromHex("#3f51b5"),
			"600": Color.fromHex("#3949ab"),
			"700": Color.fromHex("#303f9f"),
			"800": Color.fromHex("#283593"),
			"900": Color.fromHex("#1a237e"),
			"A100": Color.fromHex("#8c9eff"),
			"A200": Color.fromHex("#536dfe"),
			"A400": Color.fromHex("#3d5afe"),
			"A700": Color.fromHex("#304ffe"),
		};
	},

	get blue(): ColorPalette {
		return {
			"50": Color.fromHex("#e7e9fd"),
			"100": Color.fromHex("#d0d9ff"),
			"200": Color.fromHex("#a9b4ff"),
			"300": Color.fromHex("#829fff"),
			"400": Color.fromHex("#648fff"),
			"500": Color.fromHex("#3f51b5"),
			"600": Color.fromHex("#3949ab"),
			"700": Color.fromHex("#303f9f"),
			"800": Color.fromHex("#283593"),
			"900": Color.fromHex("#1a237e"),
			"A100": Color.fromHex("#82b1ff"),
			"A200": Color.fromHex("#448aff"),
			"A400": Color.fromHex("#2979ff"),
			"A700": Color.fromHex("#2962ff"),
		};
	},

	get lightBlue(): ColorPalette {
		return {
			"50": Color.fromHex("#e1f5fe"),
			"100": Color.fromHex("#b3e5fc"),
			"200": Color.fromHex("#81d4fa"),
			"300": Color.fromHex("#4fc3f7"),
			"400": Color.fromHex("#29b6f6"),
			"500": Color.fromHex("#03a9f4"),
			"600": Color.fromHex("#039be5"),
			"700": Color.fromHex("#0288d1"),
			"800": Color.fromHex("#0277bd"),
			"900": Color.fromHex("#01579b"),
			"A100": Color.fromHex("#80d8ff"),
			"A200": Color.fromHex("#40c4ff"),
			"A400": Color.fromHex("#00b0ff"),
			"A700": Color.fromHex("#0091ea"),
		};
	},

	get cyan(): ColorPalette {
		return {
			"50": Color.fromHex("#e0f7fa"),
			"100": Color.fromHex("#b2ebf2"),
			"200": Color.fromHex("#80deea"),
			"300": Color.fromHex("#4dd0e1"),
			"400": Color.fromHex("#26c6da"),
			"500": Color.fromHex("#00bcd4"),
			"600": Color.fromHex("#00acc1"),
			"700": Color.fromHex("#0097a7"),
			"800": Color.fromHex("#00838f"),
			"900": Color.fromHex("#006064"),
			"A100": Color.fromHex("#84ffff"),
			"A200": Color.fromHex("#18ffff"),
			"A400": Color.fromHex("#00e5ff"),
			"A700": Color.fromHex("#00b8d4"),
		};
	},

	get teal(): ColorPalette {
		return {
			"50": Color.fromHex("#e0f2f1"),
			"100": Color.fromHex("#b2dfdb"),
			"200": Color.fromHex("#80cbc4"),
			"300": Color.fromHex("#4db6ac"),
			"400": Color.fromHex("#26a69a"),
			"500": Color.fromHex("#009688"),
			"600": Color.fromHex("#00897b"),
			"700": Color.fromHex("#00796b"),
			"800": Color.fromHex("#00695c"),
			"900": Color.fromHex("#004d40"),
			"A100": Color.fromHex("#a7ffeb"),
			"A200": Color.fromHex("#64ffda"),
			"A400": Color.fromHex("#1de9b6"),
			"A700": Color.fromHex("#00bfa5"),
		};
	},

	get green(): ColorPalette {
		return {
			"50": Color.fromHex("#e8f5e9"),
			"100": Color.fromHex("#c8e6c9"),
			"200": Color.fromHex("#a5d6a7"),
			"300": Color.fromHex("#81c784"),
			"400": Color.fromHex("#66bb6a"),
			"500": Color.fromHex("#4caf50"),
			"600": Color.fromHex("#43a047"),
			"700": Color.fromHex("#388e3c"),
			"800": Color.fromHex("#2e7d32"),
			"900": Color.fromHex("#1b5e20"),
			"A100": Color.fromHex("#b9f6ca"),
			"A200": Color.fromHex("#69f0ae"),
			"A400": Color.fromHex("#00e676"),
			"A700": Color.fromHex("#00c853"),
		};
	},

	get lightGreen(): ColorPalette {
		return {
			"50": Color.fromHex("#f1f8e9"),
			"100": Color.fromHex("#dcedc8"),
			"200": Color.fromHex("#c5e1a5"),
			"300": Color.fromHex("#aed581"),
			"400": Color.fromHex("#9ccc65"),
			"500": Color.fromHex("#8bc34a"),
			"600": Color.fromHex("#7cb342"),
			"700": Color.fromHex("#689f38"),
			"800": Color.fromHex("#558b2f"),
			"900": Color.fromHex("#33691e"),
			"A100": Color.fromHex("#ccff90"),
			"A200": Color.fromHex("#b2ff59"),
			"A400": Color.fromHex("#76ff03"),
			"A700": Color.fromHex("#64dd17"),
		};
	},

	get lime(): ColorPalette {
		return {
			"50": Color.fromHex("#f9fbe7"),
			"100": Color.fromHex("#f0f4c3"),
			"200": Color.fromHex("#e6ee9c"),
			"300": Color.fromHex("#dce775"),
			"400": Color.fromHex("#d4e157"),
			"500": Color.fromHex("#cddc39"),
			"600": Color.fromHex("#c0ca33"),
			"700": Color.fromHex("#afb42b"),
			"800": Color.fromHex("#9e9d24"),
			"900": Color.fromHex("#827717"),
			"A100": Color.fromHex("#f4ff81"),
			"A200": Color.fromHex("#eeff41"),
			"A400": Color.fromHex("#c6ff00"),
			"A700": Color.fromHex("#aeea00"),
		};
	},

	get yellow(): ColorPalette {
		return {
			"50": Color.fromHex("#fffde7"),
			"100": Color.fromHex("#fff9c4"),
			"200": Color.fromHex("#fff59d"),
			"300": Color.fromHex("#fff176"),
			"400": Color.fromHex("#ffee58"),
			"500": Color.fromHex("#ffeb3b"),
			"600": Color.fromHex("#fdd835"),
			"700": Color.fromHex("#fbc02d"),
			"800": Color.fromHex("#f9a825"),
			"900": Color.fromHex("#f57f17"),
			"A100": Color.fromHex("#ffff8d"),
			"A200": Color.fromHex("#ffff00"),
			"A400": Color.fromHex("#ffea00"),
			"A700": Color.fromHex("#ffd600"),
		};
	},

	get amber(): ColorPalette {
		return {
			"50": Color.fromHex("#fff8e1"),
			"100": Color.fromHex("#ffecb3"),
			"200": Color.fromHex("#ffe082"),
			"300": Color.fromHex("#ffd54f"),
			"400": Color.fromHex("#ffca28"),
			"500": Color.fromHex("#ffc107"),
			"600": Color.fromHex("#ffb300"),
			"700": Color.fromHex("#ffa000"),
			"800": Color.fromHex("#ff8f00"),
			"900": Color.fromHex("#ff6f00"),
			"A100": Color.fromHex("#ffe57f"),
			"A200": Color.fromHex("#ffd740"),
			"A400": Color.fromHex("#ffc400"),
			"A700": Color.fromHex("#ffab00"),
		};
	},

	get orange(): ColorPalette {
		return {
			"50": Color.fromHex("#fff3e0"),
			"100": Color.fromHex("#ffe0b2"),
			"200": Color.fromHex("#ffcc80"),
			"300": Color.fromHex("#ffb74d"),
			"400": Color.fromHex("#ffa726"),
			"500": Color.fromHex("#ff9800"),
			"600": Color.fromHex("#fb8c00"),
			"700": Color.fromHex("#f57c00"),
			"800": Color.fromHex("#ef6c00"),
			"900": Color.fromHex("#e65100"),
			"A100": Color.fromHex("#ffd180"),
			"A200": Color.fromHex("#ffab40"),
			"A400": Color.fromHex("#ff9100"),
			"A700": Color.fromHex("#ff6d00"),
		};
	},

	get deepOrange(): ColorPalette {
		return {
			"50": Color.fromHex("#fbe9e7"),
			"100": Color.fromHex("#ffccbc"),
			"200": Color.fromHex("#ffab91"),
			"300": Color.fromHex("#ff8a65"),
			"400": Color.fromHex("#ff7043"),
			"500": Color.fromHex("#ff5722"),
			"600": Color.fromHex("#f4511e"),
			"700": Color.fromHex("#e64a19"),
			"800": Color.fromHex("#d84315"),
			"900": Color.fromHex("#bf360c"),
			"A100": Color.fromHex("#ff9e80"),
			"A200": Color.fromHex("#ff6e40"),
			"A400": Color.fromHex("#ff3d00"),
			"A700": Color.fromHex("#dd2c00"),
		};
	},

	get brown(): ColorPaletteMain {
		return {
			"50": Color.fromHex("#efebe9"),
			"100": Color.fromHex("#d7ccc8"),
			"200": Color.fromHex("#bcaaa4"),
			"300": Color.fromHex("#a1887f"),
			"400": Color.fromHex("#8d6e63"),
			"500": Color.fromHex("#795548"),
			"600": Color.fromHex("#6d4c41"),
			"700": Color.fromHex("#5d4037"),
			"800": Color.fromHex("#4e342e"),
			"900": Color.fromHex("#3e2723"),
		};
	},

	get grey(): ColorPaletteMain {
		return {
			"50": Color.fromHex("#fafafa"),
			"100": Color.fromHex("#f5f5f5"),
			"200": Color.fromHex("#eeeeee"),
			"300": Color.fromHex("#e0e0e0"),
			"400": Color.fromHex("#bdbdbd"),
			"500": Color.fromHex("#9e9e9e"),
			"600": Color.fromHex("#757575"),
			"700": Color.fromHex("#616161"),
			"800": Color.fromHex("#424242"),
			"900": Color.fromHex("#212121"),
		};
	},

	get blueGrey(): ColorPaletteMain {
		return {
			"50": Color.fromHex("#eceff1"),
			"100": Color.fromHex("#cfd8dc"),
			"200": Color.fromHex("#b0bec5"),
			"300": Color.fromHex("#90a4ae"),
			"400": Color.fromHex("#78909c"),
			"500": Color.fromHex("#607d8b"),
			"600": Color.fromHex("#546e7a"),
			"700": Color.fromHex("#455a64"),
			"800": Color.fromHex("#37474f"),
			"900": Color.fromHex("#263238"),
		};
	},
};
