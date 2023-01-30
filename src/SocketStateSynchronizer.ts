import {Adapter} from "socket.io-adapter";
import SocketStateProxyHandler, {SocketState} from "./SocketStateProxyHandler";

/**
 * This class is responsible for synchronizing the state of a socket with all other sockets.
 * It does this by creating a proxy object that sends a message to all other sockets when a property is changed.
 */
export default class SocketStateSynchronizer {
    readonly #adapter: Adapter;

    public constructor(adapter: Adapter) {
        this.#adapter = adapter;
    }

    /**
     * Creates a proxy for the given state, which will automatically sync the state to all clients when it changes.
     * @param initialState The initial state.
     */
    public synchronize(initialState: SocketState): SocketState {
        const socketStateProxyHandler = new SocketStateProxyHandler(initialState, this.#adapter);
        const socketStateProxy = new Proxy(initialState, socketStateProxyHandler);

        this.#adapter.nsp.on("sync-socket-state:updateState-" + initialState["id"], (property, value) => {
            initialState[property] = value;
        });

        return socketStateProxy;
    }
}
