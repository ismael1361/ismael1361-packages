import { BoxShadowDefinition, MarginDefinition, UnitType } from "./Types";

export const parseMargin = (m: MarginDefinition) => ({ top: m[0], right: m[1] || m[0], bottom: m[2] || m[0], left: m[3] || m[1] || m[0] });

export const parseUnit = (unit: string): [number, UnitType] => {
	const [n, u = ""] = (unit
		.replace(/\s/gi, "")
		.match(/([\.\-0-9]+)|(\S+)/g)
		?.map((v, i) => (i === 0 ? parseFloat(v) : v)) || [0, "px"]) as any;

	return [n, u];
};

export const parseBoxShadow = (shadowString: string): BoxShadowDefinition[] => {
	const shadows: BoxShadowDefinition[] = [];

	shadowString
		.match(/((?:[^\s\,\(\)]+|\([^\(\)]*\))+)|(\,)/g)
		?.reduce(
			(a: string[][], b: string) => {
				if (b === ",") a.push([]);
				else a[a.length - 1].push(b);
				return a;
			},
			[[]],
		)
		.map((l) => l.join(" "))
		.forEach((shadowPart) => {
			const regex = /(inset\s*)?(-?\d+\.?\d*(?:px|em|rem|vh|vw|%)?)\s+(-?\d+\.?\d*(?:px|em|rem|vh|vw|%)?)\s+(-?\d+\.?\d*(?:px|em|rem|vh|vw|%)?)?\s*(-?\d+\.?\d*(?:px|em|rem|vh|vw|%)?)?\s*(.*)/i;
			const match = shadowPart.trim().match(regex);

			if (match) {
				shadows.push({
					inset: !!match[1],
					offsetX: parseUnit(match[2]),
					offsetY: parseUnit(match[3]),
					blurRadius: parseUnit(match[4] || "0"),
					spreadRadius: parseUnit(match[5] || "0"),
					color: match[6] ? match[6].trim() : "initial",
				});
			}
		});

	return shadows;
};
