export class ContainerOptions {
    private _maxCallsPerTaskRunner: number = Infinity;
    private _maxTaskRunners: number = require('os').cpus().length - 1;

    get maxCallsPerTaskRunner() {
        return this._maxCallsPerTaskRunner;
    }

    set maxCallsPerTaskRunner(value: number) {
        this._maxCallsPerTaskRunner = value;
    }

    get maxTaskRunners() {
        return this._maxTaskRunners;
    }

    set maxTaskRunners(value: number) {
        this._maxTaskRunners = value;
    }
}