import {TaskRunner} from './taskRunner';
import {ContainerOptions} from './containerOptions';

export class TaskContainer {
    private _options: ContainerOptions;
    private _maxRunners: number;
    private _maxCalls: number;
    private _taskRunners: Set<TaskRunner>;
    private _taskQueue: any[];


    public constructor(options?: ContainerOptions) {
        this._options = Object.assign({}, new ContainerOptions(), options || {});
        this._maxRunners = !isNaN(this._options.maxTaskRunners) && this._options.maxTaskRunners > 0 ? this._options.maxTaskRunners : require('os').cpus().length - 1;
        this._maxCalls = !isNaN(this._options.maxCallsPerTaskRunner) && this._options.maxCallsPerTaskRunner > 0 ? this._options.maxCallsPerTaskRunner : Infinity;
        this._taskRunners = new Set();
        this._taskQueue = [];
    }

    public async run(path: string, data: any) {        
        let task = {            
            script: path,
            data: data,
            cb: (function () {
                let self: any = {};
                self.promise = new Promise((resolve, reject) => {
                    self.resolve = resolve;
                    self.reject = reject;
                });
                return self;
            })()
        };
        this._taskQueue.push(task);
        this._processQueue();
        return task.cb.promise;
    }

    private _processQueue() {

        //clean up dead runners or runners which have reached max calls
        for (let tr of [...this._taskRunners].map(v => v)) {
            if (tr.isDead || tr.count >= this._maxCalls) {
                tr.stop(); //stop runner if not dead
                this._taskRunners.delete(tr);
            }
        }

        //are any tasks waiting to be run
        if (this._taskQueue.length > 0) {            
            let runner: TaskRunner = null;

            //use the runner with the lowest count
            let freeRunners = [...this._taskRunners].filter(tr => tr.isFree).sort((tr1, tr2) => {
                return tr1.count == tr2.count ? 0 : (tr1.count > tr2.count ? 1 : -1);
            });

            if (freeRunners.length > 0) {
                runner = freeRunners[0];
            }

            //create new runner if we are not at max
            if (runner == null && this._taskRunners.size < this._maxRunners) {
                runner = new TaskRunner();
                this._taskRunners.add(runner);
            }

            //if runner is null by this point then there is the max number of runners in use... task must wait to be ran
            if (runner != null) {
                let task = this._taskQueue.shift();
                runner.once('free', () => {
                    this._processQueue();
                });
                runner.start(task.script, task.data).then((result) => {                    
                    task.cb.resolve(result);
                }).catch((err) => {
                    task.cb.reject(err);
                });
            }
        }
    }
    
    public stop() {
        for(let tr of this._taskRunners) {
            tr.stop();
        }
    }
}