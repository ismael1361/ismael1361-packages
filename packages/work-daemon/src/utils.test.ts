import * as net from "net";
import { findAvailablePort, isWebSocketService } from "./utils";

function listenOnEphemeralPort(server: net.Server, host?: string): Promise<number> {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, host, () => {
			const address = server.address();
			if (address && typeof address === "object") {
				resolve(address.port);
			} else {
				reject(new Error("Servidor sem endereço TCP atribuído"));
			}
		});
	});
}

function closeServer(server: net.Server): Promise<void> {
	return new Promise((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()));
	});
}

describe("findAvailablePort", () => {
	it("should return a free port within the given range", async () => {
		const port = await findAvailablePort(41000, 41999);

		expect(port).not.toBeNull();
		expect(port).toBeGreaterThanOrEqual(41000);
		expect(port).toBeLessThanOrEqual(41999);
	});

	it("should return null when every port in the range is busy", async () => {
		const server = net.createServer();
		const busyPort = await listenOnEphemeralPort(server);

		try {
			await expect(findAvailablePort(busyPort, busyPort)).resolves.toBeNull();
		} finally {
			await closeServer(server);
		}
	});
});

describe("isWebSocketService", () => {
	it("should detect a service that completes the websocket handshake", async () => {
		const server = net.createServer((socket) => {
			socket.on("data", () => {
				socket.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n");
			});
		});
		const port = await listenOnEphemeralPort(server, "127.0.0.1");

		try {
			await expect(isWebSocketService(port, { host: "127.0.0.1", timeout: 500 })).resolves.toBe(true);
		} finally {
			await closeServer(server);
		}
	});

	it("should return false for a plain HTTP service", async () => {
		const server = net.createServer((socket) => {
			socket.on("data", () => {
				socket.write("HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nok");
			});
		});
		const port = await listenOnEphemeralPort(server, "127.0.0.1");

		try {
			await expect(isWebSocketService(port, { host: "127.0.0.1", timeout: 500 })).resolves.toBe(false);
		} finally {
			await closeServer(server);
		}
	});

	it("should return false when the port is closed", async () => {
		const port = await findAvailablePort(42000, 42999);
		if (port === null) {
			throw new Error("Nenhuma porta livre encontrada no intervalo de teste");
		}

		await expect(isWebSocketService(port, { host: "127.0.0.1", timeout: 500 })).resolves.toBe(false);
	});
});
