import { EventEmitter } from "../EventEmitter";
import { uuidv4 } from "../string";

export type GraphCallback<S = any> = (state: S) => S | Promise<S>;

export type GraphNodeState = "pending" | "rejected" | "fulfilled" | "loading";

export class GraphEdge {
	state: GraphNodeState = "pending";

	constructor(
		readonly from: PropertyKey,
		readonly to: PropertyKey,
	) {}
}

export class GraphNode<S = any> {
	state: GraphNodeState = "pending";
	result?: S;
	error?: Error;

	constructor(
		readonly name: PropertyKey,
		private readonly ref: GraphCallback<S>,
	) {}

	async run(state: S): Promise<S | undefined> {
		switch (this.state) {
			case "fulfilled":
			case "rejected":
				return this.result;
		}

		try {
			this.state = "loading";
			this.result = await this.ref(state);
			this.state = "fulfilled";
		} catch (error) {
			this.state = "rejected";
			this.error = error as Error;
		}

		return this.result;
	}
}

export interface GraphEventTarget<S = any> {
	data: S;
	state: GraphNodeState;
	current: GraphNode;
	nodes: Record<PropertyKey, GraphNode>;
	edges: GraphEdge[];
}

export class Graph<S = any> extends EventEmitter<{
	start: [GraphEventTarget<S>];
	update: [GraphEventTarget<S>];
	end: [GraphEventTarget<S>];
	fulfilled: [GraphEventTarget<S>];
	successful: [GraphEventTarget<S>];
	rejected: [GraphEventTarget<S>];
	newNode: [PropertyKey];
	newEdge: [PropertyKey, PropertyKey, GraphEdge];
}> {
	static START = Symbol("START");
	static END = Symbol("END");

	private _nodes: Map<PropertyKey, GraphCallback> = new Map();
	private _edges: Array<GraphEdge> = [];

	constructor() {
		super();
	}

	private process() {
		const nodes: Record<PropertyKey, { inputs: PropertyKey[]; outputs: PropertyKey[] }> = {};

		for (const edge of this._edges) {
			const { from, to } = edge;

			if (!(from in nodes)) {
				nodes[from] = { inputs: [], outputs: [] };
			}

			nodes[from].outputs.push(to);

			if (!(to in nodes)) {
				nodes[to] = { inputs: [], outputs: [] };
			}

			nodes[to].inputs.push(from);
		}

		const start: Array<PropertyKey> = Object.keys(nodes).filter((k) => {
			return nodes[k].inputs.length <= 0;
		});

		const hidden: Array<PropertyKey> = [];

		const end: Array<PropertyKey> = Object.keys(nodes).filter((k) => {
			return nodes[k].outputs.length <= 0;
		});

		let current: Array<PropertyKey> = [...start];

		while (current.length > 0) {
			const next: Array<PropertyKey> = [];

			for (const name of current) {
				const node = nodes[name];

				for (const output of node.outputs) {
					const node = nodes[output];

					if (node.outputs.length > 0) {
						next.push(output);
					}

					if (!end.includes(output)) {
						hidden.push(output);
					}
				}
			}

			current = next.filter((v, i, l) => l.indexOf(v) === i);
		}

		const process = [...start, ...hidden, ...end];
		const nodesProcess: Record<PropertyKey, GraphNode> = {};

		return process
			.map((from) => {
				const edges = nodes[from].outputs.map((to) => {
					return new GraphEdge(from, to);
				});

				if (!(from in nodesProcess)) {
					nodesProcess[from] = new GraphNode(from, this._nodes.get(from)!.bind({}));
				}

				return [nodesProcess[from], ...edges];
			})
			.flat();
	}

	addNode(name: PropertyKey, callback: GraphCallback<S>): PropertyKey;
	addNode(callback: GraphCallback<S>): PropertyKey;
	addNode(name: PropertyKey | GraphCallback<S>, callback?: GraphCallback<S>): PropertyKey {
		const id = typeof name === "function" ? uuidv4() : name;
		const node: GraphCallback<S> = typeof name === "function" ? name : (callback as any);
		this._nodes.set(id, node);
		this.emit("newNode", id);
		return id;
	}

	hasEdge(from: PropertyKey, to: PropertyKey): boolean {
		return this._edges.some((e) => e.from === from && e.to === to);
	}

	hasConflictEdge(from: PropertyKey, to: PropertyKey): boolean {
		// Função auxiliar genérica para percorrer o grafo em uma direção
		const traverse = (
			start: PropertyKey,
			// escolha se busca arestas por .from → .to (forward) ou .to → .from (backward)
			forward: boolean,
		): PropertyKey[] => {
			const visitedRoute: PropertyKey[] = [];
			let currentKey = start;

			while (true) {
				// procura próxima aresta na direção desejada
				const nextEdge = this._edges.find((e) => (forward ? e.from === currentKey : e.to === currentKey));
				if (!nextEdge) break;

				// atualiza o nó atual para continuar a travessia
				currentKey = forward ? nextEdge.to : nextEdge.from;
				visitedRoute.push(currentKey);
			}

			return visitedRoute;
		};

		// monta a rota completa: backward de (from → to) + o próprio to + forward
		const backward = traverse(from, false).reverse(); // trás para ordem natural
		const forward = traverse(to, true);

		// concatena: backward … from → to … forward
		const fullRoute = [...backward, from, to, ...forward];

		// detecta duplicatas na rota (ciclo)
		const seen = new Set<PropertyKey>();
		for (const key of fullRoute) {
			if (seen.has(key)) return true;
			seen.add(key);
		}

		return false;
	}

	addEdge(from: PropertyKey, to: PropertyKey): void {
		if (this.hasEdge(from, to)) {
			return;
		}
		if (this.hasConflictEdge(from, to)) {
			throw new Error("Conflict edge!");
		}
		const edge = new GraphEdge(from, to);
		this._edges.push(edge);
		this.emit("newEdge", from, to, edge);
	}

	async run(state: S): Promise<S> {
		const process = this.process();
		const nodes: Record<PropertyKey, GraphNode> = {};
		const edges: GraphEdge[] = process
			.filter((v) => v instanceof GraphEdge)
			.filter((e, i, l) => {
				return l.findIndex((v) => v.from === e.from && v.to === e.to) === i;
			}) as GraphEdge[];

		for (const current of process) {
			if (current instanceof GraphNode) {
				nodes[current.name] = current;
			}
		}

		const updateEdgesState = (from: PropertyKey, state: GraphNodeState) => {
			for (const edge of edges) {
				if (edge.from === from) {
					edge.state = state;
				}
			}
		};

		const getEdgesState = (from: PropertyKey) => {
			const states = edges.filter((edge) => edge.to === from).map((edge) => edge.state) as GraphNodeState[];
			return states.includes("pending") ? "pending" : states.includes("loading") ? "loading" : states.includes("rejected") ? "rejected" : "fulfilled";
		};

		let isStarted = false,
			currentTarget: GraphEventTarget<S> | undefined;

		for (const node of process) {
			if (!(node instanceof GraphNode)) {
				continue;
			}

			if (getEdgesState(node.name) === "rejected") {
				return state;
			}

			if (getEdgesState(node.name) !== "fulfilled") {
				continue;
			}

			const current = nodes[node.name];

			if (current.state === "fulfilled") {
				continue;
			}

			updateEdgesState(node.name, "loading");

			currentTarget = { data: state, state: "loading", current, nodes, edges };

			if (!isStarted) {
				isStarted = true;
				this.emit("start", currentTarget);
			}

			this.emit("update", currentTarget);

			state = (await current.run(state)) || state;

			updateEdgesState(node.name, current.state);

			currentTarget = { data: state, state: current.state, current, nodes, edges };

			this.emit("update", currentTarget);

			if (current.state === "rejected") {
				this.emit("rejected", currentTarget);
				return state;
			}

			this.emit("successful", currentTarget);
		}

		if (currentTarget) {
			this.emit("end", currentTarget);
			this.emit("fulfilled", currentTarget);
		}

		return state;
	}
}
