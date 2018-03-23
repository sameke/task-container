"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const EventEmitter = require("events");
const taskOptions_1 = require("./taskOptions");
const MESSAGE = Symbol();
const ERROR = Symbol();
class TaskRunner extends EventEmitter {
    /**
     * creates new instance of a task runner
     *
     * @param {TaskOptions} options the child_process options for this task runner
     * @param {string[]} options.args the command line args to pass to the spawned node process
     *
     * @see https://nodejs.org/docs/latest/api/child_process.html#child_process_child_process_fork_modulepath_args_options
     */
    constructor(options) {
        super();
        this._childArgs = null;
        this._isFree = true;
        this._isDead = false;
        this._count = 0;
        if (options != null && options.args != null) {
            this._childArgs = options.args;
            delete options.args;
        }
        this._childOptions = Object.assign({}, new taskOptions_1.TaskOptions(), options || {});
        this._setup();
    }
    get isFree() {
        return this._isFree;
    }
    get isDead() {
        return this._isDead;
    }
    get count() {
        return this._count;
    }
    _setup() {
        this._process = child_process_1.fork(require.resolve("./task"), this._childArgs, this._childOptions);
        //listen for messages returned from child_process
        this._process.on('message', (msg) => {
            if (msg.error != null) {
                this.emit(ERROR, msg.error);
            }
            else {
                this.emit(MESSAGE, msg.result);
            }
        });
        //listen for errors returned from child_process
        this._process.on('error', (err) => {
            this.emit(ERROR, err);
        });
        this._process.on('exit', () => {
            this._isDead = true;
            this.emit('exit');
        });
    }
    /**
     * runs the script at the specified path passing the given data
     */
    async start(path, data) {
        if (this._isDead === true) {
            return Promise.reject(new Error('TaskRunner has exited. Please create new task runner'));
        }
        if (this._isFree === true) {
            this._isFree = false;
            return new Promise((resolve, reject) => {
                let options = {
                    script: path,
                    data: data
                };
                //attach one time listeners so that we can callback when task is complete
                this.once(MESSAGE, (result) => {
                    resolve(result);
                    this._count++;
                    this._isFree = true;
                    this.emit('free');
                });
                this.once(ERROR, (err) => {
                    reject(err);
                    this._count++;
                    this._isFree = true;
                    this.emit('free');
                });
                //send the options to our child_process to be executed
                this._process.send(options);
            });
        }
        else {
            return Promise.reject(new Error('TaskRunner is busy, use the TaskContainer to queue up multiple tasks.'));
        }
    }
    stop() {
        if (this._isDead === false) {
            this._process.kill();
            this._process.removeAllListeners();
        }
    }
    /**
     * runs the given script at the specified path passing the given data, and spawning a new TaskRunner with given options.
     * this method is not recommended if starting several tasks, use the TaskContainer.
     * @see TaskRunner.constructor
     *
     * @returns TaskRunner
     */
    static async run(path, data, options) {
        let task = new TaskRunner(options);
        return task.start(path, data).then((r) => {
            task.stop();
            return r;
        }, (error) => {
            task.stop();
            throw error;
        }).catch((ex) => {
            task.stop();
            throw ex;
        });
    }
}
exports.TaskRunner = TaskRunner;
