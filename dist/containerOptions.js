"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ContainerOptions {
    constructor() {
        this._maxCallsPerTaskRunner = Infinity;
        this._maxTaskRunners = require('os').cpus().length - 1;
    }
    get maxCallsPerTaskRunner() {
        return this._maxCallsPerTaskRunner;
    }
    set maxCallsPerTaskRunner(value) {
        this._maxCallsPerTaskRunner = value;
    }
    get maxTaskRunners() {
        return this._maxTaskRunners;
    }
    set maxTaskRunners(value) {
        this._maxTaskRunners = value;
    }
}
exports.ContainerOptions = ContainerOptions;
