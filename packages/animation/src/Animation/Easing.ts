import { EasingFunction } from "./Types";

export const Easing = {
	/**
	 * Função linear, `f(t) = t`. A posição se correlaciona um-para-um com o tempo decorrido.
	 *
	 * http://cubic-bezier.com/#0,0,1,1
	 * @param {number} t O progresso da animação (0 a 1).
	 * @returns {number} O valor interpolado.
	 * @example Easing.linear(0.5); // 0.5
	 */
	linear(t: number): number {
		return t;
	},

	/**
	 * Uma interação inercial simples, semelhante a um objeto acelerando lentamente.
	 *
	 * http://cubic-bezier.com/#.42,0,1,1
	 * @param {number} t O progresso da animação (0 a 1).
	 * @returns {number} O valor interpolado.
	 * @example Easing.ease(0.5); // 1
	 */
	ease(t: number): number {
		return t < 0.5 ? 4 * t * t : (t - 1) * (2 * t - 2) + 1;
	},

	/**
	 * Função quadrática, `f(t) = t * t`. A posição é igual ao quadrado do tempo decorrido.
	 *
	 * http://easings.net/#easeInQuad
	 * @param {number} t O progresso da animação (0 a 1).
	 * @returns {number} O valor interpolado.
	 * @example Easing.quad(0.5); // 0.25
	 */
	quad(t: number): number {
		return t * t;
	},

	/**
	 * Função cúbica, `f(t) = t * t * t`. A posição é igual ao cubo do tempo decorrido.
	 *
	 * http://easings.net/#easeInCubic
	 * @param {number} t O progresso da animação (0 a 1).
	 * @returns {number} O valor interpolado.
	 * @example Easing.cubic(0.5); // 0.125
	 */
	cubic(t: number): number {
		return t * t * t;
	},
	/**
	 * Cria uma função de potência. A posição é igual à N-ésima potência do tempo decorrido.
	 *
	 * n = 4: http://easings.net/#easeInQuart
	 * n = 5: http://easings.net/#easeInQuint
	 * @param {number} n A potência a ser usada.
	 * @returns {EasingFunction} Uma função de easing.
	 * @example
	 * const easeInQuart = Easing.poly(4);
	 * easeInQuart(0.5); // 0.0625
	 */
	poly(n: number): EasingFunction {
		return (t: number) => Math.pow(t, n);
	},

	/**
	 * Função sinusoidal.
	 *
	 * http://easings.net/#easeInSine
	 * @param {number} t O progresso da animação (0 a 1).
	 * @returns {number} O valor interpolado.
	 * @example Easing.sin(0.5); // 0.2928...
	 */
	sin(t: number): number {
		return 1 - Math.cos((t * Math.PI) / 2);
	},

	/**
	 * Função circular.
	 *
	 * http://easings.net/#easeInCirc
	 * @param {number} t O progresso da animação (0 a 1).
	 * @returns {number} O valor interpolado.
	 * @example Easing.circle(0.5); // 0.1339...
	 */
	circle(t: number): number {
		return 1 - Math.sqrt(1 - t * t);
	},

	/**
	 * Função exponencial.
	 *
	 * http://easings.net/#easeInExpo
	 * @param {number} t O progresso da animação (0 a 1).
	 * @returns {number} O valor interpolado.
	 * @example Easing.exp(0.5); // 0.03125
	 */
	exp(t: number): number {
		return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
	},

	/**
	 * Cria uma interação elástica simples, como uma mola oscilando.
	 * O `bounciness` (elasticidade) padrão é 1. Um valor 0 não ultrapassa o limite,
	 * e um valor N > 1 ultrapassará o limite aproximadamente N vezes.
	 *
	 * http://easings.net/#easeInElastic
	 * @param {number} [bounciness=1] O nível de elasticidade.
	 * @returns {EasingFunction} Uma função de easing.
	 * @example
	 * const elasticEase = Easing.elastic(1.5);
	 * elasticEase(0.8); // 0.499...
	 */
	elastic(bounciness: number = 1): EasingFunction {
		return (t: number) => Math.pow(2, 10 * (t - 1)) * Math.sin(((t - 1.1) * (2 * Math.PI)) / bounciness);
	},

	/**
	 * Cria um efeito onde o objeto recua um pouco antes de avançar.
	 *
	 * Wolfram Plot:
	 *
	 * - http://tiny.cc/back_default (s = 1.70158, default)
	 * @param {number} [s=1.70158] A intensidade do recuo.
	 * @returns {EasingFunction} Uma função de easing.
	 * @example
	 * const backEase = Easing.back(2);
	 * backEase(0.5); // 0.5
	 */
	back(s: number = 1.70158): EasingFunction {
		return (t: number) => t * t * (s * t + 1);
	},

	/**
	 * Fornece um efeito de "quicar" simples.
	 *
	 * http://easings.net/#easeInBounce
	 * @param {number} t O progresso da animação (0 a 1).
	 * @returns {number} O valor interpolado.
	 * @example Easing.bounce(0.5); // 0.5
	 */
	bounce(t: number): number {
		return 1 - Math.abs(1 - t);
	},

	/**
	 * Cria uma curva de Bézier cúbica, equivalente à `transition-timing-function` do CSS.
	 *
	 * Uma ferramenta útil para visualizar curvas de Bézier cúbicas pode ser encontrada em
	 * http://cubic-bezier.com/
	 * @param {number} x1 Coordenada X do primeiro ponto de controle.
	 * @param {number} y1 Coordenada Y do primeiro ponto de controle.
	 * @param {number} x2 Coordenada X do segundo ponto de controle.
	 * @param {number} y2 Coordenada Y do segundo ponto de controle.
	 * @returns {{ factory: () => EasingFunction }} Um objeto com uma fábrica para a função de easing.
	 * @example
	 * const customBezier = Easing.bezier(0.25, 0.1, 0.25, 1).factory();
	 * customBezier(0.5); // 0.46875
	 */
	bezier(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
	): {
		factory: () => EasingFunction;
	} {
		const bezierFn = Easing.bezierFn(x1, y1, x2, y2);
		return {
			factory: () => bezierFn,
		};
	},

	/**
	 * A implementação base para a curva de Bézier cúbica.
	 * @param {number} x1 Coordenada X do primeiro ponto de controle.
	 * @param {number} y1 Coordenada Y do primeiro ponto de controle.
	 * @param {number} x2 Coordenada X do segundo ponto de controle.
	 * @param {number} y2 Coordenada Y do segundo ponto de controle.
	 * @returns {EasingFunction} A função de easing de Bézier.
	 * @example
	 * const bezier = Easing.bezierFn(0.25, 0.1, 0.25, 1);
	 * bezier(0.5); // 0.46875
	 */
	bezierFn(x1: number, y1: number, x2: number, y2: number): EasingFunction {
		return (x: number) => {
			return Math.pow(1 - x, 3) * x1 + 3 * Math.pow(1 - x, 2) * x * x2 + 3 * (1 - x) * Math.pow(x, 2) * y1 + Math.pow(x, 3) * y2;
		};
	},

	/**
	 * Modificador que executa uma função de easing na sua forma original (aceleração no início).
	 * @param {EasingFunction} easing A função de easing a ser modificada.
	 * @returns {EasingFunction} A função de easing modificada.
	 * @example
	 * const easeInQuad = Easing.in(Easing.quad);
	 * easeInQuad(0.5); // 0.25
	 */
	in(easing: EasingFunction): EasingFunction {
		return easing;
	},

	/**
	 * Modificador que executa uma função de easing de forma invertida (desaceleração no final).
	 * @param {EasingFunction} easing A função de easing a ser modificada.
	 * @returns {EasingFunction} A função de easing modificada.
	 * @example
	 * const easeOutQuad = Easing.out(Easing.quad);
	 * easeOutQuad(0.5); // 0.75
	 */
	out(easing: EasingFunction): EasingFunction {
		return (t: number) => 1 - easing(1 - t);
	},

	/**
	 * Modificador que torna qualquer função de easing simétrica.
	 * A função acelera na primeira metade da duração e desacelera na segunda metade.
	 * @param {EasingFunction} easing A função de easing a ser modificada.
	 * @returns {EasingFunction} A função de easing modificada.
	 * @example
	 * const easeInOutQuad = Easing.inOut(Easing.quad);
	 * easeInOutQuad(0.5); // 0.5
	 */
	inOut(easing: EasingFunction): EasingFunction {
		return (t: number) => (t < 0.5 ? easing(t * 2) / 2 : 1 - easing((1 - t) * 2) / 2);
	},

	/**
	 * Cria uma função de easing que avança em degraus discretos.
	 * @param {number} [n=10] O número de degraus.
	 * @param {boolean} [roundToNextStep] Se `true`, arredonda para o degrau mais próximo. Se `false` (padrão),
	 * usa o degrau anterior (floor).
	 * @returns {EasingFunction} Uma função de easing em degraus.
	 * @example
	 * const fiveSteps = Easing.steps(5);
	 * fiveSteps(0.55); // 0.4
	 * const fiveStepsRounded = Easing.steps(5, true);
	 * fiveStepsRounded(0.55); // 0.6
	 */
	steps(n: number = 10, roundToNextStep?: boolean): EasingFunction {
		"worklet";
		return (t: number) => (roundToNextStep ? Math.round(t * n) / n : Math.floor(t * n) / n);
	},
} as const;
