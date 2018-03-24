# task-container
Node async task runner. Allows user to create and run Node tasks in seperate process.

The child task should export a function that accepts input data object and a callback as the second parameter or must return a promise.
# Example

*childTask.js w/ callback*
```javascript
module.exports = (data, callback) => {
  setTimeout(() => {
    callback([error], [result]);
  }, 5000)
}
```

*childTask.js w/ promise*
```javascript
module.exports = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([result]);
    }, 5000);
  });  
}
```
  
*main.js*
```javascript
const TaskContainer = require('task-container');
const TaskRunner = require('task-container').TaskRunner;

let tc = new TaskContainer();
tc.run(require.resolve('./childTask'), {test: 'hello world'}).then((result) => {
  console.log(result);
});

//or

(async () => {
  try {
    let result = await tc.run(require.resolve('./childTask'), {test: 'hello world'});
  } catch(ex){
    console.log(ex);
  }
})();

```

# API
### new TaskContainer([options])
**options**  
```javascript
{
  maxTaskRunners: [number], //default: require('os').cpus().length - 1,
  maxCallsPerTaskRunner: [number], //default: Infinity
}
```
  
  * maxTaskRunners  
    
    Number of child processes to spawn for handling tasks. If all child processes are currently busy the task will be queued and handled as soon as a handler is free. Task are processed in FIFO order.
    
  * maxCallsPerTaskRunner
      
    Number of times to call a child task before recycling the process (killing current child process and starting a new one). This can be used to manage memory leaks until they can be fixed.
  
### taskContainer.run(script, [data])
**script**  
  This is the path to the module you wish to run as a task. This script should export a method which takes an object as it's first parameter and a callback as the second.  
  Example:
```javascript
module.exports = (data, callback) => {
  //do work here
  callback([error], [result]);
}
```
  
**data**  
  Object you wish to be passed to the task.  
  
**callback**  
  Method which gets called when task has completed.
  
### taskRunner.run(script, [data])
Works the same as TaskContainer, but is for running a single task.
**do not use to run multiple tasks simultaneously, use TaskContainer**
