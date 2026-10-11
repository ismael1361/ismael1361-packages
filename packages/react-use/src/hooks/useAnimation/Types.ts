import { TimingConfig } from "@ismael1361/animation";
import { Color } from "@ismael1361/utils";

export type DOMElement = HTMLElement | SVGElement | null;

export type UnitType = "px" | "cm" | "mm" | "in" | "pt" | "pc" | "%" | "em" | "ex" | "ch" | "rem" | "vh" | "vw" | "vmin" | "vmax" | "";

export type MarginDefinition = [number] | [number, number] | [number, number, number] | [number, number, number, number];

export interface BoxShadowDefinition {
	inset: boolean;
	offsetX: string | number | [number, UnitType];
	offsetY: string | number | [number, UnitType];
	blurRadius: string | number | [number, UnitType];
	spreadRadius: string | number | [number, UnitType];
	color: string | Color;
}

export interface ValueType<T = number> extends Omit<TimingConfig, "from" | "to"> {
	from: T;
	to: T;
}

export interface ValueUnit<T = number> extends ValueType<T> {
	unit?: UnitType;
}
