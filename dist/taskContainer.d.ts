import { ContainerOptions } from './containerOptions';
export declare class TaskContainer {
    private _options;
    private _maxRunners;
    private _maxCalls;
    private _taskRunners;
    private _taskQueue;
    constructor(options?: ContainerOptions);
    run(path: string, data: any): Promise<any>;
    private _processQueue;
    stop(): void;
}
