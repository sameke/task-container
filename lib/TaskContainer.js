const childProcess = require('child_process');
const TaskHandler = require('./TaskHandler');
const EventEmitter = require('events');

const DEFAULT_OPTIONS = {
    maxHandlers: require('os').cpus().length,
    maxCallsPerHandler: Infinity,
    debug: false
};

const DEFAULT_TASK_OPTIONS = {
    env: process.env,
    cwd: process.cwd(),
    stdio: ['ipc']
};

/**
 * manages all task handlers and starting tasks
 */
module.exports = class TaskContainer extends EventEmitter{
    /**
     * constructor
     * @param {Object} options sets container options
     * @param {Number} options.maxHandlers the number of handler process to allow spawning at one time
     * @param {Number} options.maxCallsPerHandlers then number of times to call a handler before recycling the underlying process
     * @param {boolean} options.debug will cause child processes to have the --debug-brk=[port] option added when spawned
     * 
     * @param {Object} taskOptions testing and development use, gives access to the process options passed to the Node child process
     */
    constructor(options, taskOptions) {
        super();       
        this._options = Object.assign({}, DEFAULT_OPTIONS, options);         
        this._taskOptions = Object.assign({}, DEFAULT_TASK_OPTIONS, taskOptions);
        
        this._taskHandlers = [];
        this._taskQueue = [];
        this._taskIdGen = taskIdGenerator();
        this._debugGen = debugPortGenerator();
    }

    /**
     * adds a new task to the task queue. the queue is processed in fifo order
     * @param {string} script the path to the Node script to run
     * @param {Object} data the data objec to pass to the process for running the script
     * @param {Function} callback the callback to be called when the script completes.
     */
    run(script, data, callback) {
        if(script == null) {
            throw new Error('a script path is required');
        }

        if(data instanceof Function) {
            callback = data;
            data = {};
        }
        let taskId = this._taskIdGen.next().value;
        this._taskQueue.push({
            $id: taskId,
            script: script,
            data: data || {},
            callback: callback || (() => {})
        });

        this._processQueue();
        return taskId;
    }

    /**
     * processes the current task queue and starts the next task if a handler is available
     */
    _processQueue() {
        if(this._taskQueue.length > 0) {
            //are there any workers not busy?
            let handler = null;
            for(let hndl of this._taskHandlers) {
                if(hndl.isBusy === false) {
                    handler = hndl;
                }
            }

            if(handler == null) {
                //if we are not at max handler count create another handler otherwise we wait
                if(this._taskHandlers.length < this._options.maxHandlers) {
                    let task = this._taskQueue.shift();
                    
                    let hndlOpts = Object.assign({}, this._options);
                    if(this._options.debug === true) hndlOpts.debugPort = this._debugGen.next().value;
                    let hndl = new TaskHandler(hndlOpts, this._taskOptions);
                    hndl.on('free', () => {
                        this._processQueue();
                    });

                    //pass through any messages from the handlers
                    hndl.on('message', (msg) => {
                        this.emit('message', msg);
                    });
                    this._taskHandlers.push(hndl);
                    hndl.run(task);                    
                }
            } else {
                let task = this._taskQueue.shift();
                handler.run(task);
            }
        }        
    }

    killAll() {
        for(let handler of this._taskHandlers) {
            handler.removeAllListeners();
            handler.kill(false);
        }

        this._taskHandlers = [];
    }
}

function* taskIdGenerator() {
    let id = 0;
    while(true) {
        yield id++;
    }
}

function* debugPortGenerator() {
    let port = 5859;
    while(true) {
        yield port++;
    }
}