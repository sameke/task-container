# task-container
Node async task runner. Allows user to create and run Node tasks in seperate process.

The child task is simply a module that exports a default function or a function named `run`. See definition for `Task<T,S>`.

# Example

*myTask.ts*
```typescript
export const run: Task<string, boolean> = async (msg: string): Promise<boolean> => {
    console.log(msg);
    return true;
}
```
**or**

*myTask.ts*
```typescript
export async function run(msg: string): Promise<boolean> {
    console.log(msg);
    return true;
}
```

**or**

*myTask.ts*
```typescript
export default async (msg: string) => {
    console.log(msg);
    return true;
};
```
**then**

*main.ts*
```typescript
import {TasContainer} from '@sameke/task-container';
import path from 'path';

(() => {
    let taskPath = path.join(__dirname, './path/to/module/myTask');
    let taskContainer = new TaskContainer();

    let result = await taskContainer.run<string, boolean>(taskPath, 'hello world'); // prints hello word on a child process

    if (result == true) {
        console.log('task passed'); // prints task passed
    } else {
        console.log('task failed');
    }

    taskContainer.dispose();
})();
```

# API
### new TaskContainer([options])
**options**  
```typescript
{
  maxTaskRunners: [number], //default: 1,
  maxCallsPerTaskRunner: [number], //default: Infinity
}
```
  
  * maxTaskRunners  
    
    Number of child processes to spawn for handling tasks. If all child processes are currently busy the task will be queued and handled as soon as a handler is free. Task are processed in FIFO order.
    
  * maxCallsPerTaskRunner
      
    Number of times to call a child task before recycling the process (killing current child process and starting a new one). This can be used to manage memory leaks until they can be fixed.
  
### taskContainer.run(fullPath, [data])
**fullPath**  
  This is the path to the module you wish to run as a task. This script should export a default async function or an async function named run. See above example and type definition for `Task` (`import {Task} from '@sameke/task-container'`).
  
**data**  
  Any object you wish to be passed to the task. Note that only properties can be passed across process, no functions will be retained.
