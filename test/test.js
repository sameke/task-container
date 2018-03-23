require('./chai');
const TaskContainer = require('../');
const TaskRunner = require('../').TaskRunner;

//TODO: child_process.fork not working in mocha tests
// describe('TaskContainer', () => {
//     describe('TaskRunner', () => {
//         it('should run single task and return', async (done) => {
//             try {
//                 let result = await TaskRunner.run(require.resolve('./tasks/echo'), {test: 'test'});
//                 expect(result.test).to.equal('test');
//                 done();
//             } catch(ex) {
//                 done(ex);
//             }
//         });
//     });
// });

(async () => {
    console.log('TaskRunner Tests');
    try {
        let result = await TaskRunner.run(require.resolve('./tasks/echo'), { test: 'test' });
        assert(result.test === 'test');
        console.log('echo test successful');
    } catch(ex) {
        console.log(ex);
    }

    console.log('TaskContainer Tests');
    let tc = new TaskContainer();
    try {
        let count = 0;
        for(let i = 0; i < 10; i++) {
            tc.run(require.resolve('./tasks/echo'), {number: i}).then((r) => {
                console.log(`number ${r.number}`);
                count++;
                if(count == 10) {
                    tc.stop();
                }
            });
        }
    } catch(ex) {

    }
})();


