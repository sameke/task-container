/// <reference types="node" />
import { EventEmitter } from 'events';
import { IInternalTask } from './IInternalTask';
export declare class TaskRunner extends EventEmitter {
    private _isDead;
    private _runCount;
    private _process;
    private _currentTask;
    constructor();
    get isFree(): boolean;
    get isDead(): boolean;
    get count(): number;
    run(task: IInternalTask): void;
    stop(): void;
}
