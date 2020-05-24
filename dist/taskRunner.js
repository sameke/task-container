"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRunner = void 0;
const child_process_1 = require("child_process");
const events_1 = require("events");
class TaskRunner extends events_1.EventEmitter {
    constructor() {
        super();
        this._isDead = false;
        this._runCount = 0;
        this._process = child_process_1.fork(require.resolve('./taskProxy'));
        this._process.on('message', (msg) => {
            if (this._currentTask != null) {
                if (msg.error != null) {
                    this._currentTask.cb.reject(new Error(msg.error));
                }
                else {
                    this._currentTask.cb.resolve(msg.result);
                }
                this._currentTask = null;
            }
            else {
                this.emit('error', new Error('received message event with no task available'));
            }
            this.emit('free');
        });
        this._process.on('error', (err) => {
            if (this._currentTask != null) {
                this._currentTask.cb.reject(err);
            }
            else {
                this.emit('error', err);
            }
            this._currentTask = null;
            this.emit('free');
        });
        this._process.on('close', () => {
            this.stop();
        });
        this._process.on('exit', () => {
            this.stop();
        });
    }
    get isFree() {
        return this._currentTask == null;
    }
    get isDead() {
        return this._isDead;
    }
    get count() {
        return this._runCount;
    }
    run(task) {
        if (this._isDead === true) {
            throw new Error('task runner is dead');
        }
        if (this._currentTask == null) {
            this._currentTask = task;
            let proxyOptions = {
                script: this._currentTask.path,
                data: this._currentTask.data
            };
            this._process.send(proxyOptions, (err) => {
                if (err != null) {
                    this._runCount++;
                    if (this._currentTask != null) {
                        this._currentTask.cb.reject(err);
                        this._currentTask = null;
                    }
                    else {
                        this.emit('error', err);
                    }
                    this.emit('free');
                }
            });
        }
        else {
            throw new Error('task runner is currently in use');
        }
    }
    stop() {
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
        }
        catch (ex) {
        }
        this.emit('free');
    }
}
exports.TaskRunner = TaskRunner;
