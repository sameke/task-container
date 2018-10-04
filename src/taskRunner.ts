import { fork, ChildProcess, ForkOptions } from 'child_process';
import * as EventEmitter from 'events';
import { TaskOptions } from './taskOptions';

const MESSAGE = Symbol();
const ERROR = Symbol();

export class TaskRunner extends EventEmitter {
    private _childArgs: string[] = null;
    private _isFree: boolean = true;
    private _isDead: boolean = false;
    private _count: number = 0;
    private _childOptions: TaskOptions;
    private _process: ChildProcess;

    /**
     * creates new instance of a task runner
     * 
     * @param {TaskOptions} options the child_process options for this task runner
     * @param {string[]} options.args the command line args to pass to the spawned node process
     * 
     * @see https://nodejs.org/docs/latest/api/child_process.html#child_process_child_process_fork_modulepath_args_options
     */
    constructor(options?: TaskOptions) {
        super();
        if (options != null && options.args != null) {
            this._childArgs = options.args;
            delete options.args;
        }

        this._childOptions = <TaskOptions>Object.assign({}, new TaskOptions(), options || {});
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

    private _setup(): void {
        this._process = fork(
            require.resolve("./task"),
            this._childArgs,
            this._childOptions as any
        );

        //listen for messages returned from child_process
        this._process.on('message', (msg: any): void => {
            if (msg.error != null) {
                this.emit(ERROR, msg.error);
            } else {
                this.emit(MESSAGE, msg.result);
            }
        });

        //listen for errors returned from child_process
        this._process.on('error', (err: any): void => {
            this.emit(ERROR, err);
        });

        this._process.on('exit', (): void => {
            this._isDead = true;
            this.emit('exit');
        });
    }

    /**
     * runs the script at the specified path passing the given data
     */
    async start(path: string, data: any): Promise<any> {
        if (this._isDead === true) {
            return Promise.reject(new Error('TaskRunner has exited. Please create new task runner'));
        }

        if (this._isFree === true) {
            this._isFree = false;
            return new Promise((resolve, reject): void => {
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
        } else {
            return Promise.reject(new Error('TaskRunner is busy, use the TaskContainer to queue up multiple tasks.'));
        }
    }

    stop(): void {
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
    public static async run(path: string, data: any, options: TaskOptions) {
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