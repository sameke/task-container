"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TaskOptions {
    constructor() {
        this._cwd = process.cwd();
        this._env = process.env;
    }
    get cwd() {
        return this._cwd;
    }
    set cwd(value) {
        this._cwd = value;
    }
    get env() {
        return this._env;
    }
    set env(value) {
        this._env = value;
    }
    get args() {
        return this._args;
    }
    set args(value) {
        this._args = value;
    }
}
exports.TaskOptions = TaskOptions;
