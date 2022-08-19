import { TaskContainer } from '../src/TaskContainer';
import path from 'path';

let fullPath = path.join(__dirname, './tasks/simple-task');

(async () => {
    // let result = await taskProxy({
    //     script: fullPath,
    //     data: 'benjamin'
    // });

    // console.log(result);

    let taskContainer = new TaskContainer();

    let result = await taskContainer.run<string, boolean>(fullPath, 'hello');

    if (result == true) {
        console.log('test passed');
    } else {
        console.log('test failed');
    }

    taskContainer.dispose();
})();
