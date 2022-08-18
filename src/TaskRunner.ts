import { ChildProcess, fork } from 'child_process';
import { EventEmitter } from 'events';
import { IInternalTask } from './IInternalTask';
import { ITaskOptions } from './ITaskOptions';

export class TaskRunner extends EventEmitter {
    private _isDead: boolean = false;
    private _runCount: number = 0;
    private _process: ChildProcess;
    private _currentTask: IInternalTask;

    public constructor() {
        super();

        this._currentTask = null;

        // get the args from parent to pass to child
        let childArgs = [...process.argv.splice(2)];

        this._process = fork(
            require.resolve('./taskProxy'),
            childArgs
        );

        // listen for messages returned from child_process
        this._process.on('message', (msg: any): void => {
            if (this._currentTask != null) {
                if (msg.error != null) {
                    this._currentTask.cb.reject(new Error(msg.error));
                } else {
                    this._currentTask.cb.resolve(msg.result);
                }
                this._currentTask = null;
            } else {
                this.emit('error', new Error('received message event with no task available'));
            }
            this.emit('free');
        });

        // listen for errors returned from child_process
        this._process.on('error', (err: Error): void => {
            if (this._currentTask != null) {
                this._currentTask.cb.reject(err);
            } else {
                this.emit('error', err);
            }
            this._currentTask = null;
            this.emit('free');
        });

        this._process.on('close', () => {
            this.stop();
        });

        this._process.on('exit', (): void => {
            this.stop();
        });
    }

    public get isFree(): boolean {
        return this._currentTask == null;
    }

    public get isDead(): boolean {
        return this._isDead;
    }

    public get count(): number {
        return this._runCount;
    }

    public run(task: IInternalTask): void {
        if (this._isDead === true) {
            throw new Error('task runner is dead');
        }

        if (this._currentTask == null) {
            this._currentTask = task;

            let proxyOptions = {
                script: this._currentTask.path,
                data: this._currentTask.data
            } as ITaskOptions;

            this._process.send(proxyOptions, (err) => {
                if (err != null) {
                    this._runCount++;
                    if (this._currentTask != null) {
                        this._currentTask.cb.reject(err);
                        this._currentTask = null;
                    } else {
                        this.emit('error', err);
                    }
                    this.emit('free');
                }
            });
        } else {
            throw new Error('task runner is currently in use');
        }
    }

    public stop(): void {
        try {
            this._isDead = true;
            if (this._process != null) {
                this._process.removeAllListeners();
                this._process.kill();
            }

            if (this._currentTask != null) {
                this._currentTask.cb.reject(new Error('task runner has failed to run your specified task'));
                this._currentTask = null;
            }
        } catch (ex) {
            // do nothing... process is dead
        }

        this.emit('free');
    }
}