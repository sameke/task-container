import { EventEmitter } from 'events';
import { IContainerOptions } from './IContainerOptions';
import { IInternalTask } from './IInternalTask';
import { TaskRunner } from './TaskRunner';

export class TaskContainer extends EventEmitter {
    private _options: IContainerOptions;
    private readonly _taskQueue: IInternalTask[] = [];
    private readonly _taskRunners: Set<TaskRunner> = new Set<TaskRunner>();

    public constructor(options?: IContainerOptions) {
        super();
        this._options = options ?? {} as IContainerOptions;
        // set some defaults if not set in options
        if (this._options.maxTaskRunners == null || this._options.maxTaskRunners < 1) {
            this._options.maxTaskRunners = 1;
        }
    }

    /**
     * will quey the specified task file to be run when a task runner is free
     * @param {string} taskPath path to the task which should be run. The task specified must be of type ITask.
     * @param {any} data data to be passed to the task
     */
    public run<T, TResult>(taskPath: string, data?: T): Promise<TResult> {
        let task = {
            path: taskPath,
            data: data,
            cb: (() => {
                let cb: any = {};
                cb.promise = new Promise((resolve, reject) => {
                    cb.resolve = resolve;
                    cb.reject = reject;
                });
                return cb;
            })()
        } as IInternalTask;

        this._taskQueue.push(task);
        this.processQueue();

        return task.cb.promise;
    }

    private processQueue() {
        // clean up any dead task runners
        for (let tr of [...this._taskRunners]) {
            if (tr.isDead === true) {
                tr.removeAllListeners();
                this._taskRunners.delete(tr);
            }

            if (this._options.maxCallsPerRunner != null && this._options.maxCallsPerRunner > 0 && tr.count >= this._options.maxCallsPerRunner) {
                tr.stop();
                this._taskRunners.delete(tr);
            }
        }

        if (this._taskQueue.length > 0) {
            // find an available runner
            let runner: TaskRunner | null = null;

            // use the runner with the lowest count
            for (let r of this._taskRunners) {
                if (r.isFree === true) {
                    if (runner == null) {
                        runner = r;
                    } else if (r.count < runner.count) {
                        runner = r;
                    }
                }
            }

            // create new runner if we are not at max
            if (runner == null && this._taskRunners.size < this._options.maxTaskRunners) {
                runner = new TaskRunner();
                runner.on('free', () => {
                    this.processQueue();
                });

                runner.on('error', (err: Error) => {
                    this.emit('error', err);
                });
                this._taskRunners.add(runner);
            }

            // if runner is null by this point then there is the max number of runners in use... task must wait to be ran otherwise run on found runner
            if (runner != null) {
                let task = this._taskQueue.shift();
                try {
                    runner.run(task);
                } catch (ex) {
                    // issue running the task, place it back on the queue
                    this._taskQueue.unshift(task);
                }
            }
        }
    }

    public dispose(): void {
        for (let tr of this._taskRunners) {
            tr.stop();
        }
    }
}