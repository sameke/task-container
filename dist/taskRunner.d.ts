/// <reference types="node" />
import * as EventEmitter from 'events';
import { TaskOptions } from './taskOptions';
export declare class TaskRunner extends EventEmitter {
    private _childArgs;
    private _isFree;
    private _isDead;
    private _count;
    private _childOptions;
    private _process;
    /**
     * creates new instance of a task runner
     *
     * @param {TaskOptions} options the child_process options for this task runner
     * @param {string[]} options.args the command line args to pass to the spawned node process
     *
     * @see https://nodejs.org/docs/latest/api/child_process.html#child_process_child_process_fork_modulepath_args_options
     */
    constructor(options?: TaskOptions);
    readonly isFree: boolean;
    readonly isDead: boolean;
    readonly count: number;
    private _setup;
    /**
     * runs the script at the specified path passing the given data
     */
    start(path: string, data: any): Promise<any>;
    stop(): void;
    /**
     * runs the given script at the specified path passing the given data, and spawning a new TaskRunner with given options.
     * this method is not recommended if starting several tasks, use the TaskContainer.
     * @see TaskRunner.constructor
     *
     * @returns TaskRunner
     */
    static run(path: string, data: any, options: TaskOptions): Promise<any>;
}
