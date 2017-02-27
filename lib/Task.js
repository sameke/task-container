/**
 * handles task sent by TaskHandler. Stays alive until killed by bad task or by the handler.
 */
function handle(msg) {    
    try {
        let task = require(msg.script);

        task(msg, (err, result) => {            
            if (err != null) {
                process.send({ error: err.message || err });
            } else {
                process.send({ id: msg.$id, result: result });
            }
        });
    } catch (ex) {        
        process.send({error: ex.message});
    }    
}

process.on('message', (msg) => {
    //ensure we have necessary params
    if (msg.script == null) {
        process.send({ error: 'no script specified'});
    }
    handle(msg);
});