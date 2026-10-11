export type ExtrapolationType = "extend" | "clamp" | "identity";

/**
 * Mapeia um valor de um intervalo de entrada para um intervalo de saída usando interpolação linear.
 * É útil para animações, mapeamento de gestos e normalização de dados.
 *
 * @param {number} value O valor a ser interpolado.
 * @param {readonly number[]} input O array de valores de entrada. Deve ser monotônico (crescente ou decrescente) e ter pelo menos 2 elementos.
 * @param {readonly number[]} output O array de valores de saída. Deve ter o mesmo tamanho do array `input`.
 * @param {ExtrapolationType} [extrapolate="extend"] Define como lidar com valores fora do intervalo de entrada.
 *   - `'extend'`: Extrapola linearmente usando o segmento mais próximo (padrão).
 *   - `'clamp'`: Limita o valor às bordas do intervalo de saída.
 *   - `'identity'`: Retorna o valor original sem modificação.
 * @returns {number} O valor interpolado.
 * @throws {Error} Lança um erro se os arrays de entrada/saída forem inválidos ou se os valores não forem números finitos.
 *
 * @example
 * // Um valor de 0 a 1 → traduz para 0 a 100%
 * interpolate(0.75, [0, 1], [0, 100]); // 75
 *
 * @example
 * // Nota vai de 0 a 10 → quero transformar para 0 a 5 estrelas
 * interpolate(8, [0, 10], [0, 5]); // 4
 *
 * @example
 * // Temperatura em °C (0 a 40) → Opacidade (0 a 1)
 * interpolate(20, [0, 40], [0, 1]); // 0.5
 *
 * @example
 * // Temperatura em °C (0 a 40) → Opacidade (0 a 1)
 * interpolate(20, [0, 40], [0, 1]); // 0.5
 *
 * @example
 * // Valores reais de vendas (1000 a 5000) → Posição em pixels (0 a 300)
 * interpolate(3500, [1000, 5000], [0, 300]); // 187.5
 *
 * @example
 * // Valores reais de vendas (1 a 5 a 20) → Posição em pixels (0 a 100 a 400)
 * interpolate(8, [1, 5, 20], [0, 100, 400]);  // 160
 *
 * @example
 * // Fora do intervalo → pode "estender", "travar" (clamp) ou manter o próprio valor
 * interpolate(-5, [0, 10], [0, 100], 'clamp');    // 0
 * interpolate(-5, [0, 10], [0, 100], 'extend');   // -50
 * interpolate(-5, [0, 10], [0, 100], 'identity'); // -5
 */
export const interpolate = (value: number, input: readonly number[], output: readonly number[], extrapolate: ExtrapolationType = "extend"): number => {
	const n = input.length;
	if (n !== output.length || n < 2) {
		throw new Error("input and output must have the same length and at least 2 items.");
	}

	// Validate numeric inputs
	if (!Number.isFinite(value) || input.some((x) => !Number.isFinite(x)) || output.some((x) => !Number.isFinite(x))) {
		throw new Error("All values must be finite numbers.");
	}

	// Detect monotonic direction
	const ascending = input[0] < input[n - 1];
	// Validate monotonicity
	for (let i = 0; i < n - 1; i++) {
		if (ascending && input[i] > input[i + 1]) {
			throw new Error("input array must be monotonic (all increasing or all decreasing).");
		}
		if (!ascending && input[i] < input[i + 1]) {
			throw new Error("input array must be monotonic (all increasing or all decreasing).");
		}
	}

	const inMin = input[0];
	const inMax = input[n - 1];

	// Helper: compute linear interpolation between two points
	const lerpSegment = (v: number, i0: number) => {
		const x0 = input[i0],
			x1 = input[i0 + 1];
		const y0 = output[i0],
			y1 = output[i0 + 1];
		const dx = x1 - x0;
		if (dx === 0) return y0; // degenerate segment
		const t = (v - x0) / dx;
		return y0 + t * (y1 - y0);
	};

	// If value is inside the input range -> find segment and interpolate
	const within = ascending ? value >= inMin && value <= inMax : value <= inMin && value >= inMax;

	if (within) {
		// find segment index i such that input[i] <= value <= input[i+1] (or reversed)
		let i = 0;
		if (ascending) {
			while (i < n - 2 && value > input[i + 1]) i++;
		} else {
			while (i < n - 2 && value < input[i + 1]) i++;
		}
		return lerpSegment(value, i);
	}

	// Value is outside range -> handle extrapolation mode
	if (extrapolate === "identity") {
		return value;
	}

	if (extrapolate === "clamp") {
		return value < inMin ? output[0] : output[n - 1];
	}

	// 'extend' -> extrapolate linearly using nearest segment (first or last)
	if (value < inMin) {
		return lerpSegment(value, 0);
	} else {
		return lerpSegment(value, n - 2);
	}
};
