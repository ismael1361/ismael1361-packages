import { InputGenerator } from "@ismael1361/animation";
import { DOMElement, MarginDefinition, ValueType, ValueUnit } from "./Types";
import AnimationScope from "./AnimationScope";
import { parseMargin } from "./Utils";
import { Color, interpolate } from "@ismael1361/utils";

/**
 * Uma coleção de helpers de animação para manipular propriedades de elementos DOM.
 */
export default class DOMAnimationHelpers<E extends DOMElement> {
	constructor(private element: E | React.RefObject<E>) {}

	get current(): E | null {
		return this.element instanceof Element ? (this.element as E) : (this.element?.current ?? null);
	}

	/**
	 * Anima a propriedade `opacity` de um elemento DOM.
	 * @param config Configurações da animação, como `from`, `to`, `duration`, `easing`.
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   yield* this.dom(myDiv).opacity({ from: 0, to: 1, duration: 1000 });
	 * });
	 * ```
	 */
	opacity(config: ValueType<number>): InputGenerator {
		return AnimationScope.timing((i) => {
			if (this.current) this.current.style.opacity = i.toFixed(2);
		}, config);
	}

	/**
	 * Anima a propriedade `width` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from`, `to`, `duration`, e `unit` (padrão 'px').
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   // Anima a largura de 0 para 100 pixels
	 *   yield* this.dom(myDiv).width({ from: 0, to: 100, duration: 500 });
	 *   // Anima a largura de 100% para 50%
	 *   yield* this.dom(myDiv).width({ from: 100, to: 50, unit: '%', duration: 500 });
	 * });
	 * ```
	 */
	width(config: ValueUnit<number>): InputGenerator {
		const { unit = "px", ...conf } = config || {};
		return AnimationScope.timing((i) => {
			if (this.current) this.current.style.width = i.toFixed(2) + unit;
		}, conf);
	}

	/**
	 * Anima a propriedade `height` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from`, `to`, `duration`, e `unit` (padrão 'px').
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   // Anima a altura de 0 para 200 pixels
	 *   yield* this.dom(myDiv).height({ from: 0, to: 200, duration: 500 });
	 * });
	 * ```
	 */
	height(config: ValueUnit<number>): InputGenerator {
		const { unit = "px", ...conf } = config || {};
		return AnimationScope.timing((i) => {
			if (this.current) this.current.style.height = i.toFixed(2) + unit;
		}, conf);
	}

	/**
	 * Anima a propriedade `margin` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from` (margem inicial `[all] | [top & bottom, left & right] | [top, left & right, bottom] | [top, right, bottom, left]`), `to` (margem final), `duration`, e `unit` (padrão 'px').
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   // Anima a margem de 0px para 10px em todos os lados
	 *   yield* this.dom(myDiv).margin({ from: [0], to: [10], duration: 500 });
	 *   // Anima de 10px (vertical) 20px (horizontal) para 0
	 *   yield* this.dom(myDiv).margin({ from: [10, 20], to: [0], duration: 500 });
	 * });
	 * ```
	 */
	margin(config: ValueUnit<MarginDefinition>): InputGenerator {
		const { from, to, unit = "px", ...conf } = config || {};

		const fromValue = parseMargin(from);
		const toValue = parseMargin(to);

		return AnimationScope.timing(
			(i) => {
				const top = interpolate(i, [0, 1], [fromValue.top, toValue.top]);
				const right = interpolate(i, [0, 1], [fromValue.right, toValue.right]);
				const bottom = interpolate(i, [0, 1], [fromValue.bottom, toValue.bottom]);
				const left = interpolate(i, [0, 1], [fromValue.left, toValue.left]);

				if (this.current) this.current.style.margin = [top, right, bottom, left].map((v) => v.toFixed(2) + unit).join(" ");
			},
			{
				from: 0,
				to: 1,
				...conf,
			},
		);
	}

	/**
	 * Anima a propriedade `marginTop` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from`, `to`, `duration`, e `unit` (padrão 'px').
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   yield* this.dom(myDiv).marginTop({ from: 0, to: 20, duration: 500 });
	 * });
	 * ```
	 */
	marginTop(config: ValueUnit<number>): InputGenerator {
		const { unit = "px", ...conf } = config || {};
		return AnimationScope.timing((i) => {
			if (this.current) this.current.style.marginTop = i.toFixed(2) + unit;
		}, conf);
	}

	/**
	 * Anima a propriedade `marginBottom` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from`, `to`, `duration`, e `unit` (padrão 'px').
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   yield* this.dom(myDiv).marginBottom({ from: 0, to: 20, duration: 500 });
	 * });
	 * ```
	 */
	marginBottom(config: ValueUnit<number>): InputGenerator {
		const { unit = "px", ...conf } = config || {};
		return AnimationScope.timing((i) => {
			if (this.current) this.current.style.marginBottom = i.toFixed(2) + unit;
		}, conf);
	}

