"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskContainer = void 0;
const events_1 = require("events");
const TaskRunner_1 = require("./TaskRunner");
class TaskContainer extends events_1.EventEmitter {
    constructor(options) {
        super();
        this._taskQueue = [];
        this._taskRunners = new Set();
        this._options = options !== null && options !== void 0 ? options : {};
        if (this._options.maxTaskRunners == null || this._options.maxTaskRunners < 1) {
            this._options.maxTaskRunners = 1;
        }
    }
    run(taskPath, data) {
        let task = {
            path: taskPath,
            data: data,
            cb: (() => {
                let cb = {};
                cb.promise = new Promise((resolve, reject) => {
                    cb.resolve = resolve;
                    cb.reject = reject;
                });
                return cb;
            })()
        };
        this._taskQueue.push(task);
        this.processQueue();
        return task.cb.promise;
    }
    processQueue() {
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
            let runner = null;
            for (let r of this._taskRunners) {
                if (r.isFree === true) {
                    if (runner == null) {
                        runner = r;
                    }
                    else if (r.count < runner.count) {
                        runner = r;
                    }
                }
            }
            if (runner == null && this._taskRunners.size < this._options.maxTaskRunners) {
                runner = new TaskRunner_1.TaskRunner();
                runner.on('free', () => {
                    this.processQueue();
                });
                runner.on('error', (err) => {
                    this.emit('error', err);
                });
                this._taskRunners.add(runner);
            }
            if (runner != null) {
                let task = this._taskQueue.shift();
                try {
                    runner.run(task);
                }
                catch (ex) {
                    this._taskQueue.unshift(task);
                }
            }
        }
    }
    dispose() {
        for (let tr of this._taskRunners) {
            tr.stop();
        }
    }
}
exports.TaskContainer = TaskContainer;
