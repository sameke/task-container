const TaskContainer = require('../lib/TaskContainer');

let p = new TaskContainer({maxHandlers: 10, maxCallsPerHandler: 10});
let count = 0;
p.on('message', (msg) => {
        console.log('ignored message received:');
        console.log(msg);
    });

setInterval(() => {
      
    p.run(require.resolve('./testChild'), {test: 'hello world'}, (err, res) => {
        console.log(res);
        //console.log(err);
    });
    count++;

    if(count >= 10) {
        p.killAll();
        count = 0;
    }    
}, 1000);