	/**
	 * Anima a propriedade `marginLeft` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from`, `to`, `duration`, e `unit` (padrão 'px').
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   yield* this.dom(myDiv).marginLeft({ from: 0, to: 20, duration: 500 });
	 * });
	 * ```
	 */
	marginLeft(config: ValueUnit<number>): InputGenerator {
		const { unit = "px", ...conf } = config || {};
		return AnimationScope.timing((i) => {
			if (this.current) this.current.style.marginLeft = i.toFixed(2) + unit;
		}, conf);
	}

	/**
	 * Anima a propriedade `marginRight` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from`, `to`, `duration`, e `unit` (padrão 'px').
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   yield* this.dom(myDiv).marginRight({ from: 0, to: 20, duration: 500 });
	 * });
	 * ```
	 */
	marginRight(config: ValueUnit<number>): InputGenerator {
		const { unit = "px", ...conf } = config || {};
		return AnimationScope.timing((i) => {
			if (this.current) this.current.style.marginRight = i.toFixed(2) + unit;
		}, conf);
	}

	/**
	 * Anima a propriedade `backgroundColor` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from` (cor inicial), `to` (cor final) e `duration`.
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   yield* this.dom(myDiv).backgroundColor({ from: 'blue', to: 'red', duration: 1000 });
	 * });
	 * ```
	 */
	backgroundColor(config: ValueType<string | Color>): InputGenerator {
		const { from, to, ...conf } = config || {};
		const fromColor = new Color(from);

		return AnimationScope.timing(
			(i) => {
				const color = fromColor.blend(to, i);
				if (this.current) this.current.style.backgroundColor = color.toString();
			},
			{
				from: 0,
				to: 1,
				...conf,
			},
		);
	}

	/**
	 * Anima a propriedade `backgroundPosition` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from` (posição inicial `[x, y]`), `to` (posição final `[x, y]`), `duration`, e `unit` (padrão 'px').
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   yield* this.dom(myDiv).backgroundPosition({ from: [0, 0], to: [100, 50], unit: '%', duration: 1000 });
	 * });
	 * ```
	 */
	backgroundPosition(config: ValueUnit<[number, number]>): InputGenerator {
		const { from, to, unit = "px", ...conf } = config || {};

		return AnimationScope.timing(
			(i) => {
				const x = interpolate(i, [0, 1], [from[0], to[0]]);
				const y = interpolate(i, [0, 1], [from[1], to[1]]);

				if (this.current) this.current.style.backgroundPosition = [x.toFixed(2) + unit, y.toFixed(2) + unit].join(" ");
			},
			{
				from: 0,
				to: 1,
				...conf,
			},
		);
	}

	/**
	 * Anima a propriedade `backgroundPositionX` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from`, `to`, `duration`, e `unit` (padrão 'px').
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   yield* this.dom(myDiv).backgroundPositionX({ from: 0, to: 100, unit: '%', duration: 1000 });
	 * });
	 * ```
	 */
	backgroundPositionX(config: ValueUnit<number>): InputGenerator {
		const { unit = "px", ...conf } = config || {};
		return AnimationScope.timing((i) => {
			if (this.current) this.current.style.backgroundPositionX = i.toFixed(2) + unit;
		}, conf);
	}

	/**
	 * Anima a propriedade `backgroundPositionY` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from`, `to`, `duration`, e `unit` (padrão 'px').
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   yield* this.dom(myDiv).backgroundPositionY({ from: 0, to: 100, unit: '%', duration: 1000 });
	 * });
	 * ```
	 */
	backgroundPositionY(config: ValueUnit<number>): InputGenerator {
		const { unit = "px", ...conf } = config || {};
		return AnimationScope.timing((i) => {
			if (this.current) this.current.style.backgroundPositionY = i.toFixed(2) + unit;
		}, conf);
	}

	/**
	 * Anima a propriedade `backgroundSize` de um elemento DOM.
	 * @param config Configurações da animação, incluindo `from` (tamanho inicial `[all] | [width, height]`), `to` (tamanho final), `duration`, e `unit` (padrão 'px').
	 * @returns Um gerador de animação.
	 * @example
	 * ```ts
	 * const myDiv = useRef(null);
	 * useAnimation(function*() {
	 *   // Anima de 100px 100px para 200px 150px
	 *   yield* this.dom(myDiv).backgroundSize({ from: [100], to: [200, 150], duration: 1000 });
	 * });
	 * ```
	 */
	backgroundSize(config: ValueUnit<[number] | [number, number]>): InputGenerator {
		const { from, to, unit = "px", ...conf } = config || {};
		const fromValue = [from?.[0], from?.[1] || from?.[0]];
		const toValue = [to?.[0], to?.[1] || to?.[0]];

		return AnimationScope.timing(
			(i) => {
				const width = interpolate(i, [0, 1], [fromValue[0], toValue[0]]);
				const height = interpolate(i, [0, 1], [fromValue[1], toValue[1]]);

				if (this.current) this.current.style.backgroundSize = [width.toFixed(2) + unit, height.toFixed(2) + unit].join(" ");
			},
			{
				from: 0,
				to: 1,
				...conf,
			},
		);
	}
}
