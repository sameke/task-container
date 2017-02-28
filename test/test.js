const TaskContainer = require('../lib/TaskContainer');

let p = new TaskContainer({maxHandlers: 10, maxCallsPerHandler: 10});

setInterval(() => {
    p.run(require.resolve('./testChild'), {test: 'hello world'}, (err, res) => {
        console.log(res);
    });
}, 100);