const TaskContainer = require('../dist/TaskContainer').TaskContainer;

// let tc = new TaskContainer();
// tc.run(require.resolve('./tasks/SayHello')).then(() => {
//     console.log('hello done');
//     tc.dispose();
// }).catch((err) => {
//     console.log(err);
//     tc.dispose();
// });

// let tc2 = new TaskContainer();

// for (let i = 0; i < 1000; i++) {
//     tc2.run(require.resolve('./tasks/printData'), i).then(() => {
//         if (i === 999) {
//             tc2.dispose();
//         }
//     }).catch((err) => {
//         console.log(err);
//     });
// }

// let tc3 = new TaskContainer({ maxTaskRunners: 100 });
// let count = 0;
// for (let i = 0; i < 1000; i++) {
//     tc3.run(require.resolve('./tasks/printDataDelayed'), i).then(() => {
//         count++;
//         if (count === 1000) {
//             tc3.dispose();
//         }
//     });
// }

// let tc4 = new TaskContainer();
// tc4.run(require.resolve('./tasks/callback'), 'this is callback').then(() => {
//     console.log('callback done');
//     tc4.dispose();
// }).catch((err) => {
//     console.log(err);
//     tc4.dispose();
// });

// let tc5 = new TaskContainer();
// tc5.run(require.resolve('./tasks/returnResult')).then((data) => {
//     console.log(`received: ${data}`);
//     tc5.dispose();
// }).catch((err) => {
//     console.log(err);
//     tc5.dispose();
// });

let tc6 = new TaskContainer();

console.log('parent argv:');
console.log(process.argv);
console.log('parent execArgv:');
console.log(process.execArgv);

tc6.run(require.resolve('./tasks/args')).then((data) => {
    tc6.dispose();
}).catch((err) => {
    console.log(err);
    tc6.dispose();
});