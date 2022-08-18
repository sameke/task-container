import { TaskContainer } from '../src/TaskContainer';

let taskContainer = new TaskContainer();

let result = await taskContainer.run<string, boolean>('./simple-task', 'hello');

if (result == true) {
    console.log('test passed');
} else {
    console.log('test failed');
}