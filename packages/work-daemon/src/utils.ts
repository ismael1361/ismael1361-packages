import * as net from "net";
import * as crypto from "crypto";
import { IncomingHttpHeaders } from "http";

/**
 * Verifica se uma porta específica está disponível para uso.
 * @param port A porta a ser verificada.
 * @returns Uma Promise que resolve para `true` se a porta estiver livre, e `false` caso contrário.
 */
function isPortAvailable(port: number): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const server = net.createServer();

		// Se o servidor conseguir "escutar" na porta, ela está livre.
		server.listen(port, () => {
			server.close(() => {
				resolve(true);
			});
		});

		// Se ocorrer um erro, provavelmente a porta já está em uso.
		server.on("error", (err: any) => {
			if (err.code === "EADDRINUSE") {
				resolve(false); // A porta já está em uso.
			} else {
				reject(err); // Outro erro inesperado.
			}
		});
	});
}

/**
 * Verifica se o serviço em uma porta específica é um servidor WebSocket.
 *
 * @param port A porta a ser verificada.
 * @param options Opções para a verificação, como o host e o timeout.
 * @returns Uma Promise que resolve para `true` se for um serviço WebSocket, e `false` caso contrário.
 *
 * @example
 * ```ts
 * async function checkService() {
 *   const isWS = await isWebSocketService(8080);
 *   if (isWS) {
 *     console.log('O serviço na porta 8080 é um WebSocket!');
 *   } else {
 *     console.log('O serviço na porta 8080 não é um WebSocket ou a porta está fechada.');
 *   }
 * }
 *
 * checkService();
 * ```
 */
export function isWebSocketService(port: number, options: { host?: string; timeout?: number } = {}): Promise<boolean> {
	const { host = "localhost", timeout = 2000 } = options;

	return new Promise<boolean>((resolve) => {
		try {
			const socket = new net.Socket();

			// Define um timeout para a conexão e a resposta
			socket.setTimeout(timeout);

			// Gera uma chave aleatória para o handshake do WebSocket
			const key = crypto.randomBytes(16).toString("base64");

			const request = [`GET / HTTP/1.1`, `Host: ${host}:${port}`, `Upgrade: websocket`, `Connection: Upgrade`, `Sec-WebSocket-Key: ${key}`, `Sec-WebSocket-Version: 13`, "\r\n"].join("\r\n");

			const cleanup = () => socket.destroy();

			socket.on("connect", () => socket.write(request));

			socket.on("data", (data: any) => {
				const response = data.toString();
				const statusLine = response.split("\r\n")[0] || "";
				const headers = parseHeaders(response);

				const isSwitchingProto = statusLine.includes(" 101 ");
				const isUpgrade = headers.upgrade?.toLowerCase() === "websocket";
				const isConnectionUpgrade = headers.connection?.toLowerCase().includes("upgrade") || false;

				resolve(isSwitchingProto && isUpgrade && isConnectionUpgrade);
				cleanup();
			});

			socket.on("error", () => resolve(false));
			socket.on("timeout", () => resolve(false));
			socket.on("close", () => resolve(false)); // Resolve como false se fechar antes de receber dados

			socket.connect(port, host);
		} catch {
			resolve(false);
		}
	});
}

/**
 * Encontra a primeira porta localhost disponível dentro de um intervalo especificado.
 *
 * @param startPort A porta inicial do intervalo de busca (inclusivo).
 * @param endPort A porta final do intervalo de busca (inclusivo).
 * @returns Uma Promise que resolve para o número da primeira porta disponível, ou `null` se nenhuma porta for encontrada no intervalo.
 *
 * @example
 * ```ts
 * async function startServer() {
 *   const availablePort = await findAvailablePort(3000, 4000);
 *
 *   if (availablePort) {
 *     console.log(`Servidor iniciando na porta ${availablePort}`);
 *     // ...lógica para iniciar o servidor...
 *   } else {
 *     console.error('Nenhuma porta disponível no intervalo de 3000 a 4000.');
 *   }
 * }
 *
 * startServer();
 * ```
 */
export async function findAvailablePort(startPort: number, endPort: number): Promise<number | null> {
	for (let port = startPort; port <= endPort; port++) {
		try {
			const isAvailable = await isPortAvailable(port);
			if (isAvailable) {
				return port; // Retorna a primeira porta livre encontrada.
			}
		} catch (error) {
			// Ignora erros na verificação de uma porta específica e continua para a próxima.
			console.warn(`Ocorreu um erro ao verificar a porta ${port}:`, error);
		}
	}

	return null; // Nenhuma porta disponível encontrada no intervalo.
}

/**
 * Função auxiliar para analisar cabeçalhos HTTP de uma resposta crua.
 * @param responseString A resposta HTTP como string.
 * @returns Um objeto com os cabeçalhos em minúsculas.
 */
function parseHeaders(responseString: string): IncomingHttpHeaders {
	const headers: IncomingHttpHeaders = {};
	const lines = responseString.split("\r\n");

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (line === "") break; // Fim dos cabeçalhos
		const separatorIndex = line.indexOf(":");
		const name = line.substring(0, separatorIndex).trim().toLowerCase();
		const value = line.substring(separatorIndex + 1).trim();
		headers[name] = value;
	}
	return headers;
}
