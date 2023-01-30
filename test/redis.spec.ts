import {Server} from "socket.io";
import {createClient} from "redis";
import {createAdapter} from "@socket.io/redis-adapter";
import SocketStateSynchronizer from "../src/SocketStateSynchronizer";
import {SocketState} from "../src/SocketStateProxyHandler";
import * as assert from "assert";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

describe('Redis adapter', () => {
    const initialState = {
        id: "RedisAdapterTest",
        name: ""
    };

    let state1, state2, state3;
    before(async () => {
        state1 = await startServer(0, structuredClone(initialState));
        state2 = await startServer(0, structuredClone(initialState));
        state3 = await startServer(0, structuredClone(initialState));

        await sleep(500);
    });

    it('should synchronize server1 state', async () => {
        state1.name = "Hello";

        await sleep(500);

        assert.equal(state2.name, "Hello", "Server 2 not synchronized");
        assert.equal(state3.name, "Hello", "Server 3 not synchronized");
    });

    it('should synchronize server2 state', async () => {
        state2.name = "World";

        await sleep(500);

        assert.equal(state1.name, "World", "Server 1 not synchronized");
        assert.equal(state3.name, "World", "Server 3 not synchronized");
    });

    it('should synchronize server3 state', async () => {
        state3.name = "!";

        await sleep(500);

        assert.equal(state1.name, "!", "Server 1 not synchronized");
        assert.equal(state2.name, "!", "Server 2 not synchronized");
    });
});

const startServer = async (port: number, initialState: SocketState): Promise<SocketState> => {
    const io = new Server();

    const pubClient = createClient({url: redisUrl});
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    io.listen(port);

    let adapter = io.of("/").adapter;

    // @ts-ignore
    const socketStateSynchronizer = new SocketStateSynchronizer(adapter);

    return socketStateSynchronizer.synchronize(initialState);
}

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));
