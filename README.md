# sync-socket-state

Syncs data of a socket.io server in a cluster.
It uses socket.io adapter to sync data between nodes.

## Installation

```bash
npm install sync-socket-state
```

## Usage

Example using a redis adapter.

```js
    const initialState = {
        id: "RedisAdapterTest",
        name: ""
    };

    const io = new Server();

    const pubClient = createClient({url: redisUrl});
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    io.listen(port);

    let adapter = io.of("/").adapter;

    const socketStateSynchronizer = new SocketStateSynchronizer(adapter);

    const state = socketStateSynchronizer.synchronize(initialState);
    
    state.name = "John Doe"; // Updating the state will be broadcasted to all socket.io servers through the adapter.
```
