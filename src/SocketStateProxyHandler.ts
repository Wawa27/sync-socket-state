import {Adapter} from "socket.io-adapter";

export type SocketState = {
    [key: string]: any;
    id: string;
}

/**
 * Proxy that sends a message to all other sockets when a property is changed.
 */
export default class SocketStateProxyHandler {
    readonly #state: SocketState;
    readonly #adapter: Adapter;

    public constructor(state: SocketState, adapter: Adapter) {
        this.#state = state;
        this.#adapter = adapter;
    }

    public get(target, prop, receiver): any {
        return Reflect.get(target, prop, receiver);
    }

    public set(object, property, value): boolean {
        Reflect.set(object, property, value);

        this.#adapter.serverSideEmit(["sync-socket-state:updateState-" + this.#state.id, property, value]);

        return true;
    }
}
