function handle(msg) {
    try {
        let task = require(msg.script);
        if (task != null) {
            if (task.length == 1) {
                //passed function returns a promise
                task(msg.data).then((result) => {
                    process.send({ result: result });
                }).catch((err) => {
                    //doing this because Error object does not serialize well
                    if (err instanceof Error) {
                        // @ts-ignore
                        err = err.toJSON();
                    }
                    process.send({ error: err });
                });
            }
            else {
                //passed function expects a callback
                task(msg.data, (err, result) => {
                    if (err != null) {
                        //doing this because Error object does not serialize well
                        if (err instanceof Error) {
                            // @ts-ignore
                            err = err.toJSON();
                        }
                        process.send({ error: err });
                    }
                    else {
                        process.send({ result: result });
                    }
                });
            }
        }
    }
    catch (ex) {
        if (ex instanceof Error) {
            // @ts-ignore
            ex = ex.toJSON();
        }
        process.send({ error: ex });
    }
}
process.on('message', (msg) => {
    //ensure we have necessary params    
    if (msg.script == null || msg.script == '') {
        let err = new Error('no script specified');
        // @ts-ignore
        process.send({ error: err.toJSON() });
    }
    else {
        handle(msg);
    }
});
process.on('uncaughtException', (ex) => {
    if (ex instanceof Error) {
        // @ts-ignore
        ex = ex.toJSON();
    }
    process.send({ error: ex });
});
process.on('unhandledRejection', (ex) => {
    if (ex instanceof Error) {
        // @ts-ignore
        ex = ex.toJSON();
    }
    process.send({ error: ex });
});
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        let obj = {};
        let properties = Object.getOwnPropertyNames(this).forEach((property) => {
            obj[property] = this[property];
        });
        return obj;
    },
    configurable: true,
    writable: true
});
