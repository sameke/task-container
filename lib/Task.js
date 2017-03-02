/**
 * handles task sent by TaskHandler. Stays alive until killed by bad task or by the handler.
 */
function handle(msg) {
    try {
        let task = require(msg.script);
        let id = msg.$id;
        task(msg.data, (err, result) => {
            if (err != null) {
                //doing this because Error object does not serialize well
                if (err instanceof Error) {
                    err = err.toJSON();
                }
                process.send({ id: msg.$id, error: err });
            } else {
                process.send({ id: msg.$id, result: result });
            }
        });
    } catch (ex) {
        process.send({ error: ex.message });
    }
}

process.on('message', (msg) => {
    //ensure we have necessary params
    if (msg.script == null) {
        process.send({ error: 'no script specified' });
    }
    handle(msg);
});

Object.defineProperty(Error.prototype, 'toJSON', {
    value: function() {        
        let obj = {};        
        let properties = Object.getOwnPropertyNames(this).forEach((property) => {
            obj[property] = this[property];
        });

        return obj;
    },
    configurable: true,
    writable: true
});