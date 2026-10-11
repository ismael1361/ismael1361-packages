import { create, timing, wait, loop, chain } from "./Animation";
import { Easing } from "./Easing";

jest.useFakeTimers();

describe("Animation Controller (create)", () => {
	it("should create an animation and update state with timing", () => {
		const initialState = { progress: 0 };
		const animation = create(function* (state) {
			yield* timing(state.progress, { to: 1, duration: 1000, easing: Easing.linear });
		}, initialState);

		// Initial state
		expect(animation.state.progress.value).toBe(0);

		// Start the animation
		animation.start();

		// Advance time by half the duration
		jest.advanceTimersByTime(500);
		expect(animation.state.progress.value).toBeLessThan(0.5);

		// Advance to the end
		jest.advanceTimersByTime(600);
		expect(animation.state.progress.value).toBe(1);
	});

	it("should pause and resume the animation", () => {
		const initialState = { x: 0 };
		const animation = create(function* (state) {
			yield* timing(state.x, { to: 100, duration: 1000, easing: Easing.linear });
		}, initialState);

		animation.start();

		// Animate for 200ms
		jest.advanceTimersByTime(200);
		expect(animation.state.x.value).toBeLessThan(20);

		// Pause
		animation.pause();
		const valueWhenPaused = animation.state.x.value;

		// Advance time while paused, value should not change
		jest.advanceTimersByTime(500);
		expect(animation.state.x.value).toBe(valueWhenPaused);

		// Resume
		animation.resume();

		// Animate for another 300ms
		jest.advanceTimersByTime(300);
		// Total animated time is 200ms + 300ms = 500ms
		expect(animation.state.x.value).toBeLessThan(50);

		// Finish animation
		jest.advanceTimersByTime(600);
		expect(animation.state.x.value).toBe(100);
	});

	it("should stop the animation and reset state", () => {
		const initialState = { opacity: 0 };
		const animation = create(function* (state) {
			yield* timing(state.opacity, { to: 1, duration: 1000 });
		}, initialState);

		animation.start();

		jest.advanceTimersByTime(500);
		expect(animation.state.opacity.value).not.toBe(0);

		animation.stop();

		// After stop, the state should be reset to initial
		expect(animation.state.opacity.value).toBe(0);

		// Advancing time should do nothing
		jest.advanceTimersByTime(1000);
		expect(animation.state.opacity.value).toBe(0);
	});

	it("should restart the animation", () => {
		const initialState = { value: 0 };
		const animation = create(function* (state) {
			yield* timing(state.value, { to: 1, duration: 1000, easing: Easing.linear });
		}, initialState);

		animation.start();

		jest.advanceTimersByTime(600);
		expect(animation.state.value.value).toBeLessThan(0.6);

		animation.restart();
		// After restart, state should be reset and animation starts over
		expect(animation.state.value.value).toBe(0);

		jest.advanceTimersByTime(100);
		expect(animation.state.value.value).toBeLessThan(0.1);
	});

	it("should handle wait correctly", () => {
		const mockFn = jest.fn();
		const animation = create(function* () {
			mockFn("start");
			yield* wait(500);
			mockFn("end");
		});

		animation.start();

		jest.advanceTimersByTime(100);
		expect(mockFn).toHaveBeenCalledWith("start");
		expect(mockFn).not.toHaveBeenCalledWith("end");

		jest.advanceTimersByTime(399);
		expect(mockFn).not.toHaveBeenCalledWith("end");

		jest.advanceTimersByTime(100);
		expect(mockFn).toHaveBeenCalledWith("end");
	});

	it("should handle loop correctly", () => {
		const mockFn = jest.fn();
		const animation = create(
			function* (state) {
				yield* loop(3, function* (i) {
					mockFn(i);
					yield* timing(state.v, { to: i + 1, duration: 100 });
				});
			},
			{ v: 0 },
		);

		animation.start();

		jest.advanceTimersByTime(100);

		// Iteration 0
		expect(mockFn).toHaveBeenCalledWith(0);
		jest.advanceTimersByTime(100);
		expect(animation.state.v.value).toBeLessThan(2);

		// Iteration 1
		expect(mockFn).toHaveBeenCalledWith(1);
		jest.advanceTimersByTime(100);
		expect(animation.state.v.value).toBeLessThan(3);

		// Iteration 2
		jest.advanceTimersByTime(100);
		expect(mockFn).toHaveBeenCalledWith(2);
		jest.advanceTimersByTime(100);
		expect(animation.state.v.value).toBe(3);

		// Should not run a 4th time
		expect(mockFn).toHaveBeenCalledTimes(3);
	});
});
