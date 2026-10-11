import { EventEmitter } from "./index";

describe("Cass Utils", () => {
	describe("EventEmitter", () => {
		it("should create an instance of EventEmitter", () => {
			const emitter = new EventEmitter();
			expect(emitter).toBeInstanceOf(EventEmitter);
		});

		it("should emit an event", () => {
			const emitter = new EventEmitter<{ test: [] }>();
			const mockCallback = jest.fn();

			emitter.on("test", mockCallback);
			emitter.emit("test");

			expect(mockCallback).toHaveBeenCalled();
		});

		it("should emit an event with arguments", () => {
			const emitter = new EventEmitter<{ test: [number, number, number] }>();
			const mockCallback = jest.fn();

			emitter.on("test", mockCallback);
			emitter.emit("test", 1, 2, 3);

			expect(mockCallback).toHaveBeenCalledWith(1, 2, 3);
		});

		it("should handle multiple listeners for the same event", () => {
			const emitter = new EventEmitter<{ test: [string] }>();
			const mockCallback1 = jest.fn();
			const mockCallback2 = jest.fn();

			emitter.on("test", mockCallback1);
			emitter.on("test", mockCallback2);
			emitter.emit("test", "hello");

			expect(mockCallback1).toHaveBeenCalledWith("hello");
			expect(mockCallback2).toHaveBeenCalledWith("hello");
		});

		it("should remove a listener with off()", () => {
			const emitter = new EventEmitter<{ test: [] }>();
			const mockCallback = jest.fn();

			emitter.on("test", mockCallback);
			emitter.off("test", mockCallback);
			emitter.emit("test");

			expect(mockCallback).not.toHaveBeenCalled();
		});

		it("should handle once() listeners", () => {
			const emitter = new EventEmitter<{ test: [number] }>();
			const mockCallback = jest.fn();

			emitter.once("test", mockCallback);
			emitter.emit("test", 1);
			emitter.emit("test", 2);

			expect(mockCallback).toHaveBeenCalledTimes(1);
			expect(mockCallback).toHaveBeenCalledWith(1);
		});

		it("should handle once() without callback returning a promise", async () => {
			const emitter = new EventEmitter<{ test: [string] }>();

			const promise = emitter.once("test");
			emitter.emit("test", "resolved");

			const result = await promise;
			expect(result).toBeUndefined();
		});

		it("should handle once() with callback", async () => {
			const emitter = new EventEmitter<{ test: [number] }>();
			const mockCallback = jest.fn().mockReturnValue("callback result");

			const promise = emitter.once("test", mockCallback);
			emitter.emit("test", 42);

			const result = await promise;
			expect(result).toBe("callback result");
			expect(mockCallback).toHaveBeenCalledWith(42);
		});

		it("should handle emitOnce() correctly", () => {
			const emitter = new EventEmitter<{ test: [string] }>();
			const mockCallback1 = jest.fn();
			const mockCallback2 = jest.fn();

			emitter.emitOnce("test", "first");
			emitter.on("test", mockCallback1);
			emitter.on("test", mockCallback2);

			expect(mockCallback1).toHaveBeenCalledWith("first");
			expect(mockCallback2).toHaveBeenCalledWith("first");
		});

		it("should throw error when emitting same event twice with emitOnce()", () => {
			const emitter = new EventEmitter<{ test: [] }>();

			emitter.emitOnce("test");
			expect(() => emitter.emitOnce("test")).toThrow('Event "test" was supposed to be emitted only once');
		});

		it("should handle ready() method when already prepared", async () => {
			const emitter = new EventEmitter();
			emitter.prepared = true;

			const callback = jest.fn();
			await emitter.ready(callback);

			expect(callback).toHaveBeenCalled();
		});

		it("should handle ready() method when not prepared", async () => {
			const emitter = new EventEmitter();
			const callback = jest.fn();

			const readyPromise = emitter.ready(callback);
			emitter.prepared = true;

			await readyPromise;
			expect(callback).toHaveBeenCalled();
		});

		it("should clear all events with clearEvents()", () => {
			const emitter = new EventEmitter<{ test1: []; test2: [] }>();
			const mockCallback1 = jest.fn();
			const mockCallback2 = jest.fn();

			emitter.on("test1", mockCallback1);
			emitter.on("test2", mockCallback2);
			emitter.clearEvents();
			emitter.emit("test1");
			emitter.emit("test2");

			expect(mockCallback1).not.toHaveBeenCalled();
			expect(mockCallback2).not.toHaveBeenCalled();
		});

		it("should pipe events between emitters", () => {
			const emitter1 = new EventEmitter<{ test: [string] }>();
			const emitter2 = new EventEmitter<{ test: [string] }>();
			const mockCallback = jest.fn();

			emitter2.on("test", mockCallback);
			emitter1.pipe("test", emitter2);
			emitter1.emit("test", "piped");

			expect(mockCallback).toHaveBeenCalledWith("piped");
		});

		it("should pipeOnce events between emitters", () => {
			const emitter1 = new EventEmitter<{ test: [string] }>();
			const emitter2 = new EventEmitter<{ test: [string] }>();
			const mockCallback = jest.fn();

			emitter2.on("test", mockCallback);
			emitter1.pipeOnce("test", emitter2);
			emitter1.emit("test", "piped once");
			emitter1.emit("test", "piped again");

			expect(mockCallback).toHaveBeenCalledTimes(1);
			expect(mockCallback).toHaveBeenCalledWith("piped once");
		});

		it("should return EventHandler with stop method from on()", () => {
			const emitter = new EventEmitter<{ test: [] }>();
			const mockCallback = jest.fn();

			const handler = emitter.on("test", mockCallback);
			handler.stop();
			emitter.emit("test");

			expect(mockCallback).not.toHaveBeenCalled();
			expect(handler.stop).toBeInstanceOf(Function);
			expect(handler.remove).toBeInstanceOf(Function);
		});

		it("should handle complex event types", () => {
			type TestEvents = {
				userCreated: [string, number];
				userDeleted: [string];
				dataUpdated: [object];
			};

			const emitter = new EventEmitter<TestEvents>();
			const userCreatedCallback = jest.fn();
			const userDeletedCallback = jest.fn();

			emitter.on("userCreated", userCreatedCallback);
			emitter.on("userDeleted", userDeletedCallback);

			emitter.emit("userCreated", "Alice", 25);
			emitter.emit("userDeleted", "Bob");

			expect(userCreatedCallback).toHaveBeenCalledWith("Alice", 25);
			expect(userDeletedCallback).toHaveBeenCalledWith("Bob");
		});

		it("should handle off() without specific callback", () => {
			const emitter = new EventEmitter<{ test: [] }>();
			const mockCallback1 = jest.fn();
			const mockCallback2 = jest.fn();

			emitter.on("test", mockCallback1);
			emitter.on("test", mockCallback2);
			emitter.off("test");
			emitter.emit("test");

			expect(mockCallback1).not.toHaveBeenCalled();
			expect(mockCallback2).not.toHaveBeenCalled();
		});
	});
});
