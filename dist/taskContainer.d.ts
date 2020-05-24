/// <reference types="node" />
import { EventEmitter } from 'events';
import { IContainerOptions } from './IContainerOptions';
export declare class TaskContainer extends EventEmitter {
    private _options;
    private readonly _taskQueue;
    private readonly _taskRunners;
    constructor(options?: IContainerOptions);
    run(taskPath: string, data?: any): Promise<any>;
    private processQueue;
    dispose(): void;
}
