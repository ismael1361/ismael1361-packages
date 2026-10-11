import { useEffect, useState } from "react";
import { formatDate } from "@ismael1361/utils";

type DateIndex = {
	difference: number;
	years: number;
	months: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	formated: string;
};

const getIndex = (targetDate: number, dateNow: number, formatTime: string): DateIndex => {
	const difference = targetDate - dateNow;
	return {
		difference,
		years: Math.floor(difference / (1000 * 60 * 60 * 24 * 365)),
		months: Math.floor(difference / (1000 * 60 * 60 * 24 * 30)),
		days: Math.floor(difference / (1000 * 60 * 60 * 24)),
		hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
		minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
		seconds: Math.floor((difference % (1000 * 60)) / 1000),
		formated: formatDate(new Date(targetDate), formatTime),
	};
};

const defaultFormat = (date: DateIndex) => {
	const { difference, days, hours, minutes, months, seconds, years, formated } = date;

	if (difference < 0) {
		return formated;
	}

	if (years > 0) {
		return `Falta${years > 1 ? "m" : ""} ${years} ano${years > 1 ? "s" : ""}`;
	}

	if (months > 0) {
		return `Falta${months > 1 ? "m" : ""} ${months} mês${months > 1 ? "es" : ""}`;
	}

	if (days > 0) {
		return `Falta${days > 1 ? "m" : ""} ${days} dia${days > 1 ? "s" : ""}`;
	}

	if (hours > 0) {
		return `Falta${hours > 1 ? "m" : ""} ${hours} hora${hours > 1 ? "s" : ""}`;
	}

	if (minutes > 0) {
		return `Falta${minutes > 1 ? "m" : ""} ${minutes} minuto${minutes > 1 ? "s" : ""}`;
	}

	return `Falta${seconds > 1 ? "m" : ""} ${seconds} segundo${seconds > 1 ? "s" : ""}`;
};

interface CountdownOptions {
	round: "Y" | "M" | "D" | "h" | "m" | "s";
	formatTime: string;
	format: (date: DateIndex) => string;
	interval: number;
	startDate?: Date;
}

/**
 * Um hook React para criar uma contagem regressiva para uma data alvo.
 * Retorna uma string formatada representando o tempo restante.
 *
 * @param {Date} targetDate - A data e hora alvo para a contagem regressiva.
 * @param {Partial<CountdownOptions>} [options] - Opções para customizar o comportamento da contagem regressiva.
 * @param {Date} [options.startDate=new Date()] - A data a partir da qual a contagem regressiva deve começar. Se for uma data no futuro, a contagem ficará "pausada" até que o tempo atual alcance essa data.
 * @param {"Y" | "M" | "D" | "h" | "m" | "s"} [options.round] - Arredonda a exibição. Por exemplo, se 'D' for usado, a contagem só será exibida quando faltar menos de um dia. Caso contrário, a data formatada será exibida.
 * @param {string} [options.formatTime="DD/MM/YYYY HH:mm"] - O formato da data a ser exibido quando a contagem regressiva terminar ou for arredondada.
 * @param {(date: DateIndex) => string} [options.format] - Uma função para formatar a string de saída da contagem regressiva.
 * @param {number} [options.interval] - O intervalo de atualização da contagem em milissegundos. Por padrão, o intervalo é dinâmico (atualiza a cada segundo quando faltam segundos, a cada minuto quando faltam minutos, etc.).
 * @returns {string} A string formatada da contagem regressiva ou a data alvo formatada.
 *
 * @example
 * // Exemplo Básico
 * ```jsx
 * import { useCountdown } from '@ismael1361/react-use'; // ajuste o caminho
 *
 * const BasicCountdown = () => {
 *   // Contagem para 10 minutos a partir de agora
 *   const target = new Date();
 *   target.setMinutes(target.getMinutes() + 10);
 *
 *   const countdown = useCountdown(target);
 *
 *   return <p>Tempo restante: {countdown}</p>;
 * };
 * ```
 *
 * @example
 * // Exemplo com Início Atrasado e Formato Customizado
 * ```jsx
 * const DelayedCountdown = () => {
 *   // A contagem termina em 20 segundos
 *   const targetTime = new Date(Date.now() + 20000);
 *   // Mas só começa a contar daqui a 5 segundos
 *   const startTime = new Date(Date.now() + 5000);
 *
 *   const formatFn = ({ seconds }) => `Faltam só ${seconds} segundos!`;
 *
 *   const countdown = useCountdown(targetTime, { startDate: startTime, format: formatFn });
 *
 *   return <p>A contagem começa em 5s: {countdown}</p>;
 * };
 * ```
 */
export const useCountdown = (targetDate: Date, options: Partial<CountdownOptions> = {}) => {
	const { round = "", formatTime = "DD/MM/YYYY HH:mm", format = defaultFormat, interval, startDate = new Date() } = options;
	const [timeNow, setTimeNow] = useState(() => (startDate.getTime() > Date.now() ? startDate.getTime() : Date.now()));

	useEffect(() => {
		const targetTimestamp = targetDate.getTime();
		if (timeNow >= targetTimestamp) return;

		const { days, hours, minutes, months, years } = getIndex(targetTimestamp, timeNow, formatTime);
		const intervalTime =
			years > 0 ? 1000 * 60 * 60 * 24 * 365 : months > 0 ? 1000 * 60 * 60 * 24 * 30 : days > 0 ? 1000 * 60 * 60 * 24 : hours > 0 ? 1000 * 60 * 60 : minutes > 0 ? 1000 * 60 : 1000;

		const currentInterval = setTimeout(
			() => {
				setTimeNow(Date.now());
			},
			typeof interval === "number" ? interval : intervalTime,
		);

		return () => clearTimeout(currentInterval);
	}, [timeNow, targetDate, interval, startDate]);

	const { difference, days, hours, minutes, months, seconds, years, formated } = getIndex(targetDate.getTime(), timeNow, formatTime);

	const roundN = ["Y", "M", "D", "h", "m", "s"].findIndex((r) => r === round?.trim());

	if ((years > 0 && roundN > 0) || (months > 0 && roundN > 1) || (days > 0 && roundN > 2) || (hours > 0 && roundN > 3) || (minutes > 0 && roundN > 4) || (seconds > 0 && roundN > 5)) {
		return formated;
	}

	return format({ difference, days, hours, minutes, months, seconds, years, formated });
};
