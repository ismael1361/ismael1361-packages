/**
 * Formata um objeto `Date` em uma string personalizada, com base em um modelo de formato.
 * Esta função é inspirada em bibliotecas populares como Moment.js e Day.js, permitindo
 * um controle granular sobre a representação textual de datas e horas.
 *
 * Para usar texto literal que possa ser confundido com tokens (ex: "MM"),
 * envolva-o em colchetes. Ex: `[My month is] MMMM`.
 *
 * ### Tokens de Formato Disponíveis:
 *
 * | Token | Saída de Exemplo      | Descrição                               |
 * |-------|-----------------------|-----------------------------------------|
 * | `YYYY`  | `2023`                | Ano com 4 dígitos                       |
 * | `YY`    | `23`                  | Ano com 2 dígitos                       |
 * | `MMMM`  | `Janeiro`             | Nome completo do mês                    |
 * | `MMM`   | `Jan`                 | Nome abreviado do mês                   |
 * | `MM`    | `01`                  | Mês com 2 dígitos (01-12)               |
 * | `M`     | `1`                   | Mês (1-12)                              |
 * | `DD`    | `05`                  | Dia do mês com 2 dígitos (01-31)        |
 * | `D`     | `5`                   | Dia do mês (1-31)                       |
 * | `dddd`  | `Qui`                 | Nome abreviado do dia da semana         |
 * | `ddd`   | `Qui`                 | Nome abreviado do dia da semana         |
 * | `dd`    | `Qu`                  | Dia da semana com 2 letras              |
 * | `d`     | `4`                   | Dia da semana (0=Dom, 1=Seg, ...)       |
 * | `HH`    | `14`                  | Hora com 2 dígitos (formato 24h, 00-23) |
 * | `H`     | `14`                  | Hora (formato 24h, 0-23)                |
 * | `hh`    | `02`                  | Hora com 2 dígitos (formato 12h, 01-12) |
 * | `h`     | `2`                   | Hora (formato 12h, 1-12)                |
 * | `mm`    | `09`                  | Minuto com 2 dígitos (00-59)            |
 * | `m`     | `9`                   | Minuto (0-59)                           |
 * | `ss`    | `05`                  | Segundo com 2 dígitos (00-59)           |
 * | `s`     | `5`                   | Segundo (0-59)                          |
 * | `SSS`   | `042`                 | Milissegundo com 3 dígitos              |
 * | `SS`    | `04`                  | Milissegundo com 2 dígitos              |
 * | `S`     | `42`                  | Milissegundo                            |
 * | `A`     | `PM`                  | AM/PM em maiúsculas                     |
 * | `a`     | `pm`                  | am/pm em minúsculas                     |
 *
 * @param {Date} date O objeto `Date` a ser formatado.
 * @param {string} format A string de formato contendo os tokens a serem substituídos.
 * @returns {string} A string de data formatada.
 *
 * @example
 * ```ts
 * const myDate = new Date('2023-01-05T14:09:05.042Z');
 *
 * // Formato brasileiro: "quinta-feira, 05 de janeiro de 2023, 11:09:05" (considerando fuso -3h)
 * console.log(formatDate(myDate, 'dddd, DD [de] MMMM [de] YYYY, HH:mm:ss'));
 *
 * // Formato curto: "05/01/23 11:09 AM"
 * console.log(formatDate(myDate, 'DD/MM/YY hh:mm A'));
 * ```
 */
export const formatDate = (date: Date, format: string): string => {
	let result = "",
		match: string = "",
		escaping = false;

	const values: Record<string, string> = {
		YYYY: date.getFullYear().toString(),
		YY: date.getFullYear().toString().slice(-2),
		MMMM: (() => {
			const [s, ...l] = date.toLocaleString("default", { month: "long" }).split("");
			return s.toUpperCase() + l.join("");
		})(),
		MMM: (() => {
			const [s, ...l] = date.toLocaleString("default", { month: "short" }).split("");
			return s.toUpperCase() + l.join("").replace(".", "");
		})(),
		MM: (date.getMonth() + 1).toString().padStart(2, "0"),
		M: (date.getMonth() + 1).toString(),
		DD: date.getDate().toString().padStart(2, "0"),
		D: date.getDate().toString(),
		dddd: (() => {
			const [s, ...l] = date.toLocaleString("default", { weekday: "short" }).split("");
			return s.toUpperCase() + l.join("").replace(".", "");
		})(),
		ddd: (() => {
			const [s, ...l] = date.toLocaleString("default", { weekday: "short" }).split("");
			return s.toUpperCase() + l.join("").replace(".", "");
		})(),
		dd: (() => {
			const [s, l] = date.toLocaleString("default", { weekday: "short" }).split("");
			return s.toUpperCase() + l;
		})(),
		d: date.getDay().toString(),
		HH: date.getHours().toString().padStart(2, "0"),
		H: date.getHours().toString(),
		hh: (date.getHours() % 12 || 12).toString().padStart(2, "0"),
		h: (date.getHours() % 12 || 12).toString(),
		mm: date.getMinutes().toString().padStart(2, "0"),
		m: date.getMinutes().toString(),
		ss: date.getSeconds().toString().padStart(2, "0"),
		s: date.getSeconds().toString(),
		SSS: date.getMilliseconds().toString().padStart(3, "0"),
		SS: date.getMilliseconds().toString().padStart(2, "0"),
		S: date.getMilliseconds().toString(),
		A: date.getHours() < 12 ? "AM" : "PM",
		a: date.getHours() < 12 ? "am" : "pm",
	};

	while (format.length > 0) {
		const char = format[0];
		format = format.slice(1);

		if (escaping && char === "]") {
			escaping = false;
			continue;
		}

		if (escaping) {
			result += char;
			continue;
		}

		if (char === "[") {
			escaping = true;
		} else if (match === "" || char === match[0]) {
			match += char;
			if (format.length > 0) continue;
		}

		while (match.length > 0) {
			for (const type in values) {
				if (match.startsWith(type)) {
					result += values[type];
					match = match.slice(type.length);
					break;
				}
			}

			if (match.length > 0) {
				result += match[0];
				match = match.slice(1);
			}
		}

		match = char;
	}

	return result;
};
