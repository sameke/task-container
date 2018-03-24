# task-container
<span style="color: red;">Node task runner. Allows user to create and run Node task in separate process.</style>

# Example
*childTask.js*
```javascript
module.exports = (data, callback) => {
  setTimeout(() => {
    callback(null, data);
  }, 5000)
}
```  
  
*main.js*
```javascript
const TaskContainer = require('task-container');

let tasker = new TaskContainer();
tasker.run(require.resolve('./childTask'), {test: 'hello world'}, (err, result) => {
  if(error != null) {
    console.log(err);
  } else {
    console.log(result);
  }
});
```

*output*  
`{test:'hello world'}`

# API
### new TaskContainer([options])
**options**  
```javascript
{
  maxHandlers: [number], //default: require('os').cpus().length
  maxCallsPerHandler: [number], //default: Infinity
  debug: [boolean] //default: false
}
```
  
  * maxHandlers  
    
    Number of child processes to spawn for handling tasks. If all child processes are currently busy the task will be queued and handled as soon as a handler is free. Task are processed in FIFO order.
    
  * maxCallsPerHandler
      
    Number of times to call a child task before recycling the process (killing current child process and starting a new one). This can be used to manage memory leaks until they can be fixed.
      
  * debug
  
    Set this to true if you want the handlers to add `--debug-brk=[port]` before each child process. This can be used to attach to the child processes and debug if necessary.
    
### taskContainer.run(script, [data], callback)
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
  
# Advanced  
*To receive messages from the child process that do not trigger the callback function you need to add a ```result.ignore=true``` property to what is passed to ```process.send``` if trying to perform IPC communication.
