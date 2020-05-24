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

// for (let i = 0; i < 20; i++) {
//     tc2.run(require.resolve('./tasks/printData'), i).then(() => {
//         if (i === 19) {
//             tc2.dispose();
//         }
//     });
// }

// let tc3 = new TaskContainer({ maxTaskRunners: 10 });
// let count = 0;
// for (let i = 0; i < 20; i++) {
//     tc3.run(require.resolve('./tasks/printDataDelayed'), i).then(() => {
//         count++;
//         if (count === 20) {
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

let tc5 = new TaskContainer();
tc5.run(require.resolve('./tasks/returnResult')).then((data) => {
    console.log(`received: ${data}`);
    tc5.dispose();
}).catch((err) => {
    console.log(err);
    tc5.dispose();
});