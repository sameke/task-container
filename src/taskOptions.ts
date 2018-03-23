export class TaskOptions {
    private _cwd?: string = process.cwd();
    private _env?: any = process.env;
    private _execPath?: string;
    private _execArgv?: string[];
    private _silent?: boolean;
    private _stdio?: any[];
    private _uid?: number;
    private _gid?: number;
    private _windowsVerbatimArguments?: boolean;
    private _args?: string[];

    public get cwd() {
        return this._cwd;
    }

    public set cwd(value: string) {
        this._cwd = value;
    }

    public get env() {
        return this._env;
    }

    public set env(value: string) {
        this._env = value;
    }

    public get args() {
        return this._args;
    }

    public set args(value: string[]) {
        this._args = value;
    }
}